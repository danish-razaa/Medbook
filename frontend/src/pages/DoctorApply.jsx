import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Link, InputAdornment, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../services/auth.service';

const DoctorApply = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialty: '', license_number: '', bio: '',
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError('License document must be a PDF, JPG, or PNG file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('License document is too large (max 5 MB).');
      return;
    }
    setError('');
    setLicenseFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!licenseFile) { setError('Please upload your medical license document.'); return; }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('license_document', licenseFile);
      await authService.applyAsDoctor(data);
      setSubmitted(true);
    } catch (err) {
      const res = err.response?.data;
      const detail = Array.isArray(res?.errors) && res.errors.length
        ? res.errors.join(' ')
        : res?.message;
      setError(detail || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
        sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
        <Card sx={{ width: '100%', maxWidth: 480, mx: 2, borderRadius: 3, boxShadow: 6 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} mb={1}>Application Submitted</Typography>
            <Typography color="text.secondary" mb={3}>
              Thank you for applying. A super admin will review your credentials and license.
              You'll be able to sign in once your application is approved.
            </Typography>
            <Button variant="contained" component={RouterLink} to="/login" sx={{ borderRadius: 2 }}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" py={4}
      sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 480, mx: 2, borderRadius: 3, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <MedicalServicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700} color="primary">Doctor Application</Typography>
            <Typography variant="body2" color="text.secondary">
              Apply to practice on MedBook. All applications require super admin approval.
            </Typography>
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
            <TextField fullWidth label="Medical Specialty" name="specialty" value={form.specialty}
              onChange={handleChange} required margin="normal" placeholder="e.g. Cardiology" />
            <TextField fullWidth label="Medical License Number" name="license_number" value={form.license_number}
              onChange={handleChange} required margin="normal" placeholder="e.g. CARD-204813" />
            <TextField fullWidth label="Short Bio (optional)" name="bio" value={form.bio}
              onChange={handleChange} margin="normal" multiline rows={2}
              placeholder="Your experience and qualifications" />

            <Button
              fullWidth variant="outlined" component="label" startIcon={<UploadFileIcon />}
              sx={{ mt: 2, borderRadius: 2, py: 1.2, justifyContent: 'flex-start' }}
            >
              {licenseFile ? licenseFile.name : 'Upload License Document (PDF / JPG / PNG)'}
              <input type="file" hidden accept=".pdf,image/jpeg,image/png" onChange={handleFile} />
            </Button>

            <Button fullWidth type="submit" variant="contained" size="large"
              sx={{ mt: 2, borderRadius: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
            </Button>
          </form>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>Sign in</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorApply;
