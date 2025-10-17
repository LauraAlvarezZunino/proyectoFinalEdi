import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent,
  CircularProgress, Grid, Alert, Snackbar, Box // Importado Box para centrar
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import dayjs from 'dayjs'; // ⚠️ REQUiere instalación: npm install dayjs

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
    establecerErrorCarga(null); // Limpiar errores anteriores
    
    // ⚠️ Usar una fuente más confiable para el ID si es posible (ej: AuthContext)
    const userId = localStorage.getItem('userId') || 1; 

    // Cálculo de costo usando dayjs (más ligero que moment)
    const precioPorNoche = habitacion.precio;
    const fechaInicio = dayjs(datosReserva.fecha_inicio);
    const fechaFin = dayjs(datosReserva.fecha_fin); // Corregido: usar fecha_fin, no fecha_salida
    const duracion = fechaFin.diff(fechaInicio, 'day'); // Duración en días

    if (duracion <= 0 || isNaN(precioPorNoche)) {
      establecerErrorCarga('Fechas inválidas o precio de habitación no definido.');
      return;
    }

    const costoTotal = precioPorNoche * duracion; 

    const datosFinales = {
        fecha_inicio: fechaInicio.format('YYYY-MM-DD'), // Formato estándar para API
        fecha_fin: fechaFin.format('YYYY-MM-DD'),
        habitacion_id: habitacion.id, // Usar el ID del estado habitacion
        usuario_id: userId,
        costo: costoTotal.toFixed(2), // Enviar costo con 2 decimales
    };

    try {
        // 2. Llamada al servicio de reserva
        await reservaService.createReservation(datosFinales);
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
          <MeetingRoomIcon sx={{ mr: 1 }} />
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
                        // Corregido: pasar el ID de la habitación en lugar de la habitación entera
                        habitacionId={habitacion.id} 
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