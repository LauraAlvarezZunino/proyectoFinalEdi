import React, { useState, useEffect } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

const FormularioReserva = ({ reserva, onChange, isEdit = false, isAdmin = false }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Mock data - replace with API calls
  useEffect(() => {
    // Mock habitaciones
    setHabitaciones([
      { id: 1, numero: '101', tipo: 'Suite', estado: 'Disponible', precio: 150 },
      { id: 2, numero: '102', tipo: 'Doble', estado: 'Disponible', precio: 100 },
      { id: 3, numero: '103', tipo: 'Simple', estado: 'Disponible', precio: 80 },
    ]);

    // Mock usuarios (solo para admin)
    if (isAdmin) {
      setUsuarios([
        { id: 1, nombreApellido: 'Juan Pérez' },
        { id: 2, nombreApellido: 'María García' },
        { id: 3, nombreApellido: 'Carlos López' },
      ]);
    }
  }, [isAdmin]);

  const calcularCosto = (habitacionId, fechaInicio, fechaFin) => {
    if (!habitacionId || !fechaInicio || !fechaFin) return 0;

    const habitacion = habitaciones.find(h => h.id === habitacionId);
    if (!habitacion) return 0;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

    return dias > 0 ? dias * habitacion.precio : 0;
  };

  const costoCalculado = calcularCosto(reserva.habitacionId, reserva.fechaInicio, reserva.fechaFin);

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {isAdmin && !isEdit && (
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="usuario-label">Cliente</InputLabel>
            <Select
              labelId="usuario-label"
              id="usuarioId"
              name="usuarioId"
              value={reserva.usuarioId || ''}
              label="Cliente"
              onChange={onChange}
            >
              {usuarios.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nombreApellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel id="habitacion-label">Habitación</InputLabel>
          <Select
            labelId="habitacion-label"
            id="habitacionId"
            name="habitacionId"
            value={reserva.habitacionId || ''}
            label="Habitación"
            onChange={onChange}
          >
            {habitaciones
              .filter(h => h.estado === 'Disponible' || (isEdit && reserva.habitacionId === h.id))
              .map((habitacion) => (
                <MenuItem key={habitacion.id} value={habitacion.id}>
                  {habitacion.numero} - {habitacion.tipo} (${habitacion.precio}/noche)
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="fechaInicio"
          name="fechaInicio"
          label="Fecha de Inicio"
          type="date"
          value={reserva.fechaInicio || ''}
          onChange={onChange}
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: new Date().toISOString().split('T')[0] }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="fechaFin"
          name="fechaFin"
          label="Fecha de Fin"
          type="date"
          value={reserva.fechaFin || ''}
          onChange={onChange}
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: reserva.fechaInicio || new Date().toISOString().split('T')[0] }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary">
          Costo estimado: ${costoCalculado}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default FormularioReserva;