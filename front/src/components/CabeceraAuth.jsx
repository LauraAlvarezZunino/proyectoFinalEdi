import React from 'react';
import { Typography, Box } from '@mui/material'; 
import logoImage from '../assets/logo.png'; 

const CabeceraAuth = ({ esRegistro }) => {
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <img
          src={logoImage}
          alt="Logo de la Aplicación"
          style={{
            width: '240px', 
            height: 'auto',
            display: 'block', 
          }}
        />
      </Box>
  
      <Typography
        component="h1"
        variant="h5"
        sx={{
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '1.875rem' },
          textAlign: 'center'
        }}
      >
        {esRegistro ? 'Crea tu Cuenta' : 'Iniciar Sesión'}
      </Typography>
    </>
  );
};

export default CabeceraAuth;