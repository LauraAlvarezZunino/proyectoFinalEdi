import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import RoomCard from '../components/RoomCard';
import FormularioHabitacion from '../components/FormularioHabitacion';

const Habitaciones = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // Mock data - replace with API call
  useEffect(() => {
    setRooms([
      { id: 1, numero: '101', tipo: 'Familiar', precio: 150, estado: 'Disponible' },
      { id: 2, numero: '102', tipo: 'Doble', precio: 100, estado: 'Disponible' },
      { id: 3, numero: '103', tipo: 'Simple', precio: 80, estado: 'Disponible' },
    ]);
  }, []);


  const handleAdd = () => {
    setSelectedRoom({ numero: '', tipo: '', precio: '', estado: 'Disponible' });
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = (room) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la habitación ${room.numero}?`)) {
      setRooms(rooms.filter(r => r.id !== room.id));
      setAlertMessage('Habitación eliminada exitosamente');
      setAlertSeverity('success');
      setTimeout(() => setAlertMessage(''), 3000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRoom(null);
    setIsEdit(false);
  };

  const handleSave = () => {
    if (isEdit) {
      // Update existing room
      setRooms(rooms.map(room =>
        room.id === selectedRoom.id ? selectedRoom : room
      ));
      setAlertMessage('Habitación actualizada exitosamente');
    } else {
      // Add new room
      const newRoom = {
        ...selectedRoom,
        id: Math.max(...rooms.map(r => r.id)) + 1
      };
      setRooms([...rooms, newRoom]);
      setAlertMessage('Habitación agregada exitosamente');
    }
    setAlertSeverity('success');
    setTimeout(() => setAlertMessage(''), 3000);
    handleClose();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedRoom(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container maxWidth="lg">
      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3, gap:4, }}>
        <Typography variant="h4" component="h1">
          Habitaciones
        </Typography>
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Agregar Habitación
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.id}>
            <RoomCard room={room} onEdit={handleEdit} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>

      {isAdmin && (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{isEdit ? 'Editar Habitación' : 'Agregar Habitación'}</DialogTitle>
          <DialogContent>
            {selectedRoom && (
              <FormularioHabitacion
                habitacion={selectedRoom}
                onChange={handleFormChange}
                isEdit={isEdit}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Habitaciones;