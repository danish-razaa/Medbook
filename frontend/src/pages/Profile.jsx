import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Avatar,
  Alert, CircularProgress, Chip, Divider, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service';
import doctorService from '../services/doctor.service';

const roleColors = { SUPER_ADMIN: 'warning', ADMIN: 'error', DOCTOR: 'secondary', CUSTOMER: 'primary' };

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '' });
  const [doctorForm, setDoctorForm] = useState({ specialty: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await userService.getProfile();
        setProfile(p);
        setEditForm({ name: p.name });
        if (user?.role === 'DOCTOR') {
          const dp = await doctorService.getMyProfile();
          setDoctorProfile(dp);
          setDoctorForm({ specialty: dp.specialty || '', bio: dp.bio || '' });
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await userService.updateProfile(editForm);
      if (user?.role === 'DOCTOR') {
        await doctorService.updateMyProfile(doctorForm);
      }
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box maxWidth={700} mx="auto" p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>My Profile</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1976d2, #9c27b0)', p: 4, color: 'white', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 28, fontWeight: 700 }}>
            {profile?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{profile?.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>{profile?.email}</Typography>
            <Chip label={user?.role} size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Box>
        </Box>

        <Box p={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={600}>Account Details</Typography>
            {!editing ? (
              <Button startIcon={<EditIcon />} onClick={() => setEditing(true)} size="small">Edit</Button>
            ) : (
              <Box display="flex" gap={1}>
                <Button onClick={() => setEditing(false)} size="small">Cancel</Button>
                <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} disabled={saving} size="small">
                  {saving ? <CircularProgress size={18} /> : 'Save'}
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Full Name" value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                disabled={!editing} variant={editing ? 'outlined' : 'filled'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={profile?.email || ''} disabled variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Role" value={user?.role || ''} disabled variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Account Status" value={profile?.is_active ? 'Active' : 'Inactive'} disabled variant="filled" />
            </Grid>
          </Grid>

          {user?.role === 'DOCTOR' && doctorProfile && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Doctor Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Specialty" value={doctorForm.specialty}
                    onChange={e => setDoctorForm(p => ({ ...p, specialty: e.target.value }))}
                    disabled={!editing} variant={editing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth multiline rows={3} label="Bio"
                    value={doctorForm.bio}
                    onChange={e => setDoctorForm(p => ({ ...p, bio: e.target.value }))}
                    disabled={!editing} variant={editing ? 'outlined' : 'filled'}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
