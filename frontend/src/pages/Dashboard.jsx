import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, CircularProgress, Alert,
  Tabs, Tab, Button
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointment.service';
import AppointmentCard from '../components/appointment/AppointmentCard';
import SuperAdminDashboard from './SuperAdminDashboard';

const StatCard = ({ icon, label, value, color }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderLeft: `4px solid`, borderColor: color }}>
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box sx={{ color }}>{icon}</Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  </Paper>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const fetchAppointments = useCallback(async () => {
    if (isSuperAdmin) return;
    setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  if (isSuperAdmin) return <SuperAdminDashboard />;

  const counts = {
    all: appointments.length,
    booked: appointments.filter(a => a.status === 'BOOKED').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab.toUpperCase());

  return (
    <Box maxWidth={1100} mx="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Welcome back, {user?.name?.split(' ')[0]} 👋</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        {user?.role === 'CUSTOMER' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/book')} sx={{ borderRadius: 2 }}>
            Book Appointment
          </Button>
        )}
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CalendarMonthIcon />} label="Total" value={counts.all} color="#1976d2" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PendingIcon />} label="Booked" value={counts.booked} color="#ed6c02" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon />} label="Completed" value={counts.completed} color="#2e7d32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CancelIcon />} label="Cancelled" value={counts.cancelled} color="#d32f2f" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box px={2} pt={1}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label={`All (${counts.all})`} value="all" />
            <Tab label={`Booked (${counts.booked})`} value="booked" />
            <Tab label={`Confirmed (${counts.confirmed})`} value="confirmed" />
            <Tab label={`Completed (${counts.completed})`} value="completed" />
            <Tab label={`Cancelled (${counts.cancelled})`} value="cancelled" />
          </Tabs>
        </Box>

        <Box p={2}>
          {loading && <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && filtered.length === 0 && (
            <Box textAlign="center" py={5}>
              <Typography color="text.secondary">No appointments found.</Typography>
              {user?.role === 'CUSTOMER' && (
                <Button variant="contained" sx={{ mt: 2, borderRadius: 2 }} onClick={() => navigate('/book')}>
                  Book Your First Appointment
                </Button>
              )}
            </Box>
          )}
          <Grid container spacing={2}>
            {filtered.map(appt => (
              <Grid item xs={12} sm={6} md={4} key={appt.id}>
                <AppointmentCard appointment={appt} onUpdate={fetchAppointments} userRole={user?.role} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
