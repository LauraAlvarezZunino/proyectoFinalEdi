// src/componentes/TarjetaHabitacion.js (Eliminamos la función getCapacidad)
import React from 'react';
import {
  Card, CardContent, CardActions, Typography, Button, Grid,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

// ⚠️ La función getCapacidad FUE ELIMINADA y su lógica se movió al servicio.

export default function TarjetaHabitacion({ habitacion, navegar }) {
  // Ahora consumimos las propiedades estandarizadas:
  const { id, nombre, descripcion, precioNoche, capacidad } = habitacion;

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2" color="primary">
            {nombre} {/* Usamos el nombre generado en el servicio */}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
             {descripcion} {/* Usamos la descripción estandarizada */}
          </Typography>

          <Typography variant="body1" color="text.primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleIcon sx={{ mr: 1 }} /> Capacidad: {capacidad} personas
          </Typography>

          <Typography variant="h6" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon sx={{ mr: 1 }} /> Precio: ${precioNoche} / noche
          </Typography>

        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            size="small"
            color="primary"
            onClick={() => navegar(`/habitacion/${id}`)}
          >
            Ver Detalles y Reservar
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}