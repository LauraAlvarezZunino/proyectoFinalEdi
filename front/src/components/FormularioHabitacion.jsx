import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FormularioHabitacion = ({ habitacion, onChange, isEdit = false }) => {
  const tiposHabitacion = ['Simple', 'Doble', 'Familiar'];
 

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="numero"
          name="numero"
          label="Número de Habitación"
          value={habitacion.numero || ''}
          onChange={onChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel id="tipo-label">Tipo</InputLabel>
          <Select
            labelId="tipo-label"
            id="tipo"
            name="tipo"
            value={habitacion.tipo || ''}
            label="Tipo"
            onChange={onChange}
            sx={{ minWidth: 120 }}
          >
            {tiposHabitacion.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="precio"
          name="precio"
          label="Precio por Noche"
          type="number"
          value={habitacion.precio || ''}
          onChange={onChange}
          required
          InputProps={{
            startAdornment: '$',
          }}
        />
      </Grid>

      {!isEdit && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="estado-label">Estado Inicial</InputLabel>
            <Select
              labelId="estado-label"
              id="estado"
              name="estado"
              value={habitacion.estado || 'Disponible'}
              label="Estado Inicial"
              onChange={onChange}
              disabled
            >
              <MenuItem value="Disponible">
                Disponible (calculado automáticamente según reservas)
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}

      {isEdit && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              id="estado"
              name="estado"
              value={habitacion.estado || 'Disponible'}
              label="Estado"
              onChange={onChange}
              disabled
            >
              <MenuItem value="Disponible">
                Disponible (calculado automáticamente según reservas)
              </MenuItem>
              <MenuItem value="Ocupada">
                Ocupada (calculado automáticamente según reservas)
              </MenuItem>
              <MenuItem value="Mantenimiento">
                Mantenimiento (solo editable por admin)
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
  </Grid>
  );
};

export default FormularioHabitacion;