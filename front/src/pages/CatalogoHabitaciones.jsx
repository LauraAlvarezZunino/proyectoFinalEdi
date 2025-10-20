import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Grid, 
  CircularProgress, Alert, Box, // 💡 Importamos Box para manejar el margen del sidebar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import * as habitacionService from '../services/habitacionService'; 
import TarjetaHabitacion from '../components/TarjetaHabitacion'; 

export default function ListadoHabitaciones() {
  const [habitaciones, establecerHabitaciones] = useState([]);
  const [estaCargando, establecerEstadoCarga] = useState(true);
  const [errorCarga, establecerErrorCarga] = useState(null); 
  const navigate = useNavigate();

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
 
     
      {/* 💡 CORRECCIÓN MENÚ LATERAL: Box que aplica un margen izquierdo para compensar el sidebar.
             Ajusta '240px' si tu menú tiene otro ancho. 'xs: 0' deshabilita el margen en móvil. */}
      <Box 
        sx={{ 
            ml: { sm: '20px', xs: 0 }, 
            flexGrow: 1, 
            minHeight: '100vh',
            pb: 4 // Padding inferior
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
            // 💡 CORRECCIÓN GRID V2: Usamos 'display: grid', 'gridTemplateColumns', y 'gap'.
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
                gap: 3, // Espaciado entre las tarjetas
                alignItems: 'stretch', // Fuerza a que todas las tarjetas tengan la misma altura
              }}
            >
              {habitaciones.length > 0 ? (
                  habitaciones.map((habitacion) => {
                    return (
                      /* 💡 CORRECCIÓN V2: TarjetaHabitacion es ahora un hijo directo, 
                         sin envolver en <Grid item> ni usar props de ancho. */
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