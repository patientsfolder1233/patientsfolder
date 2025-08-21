import React, { useState, useEffect } from 'react';
// Use environment variable for backend URL
const API_URL = process.env.REACT_APP_API_URL;
import BackToTopButton from './BackToTopButton';
import axios from 'axios';
import PatientForm from './PatientForm';
import LandingPage from './LandingPage';
import { Container, Typography, Box, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider, Dialog } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  // Back to Top button logic
  const [showTopBtn, setShowTopBtn] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [notFound, setNotFound] = useState(false);
  const [foundSuccess, setFoundSuccess] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [patients, setPatients] = useState([]);
  const [searchName, setSearchName] = useState(''); 
  const [searchDob, setSearchDob] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [formPatient, setFormPatient] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [clinicName, setClinicName] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

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
  const res = await axios.get(`${API_URL}/patients?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('DEBUG: Patient data from backend:', res.data);
      setPatients(res.data);
      // If searching by name and dob, auto-fill form with first match
      if (searchName && searchDob && res.data.length > 0) {
        const p = res.data[0];
        console.log('DEBUG: First patient for form:', p);
        const safeArr = val => Array.isArray(val) ? val : (typeof val === 'string' && val.trim().startsWith('[') ? JSON.parse(val) : []);
        const safeNotesArr = val => Array.isArray(val) ? val : (typeof val === 'string' && val.trim().startsWith('[') ? JSON.parse(val) : (val ? [val] : []));
        setFormPatient({
          id: p.id,
          clinicId: p.clinicId,
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
          doctorNotesList: safeNotesArr(p.doctorNotes),
          doctorNotes: Array.isArray(p.doctorNotes) && p.doctorNotes.length > 0 ? p.doctorNotes[p.doctorNotes.length - 1] : { visitDate: '', doctorName: '', diagnosis: '', treatmentPlan: '' },
          labTests: safeArr(p.labTests),
        });
        setEditingIdx(0);
        setFormKey(formKey + 1);
        setFoundSuccess(true);
        setTimeout(() => setFoundSuccess(false), 1500);
      }
      // Show not found if any search field is used and no results
      if ((searchName || searchDob) && res.data.length === 0) {
        setNotFound(true);
        setTimeout(() => setNotFound(false), 1500);
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
    // Prevent auto-search on reload/login
    // if (token) fetchPatients();
  }, [token]);

  // Called when user clicks Save in PatientForm
  const handleSave = (patient) => {
    setEditingPatient(patient);
    setSaveDialogOpen(true);
  };

  // Called when user confirms save
  const confirmSave = async () => {
    setSaveDialogOpen(false);
    setSaveSuccess(false);
    setSaveError('');
    setSaving(true); // Show saving overlay
    let saveMsg = '';
    try {
      if (editingPatient && editingPatient.id) {
  await axios.put(`${API_URL}/patients/${editingPatient.id}`, editingPatient, {
          headers: { Authorization: `Bearer ${token}` }
        });
        saveMsg = 'Changes saved successfully!';
      } else {
  await axios.post(`${API_URL}/patients`, editingPatient, {
          headers: { Authorization: `Bearer ${token}` }
        });
        saveMsg = 'Patient record created successfully!';
        setPatients([]); // Clear all records after adding new patient
        setSearchName('');
        setSearchDob('');
      }
      // Clear all fields and spaces in the form
      setFormPatient({
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        contactNumber: '',
        email: '',
        address: '',
        bloodGroup: '',
        currentMedications: [],
        allergies: [],
        pastSurgeries: [],
        chronicDiseases: [],
        doctorNotes: { visitDate: '', doctorName: '', diagnosis: '', treatmentPlan: '' },
        labTests: [],
        doctorNotesList: [],
      });
      setEditingIdx(null);
      setFormKey(formKey + 1);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setSaveMessage(saveMsg);
    } catch (err) {
      setSaveError('Failed to save changes.');
      setTimeout(() => setSaveError(''), 2000);
    }
    setEditingPatient(null);
    setSaving(false); // Hide saving overlay
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    const p = patients[idx];
    // Map backend fields to frontend fields
    const doctorNotes = typeof p.doctor_notes === 'object' && p.doctor_notes !== null ? p.doctor_notes : { visitDate: '', doctorName: '', diagnosis: '', treatmentPlan: '' };
    const labTests = Array.isArray(p.lab_tests) ? p.lab_tests : [];
    setFormPatient({
      id: p.id,
      clinicId: p.clinicId,
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
        date: test.date ? test.date : '',
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
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1, md: 4 }, position: 'relative' }}>
      {/* Overlay Alerts: Always fixed and centered on viewport */}
      {(loading || saving) && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
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
      {foundSuccess && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
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
            <Typography variant="h5" color="success.main" mb={2} fontWeight={700} letterSpacing={1}>Found!</Typography>
          </Box>
        </Box>
      )}
      {notFound && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
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
              background: '#f44336',
              boxShadow: '0 2px 8px rgba(244,67,54,0.2)',
              marginBottom: 16,
              position: 'relative',
            }}>
              <svg viewBox="0 0 24 24" style={{ position: 'absolute', top: 12, left: 12, width: 40, height: 40 }}>
                <circle cx="12" cy="12" r="12" fill="#f44336" />
                <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
            <Typography variant="h5" color="error" mb={2} fontWeight={700} letterSpacing={1}>Not found</Typography>
          </Box>
        </Box>
      )}
      {saveSuccess && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
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
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} mb={1} gap={2}>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: { xs: 2, md: 0 } }}>
          <img src={`${process.env.PUBLIC_URL}/logo.ico`} alt="Clinic logo" style={{ height: 28, width: 28, objectFit: 'contain' }} />
          <Typography variant="h5" fontWeight={700} color="#1976d2">Patient Folder</Typography>
        </Box>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} width={{ xs: '100%', sm: 'auto' }}>
          <TextField
            label="Search by Full Name"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 180 } }}
            fullWidth={true}
          />
          <TextField
            label="Search by DOB"
            type="text"
            value={searchDob}
            onChange={e => setSearchDob(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: { xs: '100%', sm: 140 } }}
            fullWidth={true}
            placeholder="mm/dd/yyyy"
            onFocus={e => { e.target.type = 'date'; }}
            onBlur={e => { e.target.type = 'text'; }}
          />
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={fetchPatients}
            sx={{
              fontWeight: 700,
              width: { xs: '100%', sm: 'auto' },
              px: { xs: 2, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              borderRadius: 3,
              border: '2px solid #1976d2',
              color: '#1976d2',
              backgroundColor: { sm: '#fff' },
              boxShadow: { sm: 2 },
              '&:hover': {
                backgroundColor: '#e3f2fd',
                borderColor: '#1565c0',
                color: '#1565c0',
              },
            }}
          >
            Search
          </Button>
          <Button variant="contained" color="secondary" onClick={handleClear} sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>Clear</Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" alignItems={{ xs: 'stretch', sm: 'center' }} mb={2} gap={2}>
        <Typography variant="h6" fontWeight={700} color="#1976d2" sx={{ mr: { sm: 2, xs: 0 }, mb: { xs: 2, sm: 0 } }}>
          {clinicName}
        </Typography>
        <Button
          variant="contained"
          color="error"
          sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2, width: { xs: '100%', sm: 'auto' } }}
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
          <Typography variant="h6" mb={2}>Are you sure you want to save changes?</Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setSaveDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={confirmSave} color="primary" variant="contained">Save</Button>
          </Box>
        </Box>
      </Dialog>
      {/* Success/Failure Message */}
      {saveSuccess && (
        <Box sx={{ position: 'fixed', top: 24, right: 24, bgcolor: 'success.main', color: '#fff', p: 2, borderRadius: 2, zIndex: 9999 }}>
          <Typography>{saveMessage}</Typography>
        </Box>
      )}
      {saveError && (
        <Box sx={{ position: 'fixed', top: 24, right: 24, bgcolor: 'error.main', color: '#fff', p: 2, borderRadius: 2, zIndex: 9999 }}>
          <Typography>{saveError}</Typography>
        </Box>
      )}
  {/* Removed table with ID, Name, DOB, Actions from the bottom */}
      <BackToTopButton show={showTopBtn} onClick={handleScrollToTop} />
    </Container>
  );
}

export default App;