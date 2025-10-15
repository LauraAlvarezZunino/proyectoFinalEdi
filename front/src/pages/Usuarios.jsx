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
import FormularioUsuario from '../components/FormularioUsuario';
import TablaUsuarios from '../components/TablaUsuarios';

const Usuarios = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // Mock data - replace with API call
  useEffect(() => {
    const allUsers = [
      { id: 1, nombreApellido: 'Juan Pérez', dni: '12345678', email: 'juan@example.com', telefono: '123456789', esAdmin: true, estado: 'Activo' },
      { id: 2, nombreApellido: 'María García', dni: '87654321', email: 'maria@example.com', telefono: '987654321', esAdmin: false, estado: 'Activo' },
      { id: 3, nombreApellido: 'Carlos López', dni: '11223344', email: 'carlos@example.com', telefono: '555666777', esAdmin: false, estado: 'Inactivo' },
    ];
    const filteredUsers = isAdmin ? allUsers : allUsers.filter(u => u.id === user.id);
    setUsers(filteredUsers);
  }, [isAdmin, user]);


  const handleAdd = () => {
    setSelectedUser({
      nombreApellido: '',
      dni: '',
      telefono: '',
      email: '',
      password: '',
      rol: 'Usuario'
    });
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser({
      ...user,
      rol: user.esAdmin ? 'Admin' : 'Usuario'
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setIsEdit(false);
  };

  const handleSave = () => {
    if (isEdit) {
      // Update existing user
      setUsers(users.map(u =>
        u.id === selectedUser.id ? {
          ...selectedUser,
          esAdmin: selectedUser.rol === 'Admin'
        } : u
      ));
      setAlertMessage('Usuario actualizado exitosamente');
    } else {
      // Add new user
      const newUser = {
        ...selectedUser,
        id: Math.max(...users.map(u => u.id)) + 1,
        esAdmin: selectedUser.rol === 'Admin',
        estado: 'Activo'
      };
      delete newUser.password; // Remove password from display
      delete newUser.rol; // Remove rol from display
      setUsers([...users, newUser]);
      setAlertMessage('Usuario agregado exitosamente');
    }
    setAlertSeverity('success');
    setTimeout(() => setAlertMessage(''), 3000);
    handleClose();
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    setUsers(users.map(u =>
      u.id === id ? { ...u, estado: newStatus } : u
    ));
    setAlertMessage(`Usuario ${newStatus.toLowerCase()} exitosamente`);
    setAlertSeverity('success');
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container maxWidth="lg">
      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isAdmin ? 'Usuarios' : 'Mi Perfil'}
        </Typography>
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Nuevo Usuario
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <TablaUsuarios
            users={users}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? (isAdmin ? 'Editar Usuario' : 'Editar Mi Perfil') : 'Agregar Usuario'}</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <FormularioUsuario
              usuario={selectedUser}
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

export default Usuarios;