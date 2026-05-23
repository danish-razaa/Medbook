import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Button, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Tabs, Tab, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import doctorService from '../services/doctor.service';
import appointmentService from '../services/appointment.service';
import AppointmentCard from '../components/appointment/AppointmentCard';
import { useAuth } from '../context/AuthContext';

const DoctorSchedule = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('appointments');
  const [addDialog, setAddDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slotForm, setSlotForm] = useState({ slot_date: '', start_time: '09:00', end_time: '10:00' });
  const [savingSlot, setSavingSlot] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await doctorService.getMyProfile();
      setDoctorProfile(profile);
      const appts = await appointmentService.getMyAppointments();
      setAppointments(appts || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchSlots = useCallback(async () => {
    if (!doctorProfile) return;
    try {
      const s = await doctorService.getDoctorSlots(doctorProfile.id, selectedDate || undefined);
      setSlots(s || []);
    } catch {}
  }, [doctorProfile, selectedDate]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleAddSlot = async () => {
    setSavingSlot(true);
    setError('');
    try {
      await doctorService.createSlot(slotForm);
      setSuccess('Slot added!');
      setAddDialog(false);
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleToggleBlock = async (slotId, currentlyBlocked) => {
    try {
      await doctorService.toggleSlotBlock(slotId, !currentlyBlocked);
      fetchSlots();
    } catch (err) {
      setError('Failed to update slot');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box maxWidth={1000} mx="auto" p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>My Schedule</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Appointments (${appointments.length})`} value="appointments" />
        <Tab label="Manage Slots" value="slots" />
      </Tabs>

      {tab === 'appointments' && (
        <Grid container spacing={2}>
          {appointments.length === 0 ? (
            <Grid item xs={12}><Alert severity="info">No appointments yet.</Alert></Grid>
          ) : (
            appointments.map(appt => (
              <Grid item xs={12} sm={6} md={4} key={appt.id}>
                <AppointmentCard appointment={appt} onUpdate={fetchData} userRole={user?.role} />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {tab === 'slots' && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <TextField
              type="date" label="Filter by date" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }} size="small"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialog(true)} sx={{ borderRadius: 2 }}>
              Add Slot
            </Button>
          </Box>

          {slots.length === 0 ? (
            <Alert severity="info">No slots found. Add availability slots to accept bookings.</Alert>
          ) : (
            <Grid container spacing={2}>
              {slots.map(slot => (
                <Grid item xs={12} sm={6} md={4} key={slot.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: slot.is_blocked ? 'error.light' : 'divider' }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '12px !important' }}>
                      <Box>
                        <Typography fontWeight={600}>{slot.start_time} – {slot.end_time}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(slot.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Chip
                          label={slot.is_blocked ? 'Blocked' : 'Available'}
                          color={slot.is_blocked ? 'error' : 'success'} size="small"
                        />
                        <Button
                          size="small" variant="outlined"
                          color={slot.is_blocked ? 'success' : 'error'}
                          startIcon={slot.is_blocked ? <LockOpenIcon /> : <BlockIcon />}
                          onClick={() => handleToggleBlock(slot.id, slot.is_blocked)}
                          sx={{ fontSize: 11 }}
                        >
                          {slot.is_blocked ? 'Unblock' : 'Block'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Availability Slot</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField type="date" label="Date" value={slotForm.slot_date}
            onChange={e => setSlotForm(p => ({ ...p, slot_date: e.target.value }))}
            InputLabelProps={{ shrink: true }} inputProps={{ min: minDateStr }} required />
          <TextField type="time" label="Start Time" value={slotForm.start_time}
            onChange={e => setSlotForm(p => ({ ...p, start_time: e.target.value }))}
            InputLabelProps={{ shrink: true }} required />
          <TextField type="time" label="End Time" value={slotForm.end_time}
            onChange={e => setSlotForm(p => ({ ...p, end_time: e.target.value }))}
            InputLabelProps={{ shrink: true }} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSlot} disabled={savingSlot || !slotForm.slot_date}>
            {savingSlot ? <CircularProgress size={20} /> : 'Add Slot'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorSchedule;
