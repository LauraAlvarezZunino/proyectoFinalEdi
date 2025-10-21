import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress, // Importado para el estado de carga
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
// import api from '../services/api'; // Ya no es necesario aquí, se usa en reservaService

// 1. Importar el nuevo servicio
import * as reservaService from '../services/reservaService'; 
import FormularioReserva from '../components/FormularioReserva';
import TablaReservas from '../components/TablaReservas';

const Reservas = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
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
  // Usamos useCallback para memoizar y usarlo en useEffect y después de guardar/cancelar
  const fetchReservasData = useCallback(async () => {
    // Solo cargamos si tenemos datos de usuario necesarios
    if (!user || (!isAdmin && !user.id)) return; 

    setLoading(true);
    try {
      // 2. Llamada al servicio
      const data = await reservaService.fetchReservations(user.id, isAdmin);
      console.log('Reservations data received:', data);
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      displayAlert(error.message || 'Error al cargar las reservas', 'error');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user]); 

  // 3. Carga inicial de datos
  useEffect(() => {
    fetchReservasData();
  }, [fetchReservasData]);

  // 4. Manejo de datos precargados desde la navegación
  useEffect(() => {
    if (location.state?.prefillData) {
      setSelectedReservation({
        ...location.state.prefillData,
        // Asegurar que el usuarioId esté seteado al crear desde otra vista
        usuarioId: isAdmin ? location.state.prefillData.usuario_id || '' : user?.id,
      });
      setOpen(true);
      setIsEdit(false);
    }
  }, [location.state, isAdmin, user?.id]);


  // --- Manejo del Diálogo ---
  const handleAdd = () => {
    setSelectedReservation({
      habitacion_id: '',
      // Si no es admin, el usuarioId es el suyo automáticamente
      usuarioId: isAdmin ? '' : user?.id,
      fechaInicio: '',
      fechaFin: '',
    });
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (reservation) => {
    setSelectedReservation({
      ...reservation,
      habitacion_id: reservation.habitacion ? reservation.habitacion.id : reservation.habitacion_id || '',
      fechaInicio: reservation.fechaInicio,
      fechaFin: reservation.fechaFin,
      usuarioId: reservation.usuarioId,
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReservation(null);
    setIsEdit(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedReservation(prev => ({ ...prev, [name]: value }));
  };

  // Validation function for dates
  const validateDates = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return false;

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Check that start date is not in the past and end date is after start date
    return start >= today && end > start;
  };

  // --- Lógica de Guardar (API) ---
  const handleSave = async () => {
    if (!selectedReservation || !selectedReservation.fechaInicio || !selectedReservation.habitacion_id) {
      displayAlert('Faltan campos obligatorios.', 'warning');
      return;
    }

    // Validate dates
    if (!validateDates(selectedReservation.fechaInicio, selectedReservation.fechaFin)) {
      displayAlert('La fecha de inicio debe ser hoy o posterior, y la fecha de fin debe ser posterior a la fecha de inicio.', 'warning');
      return;
    }
    
    // Filtramos solo los campos necesarios para la API
    const dataToSend = {
      fechaInicio: selectedReservation.fechaInicio,
      fechaFin: selectedReservation.fechaFin,
      habitacionId: selectedReservation.habitacion_id,
      // Solo incluimos usuarioId si estamos creando o si es un admin editando una reserva ajena
      ...(selectedReservation.usuarioId && { usuarioId: selectedReservation.usuarioId }),
    };

    try {
      if (isEdit) {
        await reservaService.updateReservation(selectedReservation.id, dataToSend);
        displayAlert('Reserva actualizada exitosamente');
      } else {
        // Al crear, se debe incluir el usuarioId si no se incluyó en dataToSend
        if (!dataToSend.usuario_id && user?.id) {
            dataToSend.usuario_id = user.id;
        }
        await reservaService.createReservation(dataToSend);
        displayAlert('Reserva creada exitosamente');
      }

      handleClose();
      // Refrescar los datos de la tabla desde el servidor
      fetchReservasData(); 
    } catch (err) {
      console.error('Error saving reservation:', err);
      displayAlert(err.message || 'Error al guardar la reserva', 'error');
    }
  };

  // --- Lógica de Cancelar (API) ---
  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }
    
    try {
      await reservaService.cancelReservation(id);
      displayAlert('Reserva cancelada exitosamente');
      
      // Refrescar los datos de la tabla desde el servidor
      fetchReservasData(); 
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      displayAlert(err.message || 'Error al cancelar la reserva', 'error');
    }
  };


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando reservas...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Reservas
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          {isAdmin ? 'Nueva Reserva' : 'Reservar Habitación'}
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TablaReservas
            reservations={reservations}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{isEdit ? 'Editar Reserva' : 'Nueva Reserva'}</DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <FormularioReserva
              reserva={selectedReservation}
              onChange={handleFormChange}
              isEdit={isEdit}
              isAdmin={isAdmin}
              // Pasar el ID del usuario actual para el control interno del formulario
              currentUserId={user?.id}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reservas;