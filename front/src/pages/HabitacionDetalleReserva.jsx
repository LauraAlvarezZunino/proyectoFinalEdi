import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent,
  CircularProgress, Grid, Alert, Snackbar, Box // Importado Box para centrar
} from '@mui/material';

import dayjs from 'dayjs'; 

// Importar servicios (asumiendo que los creaste)
import * as habitacionService from '../services/habitacionService';
import * as reservaService from '../services/reservaService';

import FormularioReserva from '../components/FormularioReserva';
import InfoHabitacion from '../components/InfoHabitacion';

export default function DetalleHabitacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habitacion, establecerHabitacion] = useState(null);
  const [estaCargando, establecerEstadoCarga] = useState(true);
  const [errorCarga, establecerErrorCarga] = useState(null);
  const [reservaExitosa, establecerReservaExitosa] = useState(false);

  // --- Lógica de la API: GET Detalle ---
  const fetchDetalle = useCallback(async () => {
    establecerEstadoCarga(true);
    establecerErrorCarga(null);
    try {
      // 1. Llamada al servicio
      const data = await habitacionService.fetchRoomDetail(id);
      establecerHabitacion(data);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      establecerErrorCarga(error.message || "No se pudo cargar la habitación o no existe.");
    } finally {
      establecerEstadoCarga(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  // --- Lógica de la API: POST Reserva (Simplificada y robusta) ---
  const manejarReserva = async (datosReserva) => {
    console.log('Datos de reserva recibidos:', datosReserva);
    establecerErrorCarga(null); // Limpiar errores anteriores

    // Obtener userId del localStorage (debería estar guardado después del login)
    const userId = localStorage.getItem('userId');
    console.log('UserId from localStorage:', userId);
    if (!userId) {
      establecerErrorCarga('Debes iniciar sesión para hacer una reserva.');
      return;
    }

    // Validar que tenemos las fechas
    if (!datosReserva.fechaInicio || !datosReserva.fechaFin) {
      establecerErrorCarga('Debes seleccionar fechas de inicio y fin.');
      return;
    }

    // Cálculo de costo usando dayjs (más ligero que moment)
    const precioPorNoche = habitacion.precio || habitacion.precioNoche;
    const fecha_inicio = dayjs(datosReserva.fechaInicio);
    const fecha_fin = dayjs(datosReserva.fechaFin);
    const duracion = fecha_fin.diff(fecha_inicio, 'day'); // Duración en días

    console.log('Cálculo de costo:', { precioPorNoche, duracion, fecha_inicio: fecha_inicio.format(), fecha_fin: fecha_fin.format() });
    console.log('Precio por noche:', precioPorNoche, 'Tipo:', typeof precioPorNoche);

    if (duracion <= 0) {
      establecerErrorCarga('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    if (isNaN(precioPorNoche) || precioPorNoche <= 0) {
      establecerErrorCarga('Precio de habitación no válido.');
      return;
    }

    // Validate that end date is after start date
    if (fecha_fin.isBefore(fecha_inicio) || fecha_fin.isSame(fecha_inicio)) {
      establecerErrorCarga('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    const costoTotal = precioPorNoche * duracion;

    const datosFinales = {
        fechaInicio: fecha_inicio.format('YYYY-MM-DD'), // Formato estándar para API
        fechaFin: fecha_fin.format('YYYY-MM-DD'),
        habitacionId: parseInt(habitacion.id), // Usar el ID del estado habitacion
        usuarioId: parseInt(userId),
        costo: costoTotal.toFixed(2), // Enviar costo con 2 decimales
    };

    console.log('Datos finales para enviar:', datosFinales);
    console.log('Tipos de datos:', {
      habitacionId: typeof datosFinales.habitacion_id,
      usuarioId: typeof datosFinales.usuario_id,
      costo: typeof datosFinales.costo
    });

    try {
        // 2. Llamada al servicio de reserva
        const resultado = await reservaService.createReservation(datosFinales);
        console.log('Reserva creada exitosamente:', resultado);
        establecerReservaExitosa(true);
    } catch (error) {
        console.error("Error al reservar:", error);
        establecerErrorCarga(error.message || 'Error en la reserva. Revisa si has iniciado sesión.');
    }
  };

  const cerrarSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    establecerReservaExitosa(false);
    navigate('/'); // Navegar a la página principal tras el éxito
  };

  // --- Renderizado de Carga y Error ---
  if (estaCargando) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando detalles...</Typography>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/habitaciones')} sx={{ mr: 2 }}>
            Volver
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Detalle de la Habitación
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        {errorCarga && <Alert severity="error" sx={{ mb: 3 }}>{errorCarga}</Alert>}

        {habitacion ? (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <InfoHabitacion habitacion={habitacion} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom color="primary">
                      Reserva esta Habitación
                    </Typography>
                    <FormularioReserva
                        // Corregido: pasar la habitación completa como prop 'habitacion'
                        habitacion={habitacion}
                        alConfirmarReserva={manejarReserva}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
        ) : (
             !errorCarga && (
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No se encontró la habitación.</Typography>
                </Box>
             )
        )}
      </Container>

      <Snackbar open={reservaExitosa} autoHideDuration={6000} onClose={cerrarSnackbar}>
        <Alert onClose={cerrarSnackbar} severity="success" sx={{ width: '100%' }}>
          ¡Reserva realizada con éxito! Serás redirigido.
        </Alert>
      </Snackbar>
    </>
  );
}