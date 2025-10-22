import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // No need to navigate here since logout() already navigates to '/auth'
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Room Service 3.0
        </Typography>
        {user && (
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;