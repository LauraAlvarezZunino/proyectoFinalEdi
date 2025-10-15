import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../servicios/api';
import FormularioReserva from '../components/FormularioReserva';
import TablaReservas from '../components/TablaReservas';

const Reservas = () => {
  const { user, isAdmin } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // Mock data for demonstration - replace with API call
  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      const mockReservations = [
        {
          id: 1,
          habitacion: '101',
          habitacionId: 1,
          cliente: 'Juan Pérez',
          usuarioId: 1,
          fechaInicio: '2024-01-15',
          fechaFin: '2024-01-17',
          costo: 300,
          estado: 'Confirmada'
        },
        {
          id: 2,
          habitacion: '102',
          habitacionId: 2,
          cliente: 'María García',
          usuarioId: 2,
          fechaInicio: '2024-01-20',
          fechaFin: '2024-01-22',
          costo: 200,
          estado: 'Confirmada'
        }
      ];

      // Filter reservations for non-admin users
      const filteredData = isAdmin ? mockReservations : mockReservations.filter(res => res.usuarioId === user.id);
      setReservations(filteredData);
      setLoading(false);
    }, 500);
  }, [isAdmin, user]);


  const handleAdd = () => {
    setSelectedReservation({
      habitacionId: '',
      usuarioId: isAdmin ? '' : user.id,
      fechaInicio: '',
      fechaFin: '',
    });
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (reservation) => {
    setSelectedReservation({
      ...reservation,
      habitacionId: reservation.habitacionId || '', // Ensure habitacionId exists
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReservation(null);
    setIsEdit(false);
  };

  const handleSave = async () => {
    if (!selectedReservation) return;

    try {
      let response;
      if (isEdit) {
        response = await api.put(`/api.php/reservas/${selectedReservation.id}`, {
          fechaInicio: selectedReservation.fechaInicio,
          fechaFin: selectedReservation.fechaFin,
          habitacionId: selectedReservation.habitacionId,
        });
        setAlertMessage('Reserva actualizada exitosamente');
      } else {
        response = await api.post('/api.php/reservas', {
          fechaInicio: selectedReservation.fechaInicio,
          fechaFin: selectedReservation.fechaFin,
          habitacionId: selectedReservation.habitacionId,
          usuarioId: selectedReservation.usuarioId,
        });
        setAlertMessage('Reserva creada exitosamente');
      }

      console.log('Reservation saved:', response.data);
      setAlertSeverity('success');
      setTimeout(() => setAlertMessage(''), 3000);

      // Refresh reservations list
      // For now, just close modal - in production you'd refetch
      handleClose();
    } catch (err) {
      console.error('Error saving reservation:', err);
      setAlertMessage('Error al guardar la reserva');
      setAlertSeverity('error');
      setTimeout(() => setAlertMessage(''), 3000);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      try {
        const response = await api.delete(`/api.php/reservas/${id}`);
        console.log('Reservation cancelled:', response.data);

        setReservations(reservations.filter(res => res.id !== id));
        setAlertMessage('Reserva cancelada exitosamente');
        setAlertSeverity('success');
        setTimeout(() => setAlertMessage(''), 3000);
      } catch (err) {
        console.error('Error cancelling reservation:', err);
        setAlertMessage('Error al cancelar la reserva');
        setAlertSeverity('error');
        setTimeout(() => setAlertMessage(''), 3000);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedReservation(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
          Reservas
        </Typography>
        <Typography>Cargando reservas...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
          Reservas
        </Typography>
        <Typography color="error">Error al cargar reservas: {error}</Typography>
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
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Nueva Reserva
          </Button>
        )}
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
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
      >
        <DialogTitle>{isEdit ? 'Editar Reserva' : 'Nueva Reserva'}</DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <FormularioReserva
              reserva={selectedReservation}
              onChange={handleFormChange}
              isEdit={isEdit}
              isAdmin={isAdmin}
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