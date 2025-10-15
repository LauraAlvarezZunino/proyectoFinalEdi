import React from 'react';
import { Link, Grid } from '@mui/material';

const EnlaceToggle = ({ esRegistro, onToggle, onClearError, onResetForm }) => {
  return (
    <Grid container justifyContent="flex-end">
      <Grid>
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            onToggle(!esRegistro);
            onClearError('');
            onResetForm();
          }}
        >
          {esRegistro ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
        </Link>
      </Grid>
    </Grid>
  );
};

export default EnlaceToggle;