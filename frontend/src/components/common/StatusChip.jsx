import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  BOOKED:    { color: 'info',    label: 'Booked' },
  CONFIRMED: { color: 'primary', label: 'Confirmed' },
  COMPLETED: { color: 'success', label: 'Completed' },
  CANCELLED: { color: 'error',   label: 'Cancelled' },
};

const StatusChip = ({ status, size = 'small' }) => {
  const cfg = statusConfig[status] || { color: 'default', label: status };
  return <Chip label={cfg.label} color={cfg.color} size={size} />;
};

export default StatusChip;
