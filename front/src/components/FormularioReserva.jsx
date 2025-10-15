import React, { useState, useEffect } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import api from '../servicios/api';

const FormularioReserva = ({ reserva, onChange, isEdit = false, isAdmin = false }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch habitaciones
        const roomsRes = await api.get('/habitaciones');
        let roomsData = roomsRes.data;
        if (typeof roomsData === 'string') {
          roomsData = JSON.parse(roomsData.replace(/^re/, ''));
        }
        const transformedRooms = roomsData.map(room => ({
          id: room.id,
          numero: room.numero.toString(),
          tipo: room.tipo.charAt(0).toUpperCase() + room.tipo.slice(1),
          precio: parseFloat(room.precio),
          estado: 'Disponible'
        }));
        setHabitaciones(transformedRooms);

        // Fetch usuarios (solo para admin)
        if (isAdmin) {
          try {
            const usersRes = await api.get('/usuarios');
            let usersData = usersRes.data;
            if (typeof usersData === 'string') {
              usersData = JSON.parse(usersData.replace(/^re/, ''));
            }
            setUsuarios(usersData);
          } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to empty array
            setUsuarios([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays
        setHabitaciones([]);
        setUsuarios([]);
      }
    };

    fetchData();
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
            displayEmpty
          >
            <MenuItem value="">
              <em>Seleccionar habitación</em>
            </MenuItem>
            {habitaciones.length > 0 ? habitaciones
              .filter(h => h.estado === 'Disponible' || (isEdit && reserva.habitacionId === h.id))
              .map((habitacion) => (
                <MenuItem key={habitacion.id} value={habitacion.id}>
                  {habitacion.numero} - {habitacion.tipo} (${habitacion.precio}/noche)
                </MenuItem>
              )) : (
              <MenuItem disabled>
                <em>Cargando habitaciones...</em>
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          id="fechaInicio"
          name="fechaInicio"
          label="Fecha de Inicio"
          type="date"
          value={reserva.fechaInicio || ''}
          onChange={onChange}
          required
          InputLabelProps={{
            shrink: true,
            sx: {
              backgroundColor: 'white',
              px: 1,
              transform: 'translate(14px, -6px) scale(0.75)' // Better positioning
            }
          }}
          inputProps={{
            min: new Date().toISOString().split('T')[0] // Prevent past dates
          }}
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: 'white',
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                cursor: 'pointer',
                opacity: 1
              }
            },
            '& .MuiInputLabel-root': {
              backgroundColor: 'white',
              px: 1
            }
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          id="fechaFin"
          name="fechaFin"
          label="Fecha de Fin"
          type="date"
          value={reserva.fechaFin || ''}
          onChange={onChange}
          required
          InputLabelProps={{
            shrink: true,
            sx: {
              backgroundColor: 'white',
              px: 1,
              transform: 'translate(14px, -6px) scale(0.75)' // Better positioning
            }
          }}
          inputProps={{
            min: reserva.fechaInicio || new Date().toISOString().split('T')[0] // Min date is start date or today
          }}
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: 'white',
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                cursor: 'pointer',
                opacity: 1
              }
            },
            '& .MuiInputLabel-root': {
              backgroundColor: 'white',
              px: 1
            }
          }}
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