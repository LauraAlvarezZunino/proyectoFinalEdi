import React from 'react';
import { TextField } from '@mui/material';

const FormularioRegistro = ({ formData, manejarCambioInput, errorAuth }) => {
  return (
    <>
      <TextField
        margin="normal" required fullWidth id="nombreApellido" label="Nombre y Apellido"
        autoComplete="name" name="nombreApellido"
        value={formData.nombreApellido} onChange={manejarCambioInput}
        error={!!errorAuth && !formData.nombreApellido}
      />
      <TextField
        margin="normal" required fullWidth id="dni" label="DNI"
        autoComplete="off" name="dni" type="number"
        value={formData.dni} onChange={manejarCambioInput}
        error={!!errorAuth && !formData.dni}
      />
      <TextField
        margin="normal" required fullWidth id="telefono" label="Teléfono"
        autoComplete="tel" name="telefono" type="tel"
        value={formData.telefono} onChange={manejarCambioInput}
        error={!!errorAuth && !formData.telefono}
      />
    </>
  );
};

export default FormularioRegistro;