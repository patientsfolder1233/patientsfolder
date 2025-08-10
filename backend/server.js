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

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, password, clinic_name } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, clinic_name) VALUES ($1, $2, $3) RETURNING *',
      [username, password_hash, clinic_name]
    );
    res.status(201).json({ message: 'User registered', user: result.rows[0] });
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
app.post('/patients', auth, async (req, res) => {
  const p = req.body;
  const clinic_id = req.user.userId;
  try {
    const result = await pool.query(
      `INSERT INTO patients (
        first_name, last_name, gender, dob, contact_number, email, address, blood_group,
        current_medications, allergies, past_surgeries, chronic_diseases, doctor_notes, lab_tests, clinic_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      ) RETURNING *`,
      [
        p.firstName, p.lastName, p.gender, p.dob, p.contactNumber, p.email, p.address, p.bloodGroup,
        JSON.stringify(p.currentMedications), JSON.stringify(p.allergies), JSON.stringify(p.pastSurgeries),
        JSON.stringify(p.chronicDiseases), JSON.stringify(p.doctorNotes), JSON.stringify(p.labTests),
        clinic_id
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
  let query = `SELECT * FROM patients WHERE clinic_id = $1`;
  let params = [clinic_id];
  if (name) {
    query += ` AND (LOWER(first_name || ' ' || last_name) LIKE $2)`;
    params.push(`%${name.toLowerCase()}%`);
  }
  if (dob) {
    query += name ? ` AND dob = $3` : ` AND dob = $2`;
    params.push(dob);
  }
  query += ` ORDER BY created_at DESC`;
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
