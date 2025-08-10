import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientForm from './PatientForm';
import LandingPage from './LandingPage';
import { Container, Typography, Box, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  const [token, setToken] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchDob, setSearchDob] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [formPatient, setFormPatient] = useState(null);
  const [clinicName, setClinicName] = useState('');

  // Fetch clinic name from token after login
  React.useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setClinicName(payload.clinic || '');
      } catch {
        setClinicName('');
      }
    }
  }, [token]);

  const fetchPatients = async () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (searchDob) params.append('dob', searchDob);
    const res = await axios.get('http://localhost:5000/patients?' + params.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPatients(res.data);
  };

  React.useEffect(() => {
    if (token) fetchPatients();
  }, [token]);

  const handleSave = async (patient) => {
    if (!token) return;
    if (editingIdx !== null) {
      // For demo, just update locally. For Supabase, send PUT request.
      const updated = [...patients];
      updated[editingIdx] = patient;
      setPatients(updated);
      setEditingIdx(null);
      setFormPatient(null);
    } else {
      await axios.post('http://localhost:5000/patients', patient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPatients();
    }
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setFormPatient(patients[idx]);
  };

  const handleDelete = (idx) => {
    setPatients(patients.filter((_, i) => i !== idx));
    setEditingIdx(null);
    setFormPatient(null);
  };

  const handleClear = () => {
    setEditingIdx(null);
    setFormPatient(null);
    setSearchName('');
    setSearchDob('');
    setPatients([]);
  };

  const handleLogout = () => {
    setToken(null);
    setClinicName('');
    setPatients([]);
    setFormPatient(null);
    setEditingIdx(null);
    setSearch('');
  };

  if (!token) {
    return <LandingPage onLogin={setToken} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4" fontWeight={700} color="#1976d2">Patient Folder</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Search by Full Name"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Search by DOB"
            value={searchDob}
            onChange={e => setSearchDob(e.target.value)}
            size="small"
            placeholder="YYYY-MM-DD"
            sx={{ minWidth: 140 }}
          />
          <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchPatients} sx={{ fontWeight: 700 }}>Search</Button>
          <Button variant="contained" color="secondary" onClick={handleClear} sx={{ fontWeight: 700 }}>Clear</Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <PatientForm onSave={handleSave} patient={formPatient} />
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          variant="contained"
          color="error"
          sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2 }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
  {/* Removed table with ID, Name, DOB, Actions from the bottom */}
    </Container>
  );
}

export default App;
