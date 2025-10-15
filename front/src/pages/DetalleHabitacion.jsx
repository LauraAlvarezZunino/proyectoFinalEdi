import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent,
  CircularProgress, Grid, Alert, Snackbar
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import api from '../servicios/api';
import FormularioReserva from '../componentes/FormularioReserva'; 
import InfoHabitacion from '../componentes/InfoHabitacion'; 

export default function DetalleHabitacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habitacion, establecerHabitacion] = useState(null);
  const [estaCargando, establecerEstadoCarga] = useState(true);
  const [errorCarga, establecerErrorCarga] = useState(null);
  const [reservaExitosa, establecerReservaExitosa] = useState(false);

  // --- Lógica de la API: GET Detalle ---
  useEffect(() => {
    const fetchDetalle = async () => {
        establecerEstadoCarga(true);
        establecerErrorCarga(null);
        try {
            const response = await api.get(`/habitaciones/${id}`);
            establecerHabitacion(response.data);
        } catch (error) {
            console.error("Error al cargar detalle:", error);
            establecerErrorCarga("No se pudo cargar la habitación o no existe.");
        } finally {
            establecerEstadoCarga(false);
        }
    };
    fetchDetalle();
  }, [id]);

  // --- Lógica de la API: POST Reserva ---
  const manejarReserva = async (datosReserva) => {
    const userId = localStorage.getItem('userId') || 1; // Usar ID 1 si no hay login
    
    // Necesitas calcular el costo total (por simplicidad, lo haremos fijo aquí)
    const precio = habitacion.precio; 
    const fechaInicio = moment(datosReserva.fecha_inicio);
    const fechaFin = moment(datosReserva.fecha_fin);
    const duracion = fechaFin.diff(fechaInicio, 'days');
    const costoTotal = precio * duracion; 

    const datosFinales = {
        fecha_inicio: datosReserva.fecha_inicio,
        fecha_fin: datosReserva.fecha_salida,
        habitacion_id: datosReserva.habitacionId,
        usuario_id: userId, 
        costo: costoTotal, // Enviar el costo calculado
    };

    try {
        await api.post('/reservas', datosFinales); 
        establecerReservaExitosa(true); 
    } catch (error) {
        console.error("Error al reservar:", error.response);
        const mensajeError = error.response?.data?.message || 'Error en la reserva. Revisa si has iniciado sesión.';
        establecerErrorCarga(mensajeError); 
    }
  };

  const cerrarSnackbar = () => {
    establecerReservaExitosa(false);
    navigate('/'); 
  };
  
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
        <Toolbar>{/* ... Botón volver y título */}</Toolbar>
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
                        habitacionId={habitacion.id}
                        alConfirmarReserva={manejarReserva} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
        ) : (
             <Typography variant="h5" color="error" align="center">Habitación no encontrada o error de carga.</Typography>
        )}
      </Container>

      <Snackbar open={reservaExitosa} autoHideDuration={6000} onClose={cerrarSnackbar}>
        <Alert onClose={cerrarSnackbar} severity="success" sx={{ width: '100%' }}>
          ¡Reserva realizada con éxito!
        </Alert>
      </Snackbar>
    </>
  );
}