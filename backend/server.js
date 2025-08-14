import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

// Utility: convert snake_case to camelCase for frontend
function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      const camel = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      newObj[camel] = toCamel(obj[key]);
    }
    return newObj;
  }
  return obj;
}

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, password, clinic_name } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, clinic_name) VALUES ($1, $2, $3) RETURNING *',
      [username, password_hash, clinic_name]
    );
    res.status(201).json({ message: 'User registered', user: toCamel(result.rows[0]) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, clinic: user.clinic_name }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Middleware to protect routes
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Patient routes
// Update patient record
app.put('/patients/:id', auth, async (req, res) => {
  const patientId = req.params.id;
  const p = req.body;
  const clinic_id = req.user.userId;
  try {
    const result = await pool.query(
      `UPDATE patients SET
        "firstName" = $2, "lastName" = $3, "gender" = $4, "dob" = $5, "contactNumber" = $6, "email" = $7, "address" = $8, "bloodGroup" = $9,
        "currentMedications" = $10, "allergies" = $11, "pastSurgeries" = $12, "chronicDiseases" = $13, "doctorNotes" = $14, "labTests" = $15
      WHERE "id" = $1 AND "clinicId" = $16
      RETURNING *`,
      [
        patientId, p.firstName, p.lastName, p.gender, p.dob, p.contactNumber, p.email, p.address, p.bloodGroup,
        JSON.stringify(p.currentMedications), JSON.stringify(p.allergies), JSON.stringify(p.pastSurgeries),
        JSON.stringify(p.chronicDiseases), JSON.stringify(p.doctorNotes), JSON.stringify(p.labTests),
        clinic_id
      ]
    );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
  res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post('/patients', auth, async (req, res) => {
  const p = req.body;
  const clinic_id = req.user.userId;
  try {
    const result = await pool.query(
      `INSERT INTO patients (
        "clinicId", "firstName", "lastName", "gender", "dob", "contactNumber", "email", "address", "bloodGroup",
        "currentMedications", "allergies", "pastSurgeries", "chronicDiseases", "doctorNotes", "labTests", "createdAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      ) RETURNING *`,
      [
        clinic_id, p.firstName, p.lastName, p.gender, p.dob, p.contactNumber, p.email, p.address, p.bloodGroup,
        JSON.stringify(p.currentMedications), JSON.stringify(p.allergies), JSON.stringify(p.pastSurgeries),
        JSON.stringify(p.chronicDiseases), JSON.stringify(p.doctorNotes), JSON.stringify(p.labTests),
        new Date().toISOString()
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/patients', auth, async (req, res) => {
  const clinic_id = req.user.userId;
  const { name, dob } = req.query;
  let query = `SELECT * FROM patients WHERE "clinicId" = $1`;
  let params = [clinic_id];
  let paramIdx = 2;
  if (name) {
    query += ` AND (LOWER(TRIM("firstName") || ' ' || TRIM("lastName")) LIKE $${paramIdx})`;
    params.push(`%${name.trim().toLowerCase()}%`);
    paramIdx++;
  }
  if (dob) {
    query += ` AND "dob" = $${paramIdx}`;
    params.push(dob);
    paramIdx++;
  }
  query += ` ORDER BY "createdAt" DESC`;
  try {
    const result = await pool.query(query, params);
    // Parse JSON fields for frontend
    function safeParse(val, fallback) {
      if (val === null || val === undefined || val === '') return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    }
    const patients = result.rows.map(row => {
      function parseField(val, fallback) {
        if (val === null || val === undefined) return fallback;
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return fallback;
          }
        }
        return val;
      }
      return {
        ...row,
        currentMedications: parseField(row.currentMedications, []),
        allergies: parseField(row.allergies, []),
        pastSurgeries: parseField(row.pastSurgeries, []),
        chronicDiseases: parseField(row.chronicDiseases, []),
        doctorNotes: parseField(row.doctorNotes, {}),
        labTests: parseField(row.labTests, []),
      };
    });
    res.json(patients);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\u2705 Server running on port ${PORT}`));
