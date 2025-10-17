import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FormularioUsuario = ({ usuario, onChange, isEdit = false, isAdmin = false }) => {
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="nombreApellido"
          name="nombreApellido"
          label="Nombre y Apellido"
          value={usuario.nombre_apellido || ''}
          onChange={onChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="dni"
          name="dni"
          label="DNI"
          value={usuario.dni || ''}
          onChange={onChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="telefono"
          name="telefono"
          label="Teléfono"
          value={usuario.telefono || ''}
          onChange={onChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          type="email"
          value={usuario.email || ''}
          onChange={onChange}
          required
        />
      </Grid>
      {!isEdit && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              value={usuario.password || ''}
              onChange={onChange}
              required
              helperText="Mínimo 6 caracteres"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                id="rol"
                name="rol"
                value={usuario.rol || 'Usuario'}
                label="Rol"
                onChange={onChange}
              >
                <MenuItem value="Usuario">Usuario</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </>
      )}
      {isEdit && isAdmin && (
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              id="rol"
              name="rol"
              value={usuario.rol || 'Usuario'}
              label="Rol"
              onChange={onChange}
            >
              <MenuItem value="Usuario">Usuario</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
};

export default FormularioUsuario;