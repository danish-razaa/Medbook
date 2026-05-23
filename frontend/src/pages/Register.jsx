import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Link, Divider, InputAdornment, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 440, mx: 2, borderRadius: 3, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight={700} color="primary">Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Join MedBook as a patient</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="name" value={form.name}
              onChange={handleChange} required margin="normal" autoFocus />
            <TextField fullWidth label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} required margin="normal" />
            <TextField fullWidth label="Password" name="password" value={form.password}
              onChange={handleChange} required margin="normal" helperText="Minimum 8 characters"
              type={showPass ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(p => !p)} edge="end">
                      {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />
            <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2, borderRadius: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>Sign in</Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Are you a doctor?{' '}
              <Link component={RouterLink} to="/apply-doctor" fontWeight={600}>Apply to practice</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
