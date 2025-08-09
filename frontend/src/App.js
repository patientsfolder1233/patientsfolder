import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import PatientForm from './PatientForm';

function App() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [formPatient, setFormPatient] = useState(null);

  const fetchPatients = async () => {
    const res = await axios.get('http://localhost:5000/patients?search=' + search);
    setPatients(res.data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSave = async (patient) => {
    if (editingIdx !== null) {
      // For demo, just update locally. For Supabase, send PUT request.
      const updated = [...patients];
      updated[editingIdx] = patient;
      setPatients(updated);
      setEditingIdx(null);
      setFormPatient(null);
    } else {
      await axios.post('http://localhost:5000/patients', patient);
      fetchPatients();
    }
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setFormPatient(patients[idx]);
  };

  const handleDelete = (idx) => {
    // For demo, just update locally. For Supabase, send DELETE request.
    setPatients(patients.filter((_, i) => i !== idx));
    setEditingIdx(null);
    setFormPatient(null);
  };

  const handleClear = () => {
    setEditingIdx(null);
    setFormPatient(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>Patient Folder</Typography>
      <Divider sx={{ mb: 3 }} />
      <PatientForm onSave={handleSave} patient={formPatient} />
      <Box display="flex" alignItems="center" mb={2}>
        <TextField label="Search by Name" value={search} onChange={e => setSearch(e.target.value)} sx={{ mr: 2 }} />
        <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchPatients}>Search</Button>
        <Button variant="text" color="secondary" sx={{ ml: 2 }} onClick={handleClear}>Clear</Button>
      </Box>
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell>{p.firstName}</TableCell>
                <TableCell>{p.lastName}</TableCell>
                <TableCell>{p.gender}</TableCell>
                <TableCell>{p.dob}</TableCell>
                <TableCell>{p.contactNumber}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.address}</TableCell>
                <TableCell>{p.bloodGroup}</TableCell>
                <TableCell>{p.doctorNotes?.doctorName}</TableCell>
                <TableCell>{p.doctorNotes?.diagnosis}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(idx)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
