import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, CircularProgress,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import appointmentService from '../services/appointment.service';
import StatusChip from '../components/common/StatusChip';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAllAppointments(statusFilter ? { status: statusFilter } : {});
      setAppointments(data || []);
    } catch { setError('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = appointments.filter(a => {
    const q = search.toLowerCase();
    return (
      a.customer?.name?.toLowerCase().includes(q) ||
      a.customer?.email?.toLowerCase().includes(q) ||
      a.doctor?.specialty?.toLowerCase().includes(q)
    );
  });

  return (
    <Box maxWidth={1100} mx="auto" p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>All Appointments</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small" placeholder="Search by patient/doctor..." value={search}
          onChange={e => setSearch(e.target.value)} sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="BOOKED">Booked</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{a.customer?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.customer?.email}</Typography>
                  </TableCell>
                  <TableCell>{a.doctor?.specialty || '—'}</TableCell>
                  <TableCell>
                    {new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>{a.time_slot}</TableCell>
                  <TableCell><StatusChip status={a.status} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No appointments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminAppointments;
