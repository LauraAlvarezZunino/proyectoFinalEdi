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
  CircularProgress, 
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import FormularioUsuario from '../components/FormularioUsuario';
import TablaUsuarios from '../components/TablaUsuarios';
import * as userService from '../services/usuarioService'; 

const Usuarios = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [isLoading, setIsLoading] = useState(true);

  // --- Función de Alerta ---
  const displayAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(''), 3000);
  };
  
  // --- LÓGICA DE CARGA DE DATOS (API) ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      let data = [];
      if (isAdmin) {
        // Admin: Obtener todos los usuarios
        data = await userService.getAllUsers(); 
      } else if (user && user.id) {
        // Usuario: Obtener solo su perfil
        const userData = await userService.getUserById(user.id);
        // La tabla espera un array, por eso envolvemos el objeto
        data = [userData]; 
      }
      setUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      displayAlert('Error al cargar los datos.', 'error');
      setUsers([]); 
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user]); 

  useEffect(() => {

    fetchUsers();
  }, [fetchUsers]); 

  // --- Manejo de Editar y Agregar ---
  const handleAdd = () => {
    setSelectedUser({ nombre_apellido: '', dni: '', telefono: '', email: '', password: '', rol: 'Usuario' });
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (userToEdit) => {
    // Aseguramos que la **contraseña esté vacía** para que no se envíe si no se cambia
    setSelectedUser({
      ...userToEdit,
      rol: userToEdit.esAdmin ? 'Admin' : 'Usuario',
      password: '', 
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setIsEdit(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({ ...prev, [name]: value }));
  };
  
  // --- LÓGICA DE GUARDAR (API) ---
  const handleSave = async () => {
    if (!selectedUser || !selectedUser.email || !selectedUser.nombreApellido) {
      displayAlert('Datos incompletos', 'warning');
      return;
    }
    
    // Preparar el objeto para el API con mapeo correcto
    const userToSave = {
      nombreApellido: selectedUser.nombreApellido || selectedUser.nombre_apellido,
      telefono: selectedUser.telefono,
      email: selectedUser.email,
      ...(selectedUser.password && { clave: selectedUser.password }), // Solo si hay contraseña
      esAdmin: selectedUser.rol === 'Admin',
    };

    // Bloqueo de seguridad: si no es admin, no puede cambiar su propio rol.
    if (!isAdmin && isEdit) {
      userToSave.esAdmin = user.esAdmin;
    }

    try {
      if (isEdit) {
        await userService.updateUser(selectedUser.id, userToSave);
        displayAlert('Usuario actualizado exitosamente');
      } else {
        await userService.createUser(userToSave);
        displayAlert('Usuario agregado exitosamente');
      }
      
      handleClose();
      // Recargar los datos después de guardar
      fetchUsers(); 

    } catch (error) {
      console.error("Error al guardar:", error);
      displayAlert(`Error al ${isEdit ? 'actualizar' : 'crear'} el usuario. Por favor, revisa la consola.`, 'error');
    }
  };

  // --- LÓGICA DE CAMBIAR ESTADO (API) ---
  const handleToggleStatus = async (id, currentStatus) => {
    if (!isAdmin) return;
    
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    
    try {
      await userService.toggleUserStatus(id, newStatus); 
    
      displayAlert(`Usuario ${newStatus.toLowerCase()} exitosamente`);
      fetchUsers();
      
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      displayAlert('Error al cambiar el estado del usuario.', 'error');
    }
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
          {isAdmin ? 'Gestión de Usuarios' : 'Mi Perfil'}
        </Typography>
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Nuevo Usuario
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          {isLoading ? (
            // Mostrar indicador de carga
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
            </Box>
          ) : (
            // Mostrar la tabla o mensaje de no resultados
            <TablaUsuarios
              users={users}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          )}
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
              // El campo de rol solo se puede modificar si el usuario es Admin
              canChangeRole={isAdmin} 
              // La contraseña solo es requerida al crear
              passwordRequired={!isEdit} 
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