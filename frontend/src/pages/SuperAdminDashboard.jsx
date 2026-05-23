import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, CircularProgress, Alert, Button,
  List, ListItem, ListItemText, Chip, Divider
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import doctorService from '../services/doctor.service';

const StatCard = ({ icon, label, value, color }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderLeft: '4px solid', borderColor: color }}>
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box sx={{ color }}>{icon}</Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  </Paper>
);

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorService.getApplications();
      setDoctors(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctor applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const pending = doctors.filter(d => d.approval_status === 'PENDING');
  const approved = doctors.filter(d => d.approval_status === 'APPROVED');
  const rejected = doctors.filter(d => d.approval_status === 'REJECTED');

  return (
    <Box maxWidth={1100} mx="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Welcome back, {user?.name?.split(' ')[0]} 👋</Typography>
          <Typography variant="body2" color="text.secondary">Doctor onboarding overview</Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/admin/applications')} sx={{ borderRadius: 2 }}>
          Review Applications
        </Button>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<PendingActionsIcon />} label="Pending Applications" value={pending.length} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<VerifiedUserIcon />} label="Active Doctors" value={approved.length} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<CancelIcon />} label="Rejected Applications" value={rejected.length} color="#d32f2f" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box p={2}>
          <Typography variant="subtitle1" fontWeight={700} mb={0.5}>Pending Applications</Typography>
          <Typography variant="body2" color="text.secondary">Doctors waiting for your approval to start practicing.</Typography>
        </Box>
        <Divider />
        <Box p={2}>
          {loading && <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && pending.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">No pending applications. You're all caught up.</Typography>
            </Box>
          )}
          {!loading && !error && pending.length > 0 && (
            <List disablePadding>
              {pending.map(p => (
                <ListItem
                  key={p.id}
                  divider
                  secondaryAction={
                    <Button size="small" variant="outlined" onClick={() => navigate('/admin/applications')}>
                      Review
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>{p.user?.name}</Typography>
                        <Chip label={p.specialty || 'General'} size="small" color="primary" variant="outlined" />
                      </Box>
                    }
                    secondary={`${p.user?.email} • License: ${p.license_number || '—'}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SuperAdminDashboard;
