import React, { useState, useEffect } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button } from '@mui/material';
import api from '../services/api';

const FormularioReserva = ({ habitacion, reserva = {}, onChange, isEdit = false, isAdmin = false, alConfirmarReserva }) => {
  console.log('FormularioReserva renderizado con props:', { habitacion, reserva, isEdit, isAdmin });
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

  const calcularCosto = (fechaInicio, fechaFin) => {
    if (!habitacion || !fechaInicio || !fechaFin) return 0;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

    const precioNoche = parseFloat(habitacion.precio) || parseFloat(habitacion.precioNoche) || 0;
    const costo = dias > 0 ? dias * precioNoche : 0;
    console.log('Cálculo de costo en FormularioReserva:', { fechaInicio, fechaFin, dias, precioNoche, costo, habitacion });
    return costo;
  };

  // Estado local para manejar los cambios del formulario
  const [formData, setFormData] = useState({
    fechaInicio: reserva.fechaInicio || '',
    fechaFin: reserva.fechaFin || '',
    habitacionId: habitacion?.id || reserva.habitacion_id || reserva.habitacionId || ''
  });

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // También llamar a onChange si está definido (para compatibilidad)
    if (onChange) {
      onChange(e);
    }
  };

  const costoCalculado = calcularCosto(formData.fechaInicio, formData.fechaFin);

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
              onChange={handleChange}
              sx={{
                '& .MuiSelect-select': {
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  maxWidth: '100%',
                  display: 'block'
                }
              }}
            >
              {usuarios.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id} sx={{ whiteSpace: 'normal' }}>
                  {usuario.nombreApellido || usuario.nombre_apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      <Grid item xs={12}>
        <FormControl fullWidth required sx={{ minWidth: 300 }}>
          <InputLabel id="habitacion-label">Habitación</InputLabel>
          <Select
            labelId="habitacion-label"
            id="habitacionId"
            name="habitacionId"
            value={formData.habitacionId}
            label="Habitación"
            onChange={handleChange}
            displayEmpty
            disabled={!!habitacion} // Deshabilitar si ya hay una habitación seleccionada
          >
            {habitacion ? (
              <MenuItem value={habitacion.id}>
                {habitacion.numero} - {habitacion.tipo} (${habitacion.precio}/noche)
              </MenuItem>
            ) : (
              <>
                <MenuItem value="">
                  <em>Seleccionar habitación</em>
                </MenuItem>
                {habitaciones.length > 0 ? habitaciones
                  .filter(h => h.estado === 'Disponible' || (isEdit && reserva.habitacionId === h.id))
                  .map((hab) => (
                    <MenuItem key={hab.id} value={hab.id}>
                      {hab.numero} - {hab.tipo} (${hab.precio}/noche)
                    </MenuItem>
                  )) : (
                  <MenuItem disabled>
                    <em>Cargando habitaciones...</em>
                  </MenuItem>
                )}
              </>
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
          value={formData.fechaInicio}
          onChange={handleChange}
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
          value={formData.fechaFin}
          onChange={handleChange}
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
            min: formData.fechaInicio || new Date().toISOString().split('T')[0] // Min date is start date or today
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

      <Grid item xs={12} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => {
            console.log('Botón "Reservar Habitación" clickeado');
            if (alConfirmarReserva) {
              const datosReserva = {
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                habitacionId: habitacion?.id || formData.habitacionId
              };
              console.log('Enviando datos de reserva:', datosReserva);
              alConfirmarReserva(datosReserva);
            } else {
              console.error('alConfirmarReserva no está definido');
            }
          }}
          disabled={!formData.fechaInicio || !formData.fechaFin || (!habitacion && !formData.habitacionId)}
        >
          Reservar Habitación
        </Button>
      </Grid>
    </Grid>
  );
};

export default FormularioReserva;