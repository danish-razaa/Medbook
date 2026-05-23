import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Link, Divider, InputAdornment, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      superadmin: { email: 'superadmin@clinic.com', password: 'SuperAdmin@123' },
      admin: { email: 'admin@clinic.com', password: 'Admin@123' },
      doctor: { email: 'sarah@clinic.com', password: 'Doctor@123' },
      customer: { email: 'alice@example.com', password: 'Customer@123' },
    };
    setForm(creds[role]);
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 420, mx: 2, borderRadius: 3, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight={700} color="primary">MedBook</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} required margin="normal" autoFocus />
            <TextField fullWidth label="Password" name="password" value={form.password}
              onChange={handleChange} required margin="normal"
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}><Typography variant="caption" color="text.secondary">Demo accounts</Typography></Divider>

          <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
            {['superadmin', 'admin', 'doctor', 'customer'].map(r => (
              <Button key={r} size="small" variant="outlined" onClick={() => fillDemo(r)}
                sx={{ textTransform: 'capitalize', borderRadius: 2 }}>{r}</Button>
            ))}
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              No account?{' '}
              <Link component={RouterLink} to="/register" fontWeight={600}>Create one</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
