import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorApply from './pages/DoctorApply';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import DoctorSchedule from './pages/DoctorSchedule';
import AdminUsers from './pages/AdminUsers';
import AdminAppointments from './pages/AdminAppointments';
import SuperAdminApplications from './pages/SuperAdminApplications';
import { Typography, Button } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f8fafc' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } } },
  },
});

const Unauthorized = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
    <Typography variant="h4">403</Typography>
    <Typography color="text.secondary">You don't have permission to view this page.</Typography>
    <Button variant="contained" href="/dashboard">Go to Dashboard</Button>
  </Box>
);

const NotFound = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
    <Typography variant="h4">404</Typography>
    <Typography color="text.secondary">Page not found.</Typography>
    <Button variant="contained" href="/dashboard">Go Home</Button>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box minHeight="100vh" bgcolor="background.default">
            <Navbar />
            <Box component="main" py={2}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/apply-doctor" element={<DoctorApply />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Shared protected routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute><Dashboard /></PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute><Profile /></PrivateRoute>
                } />

                {/* Customer routes */}
                <Route path="/book" element={
                  <PrivateRoute roles={['CUSTOMER']}><Booking /></PrivateRoute>
                } />

                {/* Doctor routes */}
                <Route path="/schedule" element={
                  <PrivateRoute roles={['DOCTOR']}><DoctorSchedule /></PrivateRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin/users" element={
                  <PrivateRoute roles={['ADMIN']}><AdminUsers /></PrivateRoute>
                } />
                <Route path="/admin/appointments" element={
                  <PrivateRoute roles={['ADMIN']}><AdminAppointments /></PrivateRoute>
                } />

                {/* Super admin routes */}
                <Route path="/admin/applications" element={
                  <PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminApplications /></PrivateRoute>
                } />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
