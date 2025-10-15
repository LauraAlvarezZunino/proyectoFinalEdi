import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const BotonSubmit = ({ cargando, validarCampos, esRegistro }) => {
  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      sx={{
        mt: 3,
        mb: 2,
        py: { xs: 1.5, sm: 1.75 },
        fontSize: { xs: '0.9rem', sm: '1rem' }
      }}
      disabled={cargando || !validarCampos()}
    >
      {cargando ? <CircularProgress size={24} color="inherit" /> : (esRegistro ? 'Registrarse' : 'Iniciar Sesión')}
    </Button>
  );
};

export default BotonSubmit;