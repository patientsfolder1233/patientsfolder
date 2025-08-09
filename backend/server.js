import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory patients array for demo. Replace with Supabase integration.
let patients = [];

app.post('/patients', (req, res) => {
  patients.push(req.body);
  res.status(201).json({ message: 'Patient added' });
});

app.get('/patients', (req, res) => {
  const search = req.query.search?.toLowerCase() || '';
  const filtered = patients.filter(p => p.firstName.toLowerCase().includes(search) || p.lastName.toLowerCase().includes(search));
  res.json(filtered);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
