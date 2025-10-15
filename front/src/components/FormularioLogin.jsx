import React from 'react';
import { TextField } from '@mui/material';

const FormularioLogin = ({ formData, manejarCambioInput, errorAuth, esRegistro }) => {
  return (
    <>
      <TextField
        margin="normal" required fullWidth id="email" label="Correo Electrónico"
        autoComplete="email" autoFocus type="email" name="email"
        value={formData.email} onChange={manejarCambioInput}
        error={!!errorAuth && !formData.email}
      />
      <TextField
        margin="normal" required fullWidth name="password" label="Contraseña"
        type="password" id="password" autoComplete={esRegistro ? 'new-password' : 'current-password'}
        value={formData.password} onChange={manejarCambioInput}
        helperText={esRegistro && '4-8 caracteres alfanuméricos.'}
        error={!!errorAuth && !formData.password}
      />
    </>
  );
};

export default FormularioLogin;