import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Grid, 
  CircularProgress, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
//para no autenticados
// 1. Importar el servicio de habitaciones
import * as habitacionService from '../services/habitacionService'; 
// import api from '../servicios/api'; // Ya no se necesita
import TarjetaHabitacion from '../components/TarjetaHabitacion'; 

export default function ListadoHabitaciones() {
  const [habitaciones, establecerHabitaciones] = useState([]);
  const [estaCargando, establecerEstadoCarga] = useState(true);
  const [errorCarga, establecerErrorCarga] = useState(null); 
  const navigate = useNavigate();

  // Encapsulamos la lógica de carga usando useCallback
  const fetchHabitaciones = useCallback(async () => {
    establecerEstadoCarga(true);
    establecerErrorCarga(null);
    try {
      // 2. Llamada simplificada al servicio
      const data = await habitacionService.fetchRooms();
      establecerHabitaciones(data || []);

    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
      // Usar el mensaje de error del servicio o un fallback
      establecerErrorCarga(error.message || "Error al cargar la lista. El servidor no responde.");
    } finally {
      establecerEstadoCarga(false);
    }
  }, []); // El array de dependencias está vacío porque no depende de props o estados mutables

  useEffect(() => {
    fetchHabitaciones();
  }, [fetchHabitaciones]); // Ejecutar solo cuando fetchHabitaciones cambie (sólo al montar)

  return (  
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <MeetingRoomIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Room Service
          </Typography>
          <Button color="inherit" onClick={() => navigate('/auth')}>Iniciar Sesión / Registrarse</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="text.primary">
          Bienvenido a Room Service
        </Typography>
        <Typography variant="h6" component="p" sx={{ mb: 4 }} align="center" color="text.secondary">
          Explora nuestras exclusivas habitaciones.
        </Typography>

        {errorCarga && ( 
            <Alert severity="error" sx={{ mb: 4 }}>{errorCarga}</Alert>
        )}

        {estaCargando ? (
          <Grid container justifyContent="center" sx={{ mt: 8 }}>
            <CircularProgress color="primary" />
            <Typography variant="subtitle1" sx={{ ml: 2 }}>Cargando habitaciones...</Typography>
          </Grid>
        ) : (
          <Grid container spacing={4}>
            {habitaciones.length > 0 ? (
                habitaciones.map((habitacion) => (
                    // Asegúrate de que TarjetaHabitacion maneje correctamente las props
                    <TarjetaHabitacion 
                        key={habitacion.id} 
                        habitacion={habitacion} 
                        navegar={navigate} 
                    />
                ))
            ) : (
                 !errorCarga && (
                    <Typography variant="h6" align="center" sx={{ width: '100%', mt: 4 }}>
                        No se encontraron habitaciones disponibles.
                    </Typography>
                )
            )}
          </Grid>
        )}
      </Container>
    </>
  );
}