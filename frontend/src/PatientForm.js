import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Divider, IconButton, Chip, Tooltip, Card, CardContent, Dialog } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';

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
  const [readOnly, setReadOnly] = useState(!!patient);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  function normalizePatient(p) {
    if (!p) return initialState;
    return {
      ...initialState,
      id: p.id || p._id || '',
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
      // Fix: always populate doctorNotesList for card rendering
      doctorNotesList: Array.isArray(p.doctorNotesList) ? p.doctorNotesList : (p.doctorNotes ? [p.doctorNotes] : []),
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
      id: form.id || '',
      clinicId: form.clinicId || patient?.clinicId || '',
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
    // Do NOT clear form or reset fields here. Let parent handle it after successful save.
  };

  return (
    <Paper sx={{ p: 3, mb: 4, position: 'relative' }} elevation={4}>
      {/* Modern Edit button at top-right with label - entire button clickable */}
      {readOnly && (
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, px: 1 }}>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 3, boxShadow: 0, bgcolor: 'transparent', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' } }}
          >
            Edit
          </Button>
        </Box>
      )}
      {/* Edit confirmation dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Enable editing for this patient record?</Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setEditDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={() => { setReadOnly(false); setEditDialogOpen(false); }} color="primary" variant="contained">Edit</Button>
          </Box>
        </Box>
      </Dialog>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required fullWidth InputProps={{ readOnly }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required fullWidth InputProps={{ readOnly }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} required fullWidth InputProps={{ readOnly }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} type="email" fullWidth InputProps={{ readOnly }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={form.gender} label="Gender" onChange={handleChange} required disabled={readOnly}>
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
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} required fullWidth InputProps={{ readOnly }} />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Medical History</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth disabled={readOnly}>
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
                  <TextField size="small" value={inputs.medication} onChange={e => setInputs({ ...inputs, medication: e.target.value })} placeholder="Add medication" disabled={readOnly} />
                  <IconButton color="primary" onClick={() => handleAddList('currentMedications', inputs.medication)} disabled={readOnly}><AddCircleOutlineIcon /></IconButton>
                </Box>
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {(showAllChips.currentMedications ? form.currentMedications : form.currentMedications.slice(0, CHIP_DISPLAY_LIMIT)).map((m, idx) => (
                    <Chip key={idx} label={m} onDelete={readOnly ? undefined : () => handleDeleteList('currentMedications', idx)} color="primary" />
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
                  <TextField size="small" value={inputs.allergy} onChange={e => setInputs({ ...inputs, allergy: e.target.value })} placeholder="Add allergy" disabled={readOnly} />
                  <IconButton color="primary" onClick={() => handleAddList('allergies', inputs.allergy)} disabled={readOnly}><AddCircleOutlineIcon /></IconButton>
                </Box>
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {(showAllChips.allergies ? form.allergies : form.allergies.slice(0, CHIP_DISPLAY_LIMIT)).map((a, idx) => (
                    <Chip key={idx} label={a} onDelete={readOnly ? undefined : () => handleDeleteList('allergies', idx)} color="primary" />
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
              <TextField size="small" value={inputs.surgery} onChange={e => setInputs({ ...inputs, surgery: e.target.value })} placeholder="Add surgery" disabled={readOnly} />
              <IconButton color="primary" onClick={() => handleAddList('pastSurgeries', inputs.surgery)} disabled={readOnly}><AddCircleOutlineIcon /></IconButton>
            </Box>
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {(showAllChips.pastSurgeries ? form.pastSurgeries : form.pastSurgeries.slice(0, CHIP_DISPLAY_LIMIT)).map((s, idx) => (
                <Chip key={idx} label={s} onDelete={readOnly ? undefined : () => handleDeleteList('pastSurgeries', idx)} color="primary" />
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
              <TextField size="small" value={inputs.disease} onChange={e => setInputs({ ...inputs, disease: e.target.value })} placeholder="Add disease" disabled={readOnly} />
              <IconButton color="primary" onClick={() => handleAddList('chronicDiseases', inputs.disease)} disabled={readOnly}><AddCircleOutlineIcon /></IconButton>
            </Box>
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {(showAllChips.chronicDiseases ? form.chronicDiseases : form.chronicDiseases.slice(0, CHIP_DISPLAY_LIMIT)).map((d, idx) => (
                <Chip key={idx} label={d} onDelete={readOnly ? undefined : () => handleDeleteList('chronicDiseases', idx)} color="primary" />
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
              value={inputs.visitDate || ''}
              onChange={e => setInputs({ ...inputs, visitDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Doctor Name" name="doctorName" value={inputs.doctorName || ''} onChange={e => setInputs({ ...inputs, doctorName: e.target.value })} fullWidth disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Diagnosis" name="diagnosis" value={inputs.diagnosis || ''} onChange={e => setInputs({ ...inputs, diagnosis: e.target.value })} fullWidth disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Treatment Plan" name="treatmentPlan" value={inputs.treatmentPlan || ''} onChange={e => setInputs({ ...inputs, treatmentPlan: e.target.value })} fullWidth multiline minRows={3} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color="primary" onClick={() => {
              if (inputs.visitDate && inputs.doctorName && inputs.diagnosis && inputs.treatmentPlan) {
                setForm({
                  ...form,
                  doctorNotesList: [
                    ...(form.doctorNotesList || []),
                    {
                      visitDate: inputs.visitDate,
                      doctorName: inputs.doctorName,
                      diagnosis: inputs.diagnosis,
                      treatmentPlan: inputs.treatmentPlan
                    }
                  ]
                });
                setInputs({ ...inputs, visitDate: '', doctorName: '', diagnosis: '', treatmentPlan: '' });
              }
            }} disabled={readOnly}><AddCircleOutlineIcon /></IconButton>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {(form.doctorNotesList || []).map((note, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2">Visit Date: {note.visitDate}</Typography>
                <Typography variant="subtitle2">Doctor: {note.doctorName}</Typography>
                <Typography variant="subtitle2">Diagnosis: {note.diagnosis}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>Treatment Plan: {note.treatmentPlan}</Typography>
                {!readOnly && (
                  <IconButton color="error" size="small" onClick={() => {
                    setForm({ ...form, doctorNotesList: form.doctorNotesList.filter((_, i) => i !== idx) });
                  }}><DeleteIcon /></IconButton>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Lab Test Results</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField label="Lab Test Name" size="small" value={inputs.labTestName} onChange={e => setInputs({ ...inputs, labTestName: e.target.value })} fullWidth disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Lab Test Result" size="small" value={inputs.labTestResult} onChange={e => setInputs({ ...inputs, labTestResult: e.target.value })} fullWidth disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Lab Test Date" size="small" type="date" value={inputs.labTestDate} onChange={e => setInputs({ ...inputs, labTestDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color="primary" onClick={handleAddLabTest} disabled={readOnly}><AddCircleOutlineIcon /></IconButton>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {form.labTests.map((test, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2">Test Name: {test.name}</Typography>
                <Typography variant="subtitle2">Result: {test.result}</Typography>
                <Typography variant="subtitle2">Date: {test.date}</Typography>
                {/* No delete/edit for lab tests in readOnly mode */}
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
