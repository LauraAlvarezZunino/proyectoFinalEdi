import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Grid, 
  CircularProgress, Alert, // Alert para mostrar errores
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import api from '../servicios/api';
import TarjetaHabitacion from '../componentes/TarjetaHabitacion'; 

export default function ListadoHabitaciones() {
  const [habitaciones, establecerHabitaciones] = useState([]);
  const [estaCargando, establecerEstadoCarga] = useState(true);
  const [errorCarga, establecerErrorCarga] = useState(null); 
  const navigate = useNavigate();

  const fetchHabitaciones = async () => {
    establecerEstadoCarga(true);
    establecerErrorCarga(null);
    try {
      const response = await api.get('/habitaciones'); 
      
      // Asume que la respuesta es un array, si tu API envuelve los datos, 
      // usa: establecerHabitaciones(response.data.data);
      const dataArray = Array.isArray(response.data) ? response.data : response.data.data;
      establecerHabitaciones(dataArray || []);

    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
      establecerErrorCarga("Error al cargar la lista. El servidor no responde.");
    } finally {
      establecerEstadoCarga(false);
    }
  };

  useEffect(() => {
    fetchHabitaciones();
  }, []);

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
            {Array.isArray(habitaciones) && habitaciones.length > 0 ? (
                habitaciones.map((habitacion) => (
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