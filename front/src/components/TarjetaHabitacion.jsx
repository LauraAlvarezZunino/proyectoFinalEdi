import React from 'react';
import {
  Card, CardContent, CardActions, Typography, Button, Box, Divider
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

const getCapacidad = (tipo) => {
  switch (tipo) {
    case 'Simple': return 1;
    case 'Doble': return 2;
    case 'Familiar': return 4;
    default: return 2;
  }
};

const getDescripcionAmigable = (tipo) => {
  switch (tipo) {
    case 'Simple': return 'Perfecta para viajeros solitarios o estancias cortas. Cama individual o queen.';
    case 'Doble': return 'Ideal para parejas o dos personas. Cama queen o dos camas individuales.';
    case 'Familiar': return 'Amplia opción con espacios conectados o múltiples camas. ¡Perfecta para la familia!';
    default: return 'Detalle de la habitación. Consulta la disponibilidad y comodidades.';
  }
};

export default function TarjetaHabitacion({ habitacion, navegar }) {
  const { id, tipo, capacidad: dbCapacidad, precioNoche, numero } = habitacion;
  const capacidad = dbCapacidad || getCapacidad(tipo);
  const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
  const descripcion = getDescripcionAmigable(tipo);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'stretch',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 380, 
          minWidth: 280, 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 3,
          p: 2,
          boxSizing: 'border-box',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight="bold"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {tipoCapitalizado}
          </Typography>

          <Typography
            gutterBottom
            variant="h5"
            component="div"
            color="primary"
            fontWeight="900"
          >
            Habitación {numero}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              minHeight: '4em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {descripcion}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: 'action.hover',
            }}
          >
            {/* Capacidad */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="body1"
                sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
              >
                <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                Capacidad:
              </Typography>
              <Typography variant="body1" fontWeight="900">
                {capacidad} personas
              </Typography>
            </Box>

            <Divider variant="middle" light />

            {/* Precio */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="body1"
                sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
              >
                <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                Precio:
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight="900">
                ${precioNoche}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  / noche
                </Typography>
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navegar(`/habitacion/${id}`)}
          >
            Reservar
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}