import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Grid,
  CircularProgress, Alert, Box, 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import * as habitacionService from '../services/habitacionService';
import TarjetaHabitacion from '../components/TarjetaHabitacion';

export default function ListadoHabitaciones() {
  const [habitaciones, establecerHabitaciones] = useState([]);
  const [estaCargando, establecerEstadoCarga] = useState(true);
  const [errorCarga, establecerErrorCarga] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();


  const showBackButton = user; 

  const fetchHabitaciones = useCallback(async () => {
    establecerEstadoCarga(true);
    establecerErrorCarga(null);
    try {
      const data = await habitacionService.fetchRooms();
      establecerHabitaciones(data || []);
    } catch (error) {
      establecerErrorCarga(error.message || "Error al cargar la lista. El servidor no responde.");
    } finally {
      establecerEstadoCarga(false);
    }
  }, []);

  useEffect(() => {
    fetchHabitaciones();
  }, [fetchHabitaciones]);

  return (
    <>
      {showBackButton && (
        <AppBar position="static" sx={{ mb: 2 }}>
          <Toolbar>
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Volver al Panel
            </Button>
          </Toolbar>
        </AppBar>
      )}

    
      <Box
        sx={{
            ml: { sm: '20px', xs: 0 },
            flexGrow: 1,
            minHeight: '100vh',
            pb: 4 
        }}
      >
        <Container sx={{ py: 4 }}>
          
          {errorCarga && ( 
              <Alert severity="error" sx={{ mb: 4 }}>{errorCarga}</Alert>
          )}

          {estaCargando ? (
            <Grid container justifyContent="center" sx={{ mt: 8 }}>
              <CircularProgress color="primary" />
              <Typography variant="subtitle1" sx={{ ml: 2 }}>Cargando habitaciones...</Typography>
            </Grid>
          ) : (
        
            <Grid
              sx={{
                display: 'grid',
                    justifyContent: 'center',
                // Definición de ancho responsiva (1, 2, o 3 tarjetas por fila)
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',  // Móvil: 1 columna
                  sm: 'repeat(2, 1fr)',  // Tablet: 2 columnas
                  md: 'repeat(3, 1fr)',  // Escritorio: 3 columnas (tamaño consistente)
                },
                gap: 3, 
                alignItems: 'stretch', // Fuerza a que todas las tarjetas tengan la misma altura
              }}
            >
              {habitaciones.length > 0 ? (
                  habitaciones.map((habitacion) => {
                    return (
                      <TarjetaHabitacion
                          key={habitacion.id}
                          habitacion={habitacion}
                          navegar={navigate}
                      />
                    );
                  })
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
      </Box>
    </>
  );
}