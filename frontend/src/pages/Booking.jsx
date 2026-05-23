import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActionArea,
  Button, Alert, CircularProgress, Stepper, Step, StepLabel,
  TextField, Chip, Avatar
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';
import appointmentService from '../services/appointment.service';

const steps = ['Select Doctor', 'Choose Date & Slot', 'Confirm Booking'];

const Booking = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    doctorService.getAllDoctors()
      .then(data => setDoctors(data || []))
      .catch(() => setError('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot('');
    doctorService.getDoctorSlots(selectedDoctor.id, selectedDate)
      .then(data => setSlots((data || []).filter(s => !s.is_blocked)))
      .catch(() => setError('Failed to load slots'))
      .finally(() => setSlotsLoading(false));
  }, [selectedDoctor, selectedDate]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      await appointmentService.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        notes,
      });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      const detail = Array.isArray(data?.errors) && data.errors.length
        ? data.errors.join(' ')
        : data?.message;
      setError(detail || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box maxWidth={500} mx="auto" mt={8} textAlign="center" p={3}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={1}>Appointment Booked!</Typography>
        <Typography color="text.secondary" mb={1}>
          With <strong>{selectedDoctor?.user?.name}</strong>
        </Typography>
        <Typography color="text.secondary" mb={3}>
          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedSlot}
        </Typography>
        <Box display="flex" gap={2} justifyContent="center">
          <Button variant="outlined" onClick={() => { setSuccess(false); setActiveStep(0); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); }}>
            Book Another
          </Button>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>Book an Appointment</Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Step 1: Select Doctor */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>Choose a doctor</Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={2}>
              {doctors.map(d => (
                <Grid item xs={12} sm={6} md={4} key={d.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      border: selectedDoctor?.id === d.id ? '2px solid' : '1px solid',
                      borderColor: selectedDoctor?.id === d.id ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardActionArea onClick={() => setSelectedDoctor(d)} sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}>
                          <MedicalServicesIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{d.user?.name}</Typography>
                          <Chip label={d.specialty || 'General'} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
                        </Box>
                      </Box>
                      {d.bio && (
                        <Typography variant="body2" color="text.secondary" mt={1} sx={{
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {d.bio}
                        </Typography>
                      )}
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button variant="contained" disabled={!selectedDoctor} onClick={() => setActiveStep(1)} sx={{ borderRadius: 2 }}>
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Date & Slot */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Select date and time with <strong>{selectedDoctor?.user?.name}</strong>
          </Typography>
          <TextField
            type="date" label="Appointment Date" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            inputProps={{ min: minDateStr }}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3, minWidth: 240 }}
          />
          {selectedDate && (
            <>
              <Typography variant="subtitle2" mb={1.5} color="text.secondary">Available time slots</Typography>
              {slotsLoading ? (
                <CircularProgress size={28} />
              ) : slots.length === 0 ? (
                <Alert severity="info">No slots available for this date. Try another day.</Alert>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {slots.map(slot => (
                    <Chip
                      key={slot.id}
                      label={slot.start_time}
                      onClick={() => setSelectedSlot(slot.start_time)}
                      color={selectedSlot === slot.start_time ? 'primary' : 'default'}
                      variant={selectedSlot === slot.start_time ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer', fontWeight: selectedSlot === slot.start_time ? 700 : 400 }}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
          <Box mt={3} display="flex" gap={2} justifyContent="space-between">
            <Button onClick={() => setActiveStep(0)}>Back</Button>
            <Button variant="contained" disabled={!selectedDate || !selectedSlot} onClick={() => setActiveStep(2)} sx={{ borderRadius: 2 }}>
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 3: Confirm */}
      {activeStep === 2 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>Confirm your appointment</Typography>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Doctor</Typography>
                <Typography fontWeight={600}>{selectedDoctor?.user?.name}</Typography>
                <Chip label={selectedDoctor?.specialty} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                <Typography fontWeight={600}>
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
                <Typography fontWeight={600} color="primary.main">{selectedSlot}</Typography>
              </Grid>
            </Grid>
            <Box mt={2}>
              <TextField
                fullWidth multiline rows={3} label="Notes (optional)"
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Any symptoms or reason for visit..."
              />
            </Box>
          </Paper>

          <Box display="flex" gap={2} justifyContent="space-between">
            <Button onClick={() => setActiveStep(1)}>Back</Button>
            <Button variant="contained" onClick={handleBook} disabled={loading} sx={{ borderRadius: 2, px: 4 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Booking;
