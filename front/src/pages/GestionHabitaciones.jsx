import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import * as habitacionService from '../services/habitacionService'; 
import RoomCard from '../components/RoomCard';
import FormularioHabitacion from '../components/FormularioHabitacion';

const Habitaciones = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const displayAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const fetchRoomsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await habitacionService.fetchRooms();
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      displayAlert(error.message || 'Error al cargar las habitaciones', 'error');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomsData();
  }, [fetchRoomsData]);

  const handleAdd = () => {
    setSelectedRoom({ numero: '', tipo: '', precioNoche: '', estado: 'Disponible' }); 
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRoom(null);
    setIsEdit(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedRoom(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedRoom || !selectedRoom.numero || !selectedRoom.tipo) {
        displayAlert('Faltan campos obligatorios.', 'warning');
        return;
    }
    
    try {
        await habitacionService.saveRoom(selectedRoom, isEdit);
        displayAlert(`Habitación ${isEdit ? 'actualizada' : 'agregada'} exitosamente`);
        handleClose();
        fetchRoomsData(); 
    } catch (err) {
        console.error('Error saving room:', err);
        displayAlert(err.message || 'Error al guardar la habitación', 'error');
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la habitación ${room.nombre}? Esta acción es irreversible.`)) {
      return;
    }
    
    try {
        await habitacionService.deleteRoom(room.id);
        displayAlert('Habitación eliminada exitosamente');
        fetchRoomsData(); 
    } catch (err) {
        console.error('Error deleting room:', err);
        displayAlert(err.message || 'Error al eliminar la habitación', 'error');
    }
  };

  return (
    <Container maxWidth="lg">
      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3, gap: 4 }}>
        <Typography variant="h4" component="h1">
          Gestión de Habitaciones
        </Typography>
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={handleAdd} disabled={loading}>
            Agregar Habitación
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando habitaciones...</Typography>
        </Box>
      ) : (
        <Grid 
          sx={{
            display: 'grid',
            // Definición de ancho responsiva (1, 2, o 3 tarjetas por fila)
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',  // Móvil: 1 columna
              sm: 'repeat(2, 1fr)',  // Tablet: 2 columnas
              md: 'repeat(3, 1fr)',  // Escritorio: 3 columnas (tamaño consistente)
            },
            gap: 3, 
            alignItems: 'stretch', 
          }}
        >
          {rooms.length > 0 ? (
            rooms.map((room) => {
              return (
           
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                />
              );
            })
          ) : (
            <Typography variant="h6" align="center" sx={{ gridColumn: '1 / -1', mt: 4 }}>
              No hay habitaciones disponibles.
            </Typography>
          )}
        </Grid>
      )}
      
      {/* Diálogo de Agregar/Editar (solo visible para Admin) */}
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