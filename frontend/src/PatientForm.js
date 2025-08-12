import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Divider, IconButton, Chip, Tooltip, Card, CardContent } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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

function PatientForm({ onSave, patient, onClear }) {
  // For chip overflow
  const CHIP_DISPLAY_LIMIT = 3;
  const [showAllChips, setShowAllChips] = useState({
    currentMedications: false,
    allergies: false,
    pastSurgeries: false,
    chronicDiseases: false,
  });
  const [saveWarning, setSaveWarning] = useState('');
  function normalizePatient(p) {
    if (!p) return initialState;
    // Backend now returns only camelCase fields
    return {
      ...initialState,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      gender: p.gender || '',
      dob: p.dob || '',
      contactNumber: p.contactNumber || '',
      email: p.email || '',
      address: p.address || '',
      bloodGroup: p.bloodGroup || '',
      currentMedications: Array.isArray(p.currentMedications) ? p.currentMedications : [],
      allergies: Array.isArray(p.allergies) ? p.allergies : [],
      pastSurgeries: Array.isArray(p.pastSurgeries) ? p.pastSurgeries : [],
      chronicDiseases: Array.isArray(p.chronicDiseases) ? p.chronicDiseases : [],
      labTests: Array.isArray(p.labTests) ? p.labTests : [],
      doctorNotes: typeof p.doctorNotes === 'object' && p.doctorNotes !== null ? p.doctorNotes : initialState.doctorNotes,
    };
  }
  const [form, setForm] = useState(() => normalizePatient(patient));

  React.useEffect(() => {
    setForm(normalizePatient(patient));
  }, [patient]);
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
    // Validate required fields
    const requiredFields = [
      form.firstName,
      form.lastName,
      form.gender,
      form.dob,
      form.contactNumber,
      form.address
    ];
    if (requiredFields.some(f => !f || f.trim() === '')) {
      setSaveWarning('Please fill all required fields before saving.');
      return;
    }
    setSaveWarning('');
    // Robust: always include any text in array input fields in the saved arrays
    const addIfNotEmpty = (arr, val) => {
      if (val && val.trim() !== '') return [...arr, val.trim()];
      return arr;
    };
    const currentMedications = addIfNotEmpty(form.currentMedications, inputs.medication);
    const allergies = addIfNotEmpty(form.allergies, inputs.allergy);
    const pastSurgeries = addIfNotEmpty(form.pastSurgeries, inputs.surgery);
    const chronicDiseases = addIfNotEmpty(form.chronicDiseases, inputs.disease);
    let labTests = Array.isArray(form.labTests) ? [...form.labTests] : [];
    if (inputs.labTestName && inputs.labTestResult && inputs.labTestDate) {
      labTests = [...labTests, {
        name: inputs.labTestName.trim(),
        result: inputs.labTestResult.trim(),
        date: inputs.labTestDate
      }];
    }
    const patientData = {
      firstName: form.firstName || '',
      lastName: form.lastName || '',
      gender: form.gender || '',
      dob: form.dob || '',
      contactNumber: form.contactNumber || '',
      email: form.email || '',
      address: form.address || '',
      bloodGroup: form.bloodGroup || '',
      currentMedications,
      allergies,
      pastSurgeries,
      chronicDiseases,
      doctorNotes: typeof form.doctorNotes === 'object' && form.doctorNotes !== null ? form.doctorNotes : { visitDate: '', doctorName: '', diagnosis: '', treatmentPlan: '' },
      labTests,
    };
    onSave(patientData);
    setForm(initialState);
    setInputs({
      medication: '',
      allergy: '',
      surgery: '',
      disease: '',
      labTestName: '',
      labTestResult: '',
      labTestDate: ''
    });
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
            <TextField
              label="Date of Birth"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
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
              {/* Chips for Medications */}
              <Box flex={1}>
                <Typography variant="subtitle2">Current Medications</Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField size="small" value={inputs.medication} onChange={e => setInputs({ ...inputs, medication: e.target.value })} placeholder="Add medication" />
                  <IconButton color="primary" onClick={() => handleAddList('currentMedications', inputs.medication)}><AddCircleOutlineIcon /></IconButton>
                </Box>
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {(showAllChips.currentMedications ? form.currentMedications : form.currentMedications.slice(0, CHIP_DISPLAY_LIMIT)).map((m, idx) => (
                    <Chip key={idx} label={m} onDelete={() => handleDeleteList('currentMedications', idx)} color="primary" />
                  ))}
                  {form.currentMedications.length > CHIP_DISPLAY_LIMIT && !showAllChips.currentMedications && (
                    <Tooltip title={form.currentMedications.slice(CHIP_DISPLAY_LIMIT).join(', ')}>
                      <Chip
                        icon={<MoreHorizIcon />}
                        label={`+${form.currentMedications.length - CHIP_DISPLAY_LIMIT} more`}
                        onClick={() => setShowAllChips({ ...showAllChips, currentMedications: true })}
                        color="default"
                      />
                    </Tooltip>
                  )}
                  {form.currentMedications.length > CHIP_DISPLAY_LIMIT && showAllChips.currentMedications && (
                    <Chip
                      label="Show less"
                      onClick={() => setShowAllChips({ ...showAllChips, currentMedications: false })}
                      color="default"
                    />
                  )}
                </Box>
              </Box>
              {/* Chips for Allergies */}
              <Box flex={1}>
                <Typography variant="subtitle2">Allergies</Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField size="small" value={inputs.allergy} onChange={e => setInputs({ ...inputs, allergy: e.target.value })} placeholder="Add allergy" />
                  <IconButton color="primary" onClick={() => handleAddList('allergies', inputs.allergy)}><AddCircleOutlineIcon /></IconButton>
                </Box>
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {(showAllChips.allergies ? form.allergies : form.allergies.slice(0, CHIP_DISPLAY_LIMIT)).map((a, idx) => (
                    <Chip key={idx} label={a} onDelete={() => handleDeleteList('allergies', idx)} color="primary" />
                  ))}
                  {form.allergies.length > CHIP_DISPLAY_LIMIT && !showAllChips.allergies && (
                    <Tooltip title={form.allergies.slice(CHIP_DISPLAY_LIMIT).join(', ')}>
                      <Chip
                        icon={<MoreHorizIcon />}
                        label={`+${form.allergies.length - CHIP_DISPLAY_LIMIT} more`}
                        onClick={() => setShowAllChips({ ...showAllChips, allergies: true })}
                        color="default"
                      />
                    </Tooltip>
                  )}
                  {form.allergies.length > CHIP_DISPLAY_LIMIT && showAllChips.allergies && (
                    <Chip
                      label="Show less"
                      onClick={() => setShowAllChips({ ...showAllChips, allergies: false })}
                      color="default"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          {/* Chips for Surgeries */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Past Surgeries</Typography>
            <Box display="flex" gap={1} alignItems="center">
              <TextField size="small" value={inputs.surgery} onChange={e => setInputs({ ...inputs, surgery: e.target.value })} placeholder="Add surgery" />
              <IconButton color="primary" onClick={() => handleAddList('pastSurgeries', inputs.surgery)}><AddCircleOutlineIcon /></IconButton>
            </Box>
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {(showAllChips.pastSurgeries ? form.pastSurgeries : form.pastSurgeries.slice(0, CHIP_DISPLAY_LIMIT)).map((s, idx) => (
                <Chip key={idx} label={s} onDelete={() => handleDeleteList('pastSurgeries', idx)} color="primary" />
              ))}
              {form.pastSurgeries.length > CHIP_DISPLAY_LIMIT && !showAllChips.pastSurgeries && (
                <Tooltip title={form.pastSurgeries.slice(CHIP_DISPLAY_LIMIT).join(', ')}>
                  <Chip
                    icon={<MoreHorizIcon />}
                    label={`+${form.pastSurgeries.length - CHIP_DISPLAY_LIMIT} more`}
                    onClick={() => setShowAllChips({ ...showAllChips, pastSurgeries: true })}
                    color="default"
                  />
                </Tooltip>
              )}
              {form.pastSurgeries.length > CHIP_DISPLAY_LIMIT && showAllChips.pastSurgeries && (
                <Chip
                  label="Show less"
                  onClick={() => setShowAllChips({ ...showAllChips, pastSurgeries: false })}
                  color="default"
                />
              )}
            </Box>
          </Grid>
          {/* Chips for Diseases */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Chronic Diseases</Typography>
            <Box display="flex" gap={1} alignItems="center">
              <TextField size="small" value={inputs.disease} onChange={e => setInputs({ ...inputs, disease: e.target.value })} placeholder="Add disease" />
              <IconButton color="primary" onClick={() => handleAddList('chronicDiseases', inputs.disease)}><AddCircleOutlineIcon /></IconButton>
            </Box>
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {(showAllChips.chronicDiseases ? form.chronicDiseases : form.chronicDiseases.slice(0, CHIP_DISPLAY_LIMIT)).map((d, idx) => (
                <Chip key={idx} label={d} onDelete={() => handleDeleteList('chronicDiseases', idx)} color="primary" />
              ))}
              {form.chronicDiseases.length > CHIP_DISPLAY_LIMIT && !showAllChips.chronicDiseases && (
                <Tooltip title={form.chronicDiseases.slice(CHIP_DISPLAY_LIMIT).join(', ')}>
                  <Chip
                    icon={<MoreHorizIcon />}
                    label={`+${form.chronicDiseases.length - CHIP_DISPLAY_LIMIT} more`}
                    onClick={() => setShowAllChips({ ...showAllChips, chronicDiseases: true })}
                    color="default"
                  />
                </Tooltip>
              )}
              {form.chronicDiseases.length > CHIP_DISPLAY_LIMIT && showAllChips.chronicDiseases && (
                <Chip
                  label="Show less"
                  onClick={() => setShowAllChips({ ...showAllChips, chronicDiseases: false })}
                  color="default"
                />
              )}
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Doctor's Notes</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Visit Date"
              name="visitDate"
              type="date"
              value={form.doctorNotes.visitDate}
              onChange={handleDoctorNotesChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
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
            <TextField
              label="Lab Test Date"
              size="small"
              type="date"
              value={inputs.labTestDate}
              onChange={e => setInputs({ ...inputs, labTestDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color="primary" onClick={handleAddLabTest}><AddCircleOutlineIcon /></IconButton>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {form.labTests.map((test, idx) => (
            <Card key={idx} sx={{ minWidth: 220, boxShadow: 2, borderRadius: 2, position: 'relative' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
                  {test.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Result: {test.result}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {test.date}
                </Typography>
                <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => handleDeleteLabTest(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Box>
        {saveWarning && (
          <Typography color="error" variant="body2" mb={2}>{saveWarning}</Typography>
        )}
        <Box display="flex" gap={2} mt={3}>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={[
              form.firstName,
              form.lastName,
              form.gender,
              form.dob,
              form.contactNumber,
              form.address
            ].some(f => !f || f.trim() === '')}
          >
            Save
          </Button>
          <Button type="button" variant="outlined" color="secondary" onClick={onClear}>Clear</Button>
        </Box>
      </form>
    </Paper>
  );
}

export default PatientForm;
