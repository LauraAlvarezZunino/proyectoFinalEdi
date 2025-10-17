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
  CircularProgress, // Añadido para estado de carga
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
// 1. Importar el servicio
import * as habitacionService from '../services/habitacionService'; 
import RoomCard from '../components/RoomCard';
import FormularioHabitacion from '../components/FormularioHabitacion';
// import api from '../services/api'; // Ya no se necesita

const Habitaciones = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // --- Función de Alerta Centralizada ---
  const displayAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(''), 3000);
  };

  // --- Lógica de Carga de Datos (API) ---
  const fetchRoomsData = useCallback(async () => {
    setLoading(true);
    try {
      // 2. Llamada al servicio
      const data = await habitacionService.fetchRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      displayAlert(error.message || 'Error al cargar las habitaciones', 'error');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Carga inicial
  useEffect(() => {
    fetchRoomsData();
  }, [fetchRoomsData]);


  // --- Manejo del CRUD (Dialogo) ---
  const handleAdd = () => {
    // Usamos 'precioNoche' para ser consistentes con el servicio
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

  // --- Lógica de Guardar (API) ---
  const handleSave = async () => {
    if (!selectedRoom || !selectedRoom.numero || !selectedRoom.tipo) {
        displayAlert('Faltan campos obligatorios.', 'warning');
        return;
    }
    
    try {
        // 4. Llamada al servicio para guardar
        await habitacionService.saveRoom(selectedRoom, isEdit);
        
        displayAlert(`Habitación ${isEdit ? 'actualizada' : 'agregada'} exitosamente`);
        handleClose();
        // Recargar los datos desde el servidor
        fetchRoomsData(); 
        
    } catch (err) {
        console.error('Error saving room:', err);
        displayAlert(err.message || 'Error al guardar la habitación', 'error');
    }
  };

  // --- Lógica de Eliminar (API) ---
  const handleDelete = async (room) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la habitación ${room.nombre}? Esta acción es irreversible.`)) {
      return;
    }
    
    try {
        // 5. Llamada al servicio para eliminar
        await habitacionService.deleteRoom(room.id);
        
        displayAlert('Habitación eliminada exitosamente');
        // Recargar los datos desde el servidor
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
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              {/* onEdit y onDelete solo se pasan si es Admin */}
              <RoomCard 
                room={room} 
                onEdit={isAdmin ? handleEdit : undefined} 
                onDelete={isAdmin ? handleDelete : undefined} 
              />
            </Grid>
          ))}
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