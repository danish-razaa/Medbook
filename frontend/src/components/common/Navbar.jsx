import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Menu, MenuItem, Avatar, Chip, Drawer, List, ListItem,
  ListItemText, ListItemButton, useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleColors = { SUPER_ADMIN: 'warning', ADMIN: 'error', DOCTOR: 'secondary', CUSTOMER: 'primary' };

const Navbar = () => {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'CUSTOMER'] },
    { label: 'Book Appointment', path: '/book', roles: ['CUSTOMER'] },
    { label: 'My Schedule', path: '/schedule', roles: ['DOCTOR'] },
    { label: 'All Appointments', path: '/admin/appointments', roles: ['ADMIN'] },
    { label: 'Users', path: '/admin/users', roles: ['ADMIN'] },
    { label: 'Doctor Applications', path: '/admin/applications', roles: ['SUPER_ADMIN'] },
  ];

  const visibleLinks = navLinks.filter(l => !user || l.roles.includes(user.role));

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Toolbar>
        <Typography
          variant="h6" fontWeight={700} sx={{ cursor: 'pointer', color: 'primary.main', flexGrow: isMobile ? 1 : 0, mr: 3 }}
          onClick={() => navigate('/')}
        >
          MedBook
        </Typography>

        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
            {isAuth && visibleLinks.map(link => (
              <Button
                key={link.path}
                onClick={() => navigate(link.path)}
                size="small"
                sx={{
                  color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === link.path ? 700 : 400,
                  borderBottom: location.pathname === link.path ? '2px solid' : 'none',
                  borderRadius: 0,
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        {isAuth ? (
          <Box display="flex" alignItems="center" gap={1}>
            {!isMobile && <Chip label={user?.role} color={roleColors[user?.role] || 'default'} size="small" />}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled><Typography variant="body2">{user?.name}</Typography></MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>My Profile</MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
            </Menu>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
            )}
          </Box>
        ) : (
          <Box display="flex" gap={1}>
            <Button variant="outlined" size="small" onClick={() => navigate('/login')}>Login</Button>
            <Button variant="contained" size="small" onClick={() => navigate('/register')}>Sign Up</Button>
          </Box>
        )}
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }}>
          <List>
            {visibleLinks.map(link => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton onClick={() => { navigate(link.path); setDrawerOpen(false); }}>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
