import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Divider, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const initialState = {
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
  doctorNotes: {
    visitDate: '',
    doctorName: '',
    diagnosis: '',
    treatmentPlan: ''
  },
  labTests: []
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

function PatientForm({ onSave, patient }) {
  const [form, setForm] = useState(patient || initialState);
  const [inputs, setInputs] = useState({
    medication: '',
    allergy: '',
    surgery: '',
    disease: '',
    labTestName: '',
    labTestResult: '',
    labTestDate: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDoctorNotesChange = (e) => {
    setForm({ ...form, doctorNotes: { ...form.doctorNotes, [e.target.name]: e.target.value } });
  };

  const handleAddList = (field, value) => {
    if (value) {
      setForm({ ...form, [field]: [...form[field], value] });
      setInputs({ ...inputs, [field]: '' });
    }
  };

  const handleDeleteList = (field, idx) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) });
  };

  const handleAddLabTest = () => {
    if (inputs.labTestName && inputs.labTestResult && inputs.labTestDate) {
      setForm({
        ...form,
        labTests: [
          ...form.labTests,
          {
            name: inputs.labTestName,
            result: inputs.labTestResult,
            date: inputs.labTestDate
          }
        ]
      });
      setInputs({ ...inputs, labTestName: '', labTestResult: '', labTestDate: '' });
    }
  };

  const handleDeleteLabTest = (idx) => {
    setForm({ ...form, labTests: form.labTests.filter((_, i) => i !== idx) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm(initialState);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }} elevation={4}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} type="email" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={form.gender} label="Gender" onChange={handleChange} required>
                {genders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} required fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} required fullWidth />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Medical History</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select name="bloodGroup" value={form.bloodGroup} label="Blood Group" onChange={handleChange}>
                {bloodGroups.map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography variant="subtitle2">Current Medications</Typography>
                <Box display="flex" gap={1}>
                  <TextField size="small" value={inputs.medication} onChange={e => setInputs({ ...inputs, medication: e.target.value })} placeholder="Add medication" />
                  <IconButton color="primary" onClick={() => handleAddList('currentMedications', inputs.medication)}><AddCircleOutlineIcon /></IconButton>
                </Box>
                <Box mt={1}>
                  {form.currentMedications.map((m, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1}>
                      <Typography>{m}</Typography>
                      <IconButton size="small" onClick={() => handleDeleteList('currentMedications', idx)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2">Allergies</Typography>
                <Box display="flex" gap={1}>
                  <TextField size="small" value={inputs.allergy} onChange={e => setInputs({ ...inputs, allergy: e.target.value })} placeholder="Add allergy" />
                  <IconButton color="primary" onClick={() => handleAddList('allergies', inputs.allergy)}><AddCircleOutlineIcon /></IconButton>
                </Box>
                <Box mt={1}>
                  {form.allergies.map((a, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1}>
                      <Typography>{a}</Typography>
                      <IconButton size="small" onClick={() => handleDeleteList('allergies', idx)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Past Surgeries</Typography>
            <Box display="flex" gap={1}>
              <TextField size="small" value={inputs.surgery} onChange={e => setInputs({ ...inputs, surgery: e.target.value })} placeholder="Add surgery" />
              <IconButton color="primary" onClick={() => handleAddList('pastSurgeries', inputs.surgery)}><AddCircleOutlineIcon /></IconButton>
            </Box>
            <Box mt={1}>
              {form.pastSurgeries.map((s, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <Typography>{s}</Typography>
                  <IconButton size="small" onClick={() => handleDeleteList('pastSurgeries', idx)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Chronic Diseases</Typography>
            <Box display="flex" gap={1}>
              <TextField size="small" value={inputs.disease} onChange={e => setInputs({ ...inputs, disease: e.target.value })} placeholder="Add disease" />
              <IconButton color="primary" onClick={() => handleAddList('chronicDiseases', inputs.disease)}><AddCircleOutlineIcon /></IconButton>
            </Box>
            <Box mt={1}>
              {form.chronicDiseases.map((d, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <Typography>{d}</Typography>
                  <IconButton size="small" onClick={() => handleDeleteList('chronicDiseases', idx)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Doctor's Notes</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField label="Visit Date" name="visitDate" type="date" value={form.doctorNotes.visitDate} onChange={handleDoctorNotesChange} InputLabelProps={{ shrink: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Doctor Name" name="doctorName" value={form.doctorNotes.doctorName} onChange={handleDoctorNotesChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Diagnosis" name="diagnosis" value={form.doctorNotes.diagnosis} onChange={handleDoctorNotesChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Treatment Plan" name="treatmentPlan" value={form.doctorNotes.treatmentPlan} onChange={handleDoctorNotesChange} fullWidth />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Lab Test Results</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField label="Lab Test Name" size="small" value={inputs.labTestName} onChange={e => setInputs({ ...inputs, labTestName: e.target.value })} fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Lab Test Result" size="small" value={inputs.labTestResult} onChange={e => setInputs({ ...inputs, labTestResult: e.target.value })} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Lab Test Date" size="small" type="datetime-local" value={inputs.labTestDate} onChange={e => setInputs({ ...inputs, labTestDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color="primary" onClick={handleAddLabTest}><AddCircleOutlineIcon /></IconButton>
          </Grid>
        </Grid>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableBody>
              {form.labTests.map((test, idx) => (
                <TableRow key={idx}>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>{test.result}</TableCell>
                  <TableCell>{test.date}</TableCell>
                  <TableCell><IconButton size="small" onClick={() => handleDeleteLabTest(idx)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" gap={2} mt={3}>
          <Button type="submit" variant="contained" color="primary">Save</Button>
          <Button type="button" variant="outlined" color="secondary" onClick={() => setForm(initialState)}>Clear</Button>
        </Box>
      </form>
    </Paper>
  );
}

export default PatientForm;
