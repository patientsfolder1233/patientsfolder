import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientForm from './PatientForm';
import LandingPage from './LandingPage';
import { Container, Typography, Box, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider, Dialog } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchName, setSearchName] = useState(''); 
  const [searchDob, setSearchDob] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [formPatient, setFormPatient] = useState(null);
  const [formKey, setFormKey] = useState(0);
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
    setLoading(true);
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (searchDob) params.append('dob', searchDob);
    try {
      const res = await axios.get('http://localhost:5000/patients?' + params.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('DEBUG: Patient data from backend:', res.data);
      setPatients(res.data);
      // If searching by name and dob, auto-fill form with first match
      if (searchName && searchDob && res.data.length > 0) {
        const p = res.data[0];
        console.log('DEBUG: First patient for form:', p);
        const safeArr = val => Array.isArray(val) ? val : (typeof val === 'string' && val.trim().startsWith('[') ? JSON.parse(val) : []);
        const safeObj = val => (typeof val === 'object' && val !== null) ? val : (typeof val === 'string' && val.trim().startsWith('{') ? JSON.parse(val) : { visitDate: '', doctorName: '', diagnosis: '', treatmentPlan: '' });
        setFormPatient({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          gender: p.gender || '',
          dob: p.dob ? p.dob.split('T')[0] : '',
          contactNumber: p.contactNumber || '',
          email: p.email || '',
          address: p.address || '',
          bloodGroup: p.bloodGroup || '',
          currentMedications: safeArr(p.currentMedications),
          allergies: safeArr(p.allergies),
          pastSurgeries: safeArr(p.pastSurgeries),
          chronicDiseases: safeArr(p.chronicDiseases),
          doctorNotes: safeObj(p.doctorNotes),
          labTests: safeArr(p.labTests),
        });
        setEditingIdx(0);
        setFormKey(formKey + 1);
      }
    } catch (err) {
      // Optionally show error to user
    }
    setLoading(false);
  };

  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      setToken(storedToken);
    }
    if (token) fetchPatients();
  }, [token]);

  const handleSave = (patient) => {
    setPendingSaveData(patient);
    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (!token) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (editingIdx !== null) {
        const updated = [...patients];
        updated[editingIdx] = pendingSaveData;
        setPatients(updated);
        setEditingIdx(null);
        setFormPatient(null);
      } else {
        await axios.post('http://localhost:5000/patients', pendingSaveData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchPatients();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // Optionally show error
    }
    setSaveDialogOpen(false);
    setPendingSaveData(null);
    setSaving(false);
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    const p = patients[idx];
    // Map backend fields to frontend fields
    const doctorNotes = typeof p.doctor_notes === 'object' && p.doctor_notes !== null ? p.doctor_notes : { visitDate: '', doctorName: '', diagnosis: '', treatmentPlan: '' };
    const labTests = Array.isArray(p.lab_tests) ? p.lab_tests : [];
    setFormPatient({
      firstName: p.first_name || '',
      lastName: p.last_name || '',
      gender: p.gender || '',
      dob: p.dob ? (typeof p.dob === 'string' ? p.dob.split('T')[0] : new Date(p.dob).toISOString().split('T')[0]) : '',
      contactNumber: p.contact_number || '',
      email: p.email || '',
      address: p.address || '',
      bloodGroup: p.blood_group || '',
      currentMedications: Array.isArray(p.current_medications) ? p.current_medications : [],
      allergies: Array.isArray(p.allergies) ? p.allergies : [],
      pastSurgeries: Array.isArray(p.past_surgeries) ? p.past_surgeries : [],
      chronicDiseases: Array.isArray(p.chronic_diseases) ? p.chronic_diseases : [],
      doctorNotes: {
        visitDate: doctorNotes.visitDate || '',
        doctorName: doctorNotes.doctorName || '',
        diagnosis: doctorNotes.diagnosis || '',
        treatmentPlan: doctorNotes.treatmentPlan || '',
      },
      labTests: labTests.map(test => ({
        name: test.name || '',
        result: test.result || '',
        date: test.date ? (typeof test.date === 'string' ? test.date.split('T')[0] : new Date(test.date).toISOString().slice(0,16)) : '',
      })),
    });
    setFormKey(formKey + 1);
  };

  const handleDelete = (idx) => {
    setPatients(patients.filter((_, i) => i !== idx));
    setEditingIdx(null);
    setFormPatient(null);
  };

  const handleClear = () => {
    setClearDialogOpen(true);
  };

  const confirmClear = () => {
    setEditingIdx(null);
    setFormPatient(null);
    setSearchName('');
    setSearchDob('');
    setPatients([]);
    setFormKey(formKey + 1);
    setClearDialogOpen(false);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setClinicName('');
    setPatients([]);
    setFormPatient(null);
    setEditingIdx(null);
    setSearchName('');
    setSearchDob('');
    setLogoutDialogOpen(false);
    window.location.reload();
  };

  if (!token) {
    return <LandingPage onLogin={setToken} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
      {(loading || saving) && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h5" color="primary" mb={2}>{saving ? 'Saving...' : 'Searching...'}</Typography>
            <span className="loader" style={{ width: 48, height: 48, border: '6px solid #1976d2', borderRadius: '50%', borderTop: '6px solid #fff', animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
          </Box>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </Box>
      )}
      {saveSuccess && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <span style={{
              display: 'inline-block',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#4caf50',
              boxShadow: '0 2px 8px rgba(76,175,80,0.2)',
              marginBottom: 16,
              position: 'relative',
            }}>
              <svg viewBox="0 0 24 24" style={{ position: 'absolute', top: 12, left: 12, width: 40, height: 40 }}>
                <circle cx="12" cy="12" r="12" fill="#4caf50" />
                <polyline points="7,13 11,17 17,9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <Typography variant="h5" color="success.main" mb={2} fontWeight={700} letterSpacing={1}>Saved!</Typography>
          </Box>
        </Box>
      )}
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
            type="date"
            value={searchDob}
            onChange={e => setSearchDob(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 140 }}
          />
          <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchPatients} sx={{ fontWeight: 700 }}>Search</Button>
          <Button variant="contained" color="secondary" onClick={handleClear} sx={{ fontWeight: 700 }}>Clear</Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700} color="#1976d2" sx={{ mr: 2 }}>
          {clinicName}
        </Typography>
        <Button
          variant="contained"
          color="error"
          sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2 }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
  <PatientForm key={formKey} onSave={handleSave} patient={formPatient} onClear={handleClear} />
      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Are you sure you want to logout?</Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setLogoutDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={confirmLogout} color="error" variant="contained">Logout</Button>
          </Box>
        </Box>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Are you sure you want to clear all fields?</Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setClearDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={confirmClear} color="secondary" variant="contained">Clear</Button>
          </Box>
        </Box>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Are you sure you want to save this patient record?</Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setSaveDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={confirmSave} color="primary" variant="contained">Save</Button>
          </Box>
        </Box>
      </Dialog>
  {/* Removed table with ID, Name, DOB, Actions from the bottom */}
    </Container>
  );
}

export default App;
