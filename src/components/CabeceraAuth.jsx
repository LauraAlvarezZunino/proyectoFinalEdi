import React from 'react';
import { Typography, Box } from '@mui/material'; // Importar Box
// Importa tu imagen. Ajusta la ruta según la ubicación real de tu archivo.
import logoImage from '../assets/logo.png'; 

const CabeceraAuth = ({ esRegistro }) => {
  return (
    <>
      {/* Usamos Box para contener la imagen y aplicar estilos de espaciado */}
      <Box sx={{ mb: 2 }}>
        <img
          src={logoImage}
          alt="Logo de la Aplicación"
          style={{
            // Estilos CSS directos para la imagen
            width: '240px', // Ajusta el tamaño deseado
            height: 'auto',
            display: 'block', // Asegura que el margin se aplique correctamente
          }}
        />
      </Box>
      
      {/* El resto del componente se mantiene igual */}
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