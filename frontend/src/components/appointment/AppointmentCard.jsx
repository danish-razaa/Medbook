import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Box, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import StatusChip from '../common/StatusChip';
import appointmentService from '../../services/appointment.service';

const AppointmentCard = ({ appointment, onUpdate, userRole }) => {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, label: '' });

  const handleAction = async () => {
    setLoading(true);
    try {
      await appointmentService.updateStatus(appointment.id, confirmDialog.action);
      onUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null, label: '' });
    }
  };

  const canCancel = ['BOOKED', 'CONFIRMED'].includes(appointment.status) && userRole === 'CUSTOMER';
  const canConfirm = appointment.status === 'BOOKED' && userRole === 'DOCTOR';
  const canComplete = appointment.status === 'CONFIRMED' && userRole === 'DOCTOR';

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {appointment.doctor?.specialty || appointment.customer?.name || 'Appointment'}
            </Typography>
            <StatusChip status={appointment.status} />
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">{appointment.time_slot}</Typography>
          </Box>

          {(appointment.customer || appointment.doctor) && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {userRole === 'DOCTOR' ? appointment.customer?.name : appointment.doctor?.specialty}
              </Typography>
            </Box>
          )}

          {appointment.notes && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
              "{appointment.notes}"
            </Typography>
          )}

          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            {canCancel && (
              <Button size="small" color="error" variant="outlined"
                onClick={() => setConfirmDialog({ open: true, action: 'CANCELLED', label: 'Cancel Appointment' })}>
                Cancel
              </Button>
            )}
            {canConfirm && (
              <Button size="small" color="primary" variant="contained"
                onClick={() => setConfirmDialog({ open: true, action: 'CONFIRMED', label: 'Confirm Appointment' })}>
                Confirm
              </Button>
            )}
            {canComplete && (
              <Button size="small" color="success" variant="contained"
                onClick={() => setConfirmDialog({ open: true, action: 'COMPLETED', label: 'Mark Complete' })}>
                Complete
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null, label: '' })}>
        <DialogTitle>{confirmDialog.label}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to {confirmDialog.label?.toLowerCase()}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, label: '' })}>Cancel</Button>
          <Button onClick={handleAction} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppointmentCard;
