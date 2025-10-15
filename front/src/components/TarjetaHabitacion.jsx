import React from 'react';
import {
  Card, CardContent, CardActions, Typography, Button, Grid,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

// Función auxiliar para determinar la capacidad basada en el tipo ENUM
const getCapacidad = (tipo) => {
    switch (tipo) {
        case 'simple': return 1;
        case 'doble': return 2;
        case 'familiar': return 4;
        default: return 2;
    }
}

export default function TarjetaHabitacion({ habitacion, navegar }) {
  // Usamos las claves de la DB: 'tipo', 'precio' y 'numero'
  const { id, tipo, precio, numero } = habitacion;
  // Nota: Necesitas añadir una columna 'descripcion_amigable' a tu DB o generarla en el backend

  return (
    <Grid  xs={12} sm={6} md={4}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2" color="primary">
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)} (Hab. {numero})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
             {/* Usa una columna 'descripcion' de tu DB si la añades */}
             {tipo === 'familiar' ? 'Amplia opción con espacios conectados.' : 'Detalle de la habitación.'}
          </Typography>

          <Typography variant="body1" color="text.primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleIcon sx={{ mr: 1 }} /> Capacidad: {getCapacidad(tipo)} personas
          </Typography>

          <Typography variant="h6" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon sx={{ mr: 1 }} /> Precio: ${precio} / noche
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