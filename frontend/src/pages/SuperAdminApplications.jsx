import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, CircularProgress, Button, Chip,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import doctorService from '../services/doctor.service';

const statusColors = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error' };

const SuperAdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionId, setActionId] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState('');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await doctorService.getApplications(statusFilter || undefined);
      setApplications(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const viewLicense = async (id) => {
    try {
      const url = await doctorService.getLicenseBlobUrl(id);
      window.open(url, '_blank', 'noopener');
    } catch {
      setToast('Could not open the license document.');
    }
  };

  const approve = async (id) => {
    setActionId(id);
    try {
      await doctorService.reviewApplication(id, 'APPROVED');
      setToast('Doctor approved.');
      fetchApplications();
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not approve.');
    } finally {
      setActionId('');
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    setActionId(rejectTarget.id);
    try {
      await doctorService.reviewApplication(rejectTarget.id, 'REJECTED', rejectReason.trim());
      setToast('Application rejected.');
      setRejectTarget(null);
      setRejectReason('');
      fetchApplications();
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not reject.');
    } finally {
      setActionId('');
    }
  };

  return (
    <Box maxWidth={1100} mx="auto" p={3}>
      <Typography variant="h5" fontWeight={700} mb={1}>Doctor Applications</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Review and approve doctors before they can practice on MedBook.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <FormControl size="small" sx={{ minWidth: 180, mb: 3 }}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
          <MenuItem value="">All</MenuItem>
        </Select>
      </FormControl>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>License #</TableCell>
                <TableCell>License Doc</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map(app => (
                <TableRow key={app.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{app.user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{app.user?.email}</Typography>
                  </TableCell>
                  <TableCell>{app.specialty || '—'}</TableCell>
                  <TableCell>{app.license_number || '—'}</TableCell>
                  <TableCell>
                    {app.license_document ? (
                      <Button size="small" startIcon={<DescriptionIcon />} onClick={() => viewLicense(app.id)}>
                        View
                      </Button>
                    ) : <Typography variant="caption" color="text.secondary">None</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip label={app.approval_status} size="small" color={statusColors[app.approval_status] || 'default'} />
                    {app.approval_status === 'REJECTED' && app.rejection_reason && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {app.rejection_reason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {app.approval_status !== 'APPROVED' && (
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          size="small" variant="contained" color="success" disableElevation
                          disabled={actionId === app.id}
                          onClick={() => approve(app.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small" variant="outlined" color="error"
                          disabled={actionId === app.id}
                          onClick={() => { setRejectTarget(app); setRejectReason(''); }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject {rejectTarget?.user?.name}'s application</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            The doctor will see this reason when they try to sign in.
          </Typography>
          <TextField
            fullWidth multiline rows={3} autoFocus label="Reason for rejection"
            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button
            variant="contained" color="error" disabled={!rejectReason.trim() || actionId}
            onClick={submitReject}
          >
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default SuperAdminApplications;
