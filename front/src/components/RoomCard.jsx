import React from 'react';
import {
  Card, CardContent, CardActions, Typography, Button, Chip, Divider,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HotelIcon from '@mui/icons-material/Hotel'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Función auxiliar para renderizar el botón de acción
const renderActions = (room, isAdmin, onEdit, onDelete, handleReserve) => {
  // Si es admin Y tiene funciones de edición/eliminación, mostrar botones de admin
  if (isAdmin && onEdit && onDelete) {
    return (
      <>
        <Button
          size="small"
          color="primary"
          onClick={() => onEdit(room)}
          startIcon={<EditIcon />}
          sx={{ mr: 1 }}
        >
          Editar
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => onDelete(room)}
          startIcon={<DeleteIcon />}
        >
          Eliminar
        </Button>
      </>
    );
  }

  // Lógica para usuarios regulares o cuando no hay funciones de admin
  return room.estado === 'Disponible' ? (
    <Button
      size="small"
      color="primary"
      variant="contained"
      onClick={handleReserve}
    >
      Reservar
    </Button>
  ) : (
    // No hay botón de reservar si no está disponible
    <Typography variant="caption" color="error">
      No disponible
    </Typography>
  );
};

export default function RoomCard({ room, onEdit, onDelete }) {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const capacidad = room.capacidad || 2;
  const isAvailable = room.estado === 'Disponible';

  const handleReserve = () => {
  
    navigate('/reservas', {
      state: {
        selectedRoom: room,
        prefillData: {
          habitacion_id: room.id,
          usuarioId: user?.id,
          fechaInicio: '',
          fechaFin: '',
        }
      }
    });
  };

  return (
    <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
       
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2" color="primary">
          Habitación {room.numero}
        </Typography>
        
        <Chip 
          label={room.tipo} 
          size="small" 
          color="secondary" 
          sx={{ mb: 2 }} 
        />
        <Typography variant="body1" color="text.primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} /> 
          <span style={{ fontWeight: 'bold' }}>${room.precio}</span> / noche
        </Typography>

      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        {renderActions(room, isAdmin, onEdit, onDelete, handleReserve)}
      </CardActions>
    </Card>
  );
}