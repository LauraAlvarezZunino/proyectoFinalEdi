import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Grid, CircularProgress, Alert, Button, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats } from '../services/panelService';
import * as usuarioService from '../services/usuarioService';
import FormularioUsuario from '../components/FormularioUsuario';


const iconMap = {
    EventNoteIcon: EventNoteIcon,
};

// Componente para mostrar una métrica
const StatCard = ({ title, value, iconName, color }) => {
    const IconComponent = iconMap[iconName] || EventNoteIcon;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: color, fontSize: 48, mb: 2 }}>
                    <IconComponent fontSize="inherit" />
                </Box>
                <Typography variant="h5" component="div" gutterBottom>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
};

// Componente para información del perfil
const ProfileInfo = ({ user, onEdit }) => {
    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                        <AccountCircleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">
                            Información del Perfil
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                        size="small"
                    >
                        Editar
                    </Button>
                </Box>
                <List>
                    <ListItem >
                        <ListItemText primary="Nombre" secondary={user?.nombreApellido} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary="Email" secondary={user?.email} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary="Teléfono" secondary={user?.telefono} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary="DNI" secondary={user?.dni} />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );
};


const UserDashboard = () => {
    const { user, login, updateUser } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                // Llamada específica para usuario
                const data = await fetchDashboardStats(user.id, false);
                setStats(data);
            } catch (err) {
                console.error('Error loading user dashboard stats:', err);
                setError('Error al cargar las estadísticas del panel de usuario.');
                setStats([]);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user]);

    const handleEditProfile = () => {
        setEditingUser({
            nombreApellido: user.nombreApellido || '',
            email: user.email || '',
            telefono: user.telefono || '',
            dni: user.dni || ''
        });
        setEditDialogOpen(true);
    };

    const validateProfileData = () => {
        const { nombreApellido, email, telefono, dni, password } = editingUser;

        // Validar nombre
        if (!nombreApellido || nombreApellido.trim().length < 2) {
            return 'El nombre debe tener al menos 2 caracteres.';
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return 'El email no tiene un formato válido.';
        }

        // Validar teléfono
        if (!telefono || !/^\d{10,11}$/.test(telefono)) {
            return 'El teléfono debe tener entre 10 y 11 dígitos.';
        }

        // Validar DNI
        if (!dni || !/^\d{7,8}$/.test(dni)) {
            return 'El DNI debe tener 7 u 8 dígitos.';
        }

        // Validar contraseña si se proporciona
        if (password && password.length > 0) {
            if (password.length < 6 || password.length > 20) {
                return 'La contraseña debe tener entre 6 y 20 caracteres.';
            }
        }

        return null; // Sin errores
    };

    const handleSaveProfile = async () => {
        // Validar datos antes de enviar
        const validationError = validateProfileData();
        if (validationError) {
            setSnackbarMessage(validationError);
            setSnackbarOpen(true);
            return;
        }

        try {
            // solo incluye la clave si no esta vacio el campo
            const dataToSend = {
                nombreApellido: editingUser.nombreApellido.trim(),
                telefono: editingUser.telefono.trim(),
                email: editingUser.email.trim().toLowerCase(),
                ...(editingUser.password && editingUser.password.trim() && { clave: editingUser.password.trim() })
            };

            console.log('Sending profile update:', dataToSend);
            const response = await usuarioService.updateUser(user.id, dataToSend);
            console.log('Profile update response:', response);

            // Si se cambió la contraseña, forzar logout para que el usuario inicie sesión con la nueva contraseña
            if (dataToSend.clave) {
                setSnackbarMessage('Contraseña actualizada. Por favor, inicia sesión nuevamente.');
                setSnackbarOpen(true);
                handleCloseDialog();
                // Limpiar la sesión completamente
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userId');
                // Redirigir al login después de un breve delay
                setTimeout(() => {
                    window.location.href = '/auth';
                }, 2000);
                return;
            }

            // Actualizar el contexto de autenticación 
            const updatedUser = {
                ...user,
                nombreApellido: editingUser.nombreApellido.trim(),
                telefono: editingUser.telefono.trim(),
                email: editingUser.email.trim().toLowerCase()
            };
            updateUser(updatedUser);

            setSnackbarMessage('Perfil actualizado exitosamente');
            setSnackbarOpen(true);
            handleCloseDialog();
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar el perfil';
            setSnackbarMessage(errorMessage);
            setSnackbarOpen(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDialogClose = () => {
        // Limpiar cualquier mensaje de error cuando se cierra el diálogo
        setSnackbarOpen(false);
        handleCloseDialog();
    };

    const handleCloseDialog = () => {
        setEditDialogOpen(false);
        setEditingUser({});
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
                Mi Panel de Control
            </Typography>
            <Typography variant="h6" gutterBottom>
                Bienvenido, {user?.nombreApellido}
            </Typography>

            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" height={100}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && (
                <>
                    <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
                        {stats.map((stat, index) => (
                            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                                <StatCard
                                    title={stat.title}
                                    value={stat.value}
                                    iconName={stat.icon}
                                    color={stat.color}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <ProfileInfo user={user} onEdit={handleEditProfile} />
                </>
            )}

            {/* Dialog para editar perfil */}
            <Dialog open={editDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogContent>
                    <FormularioUsuario
                        usuario={editingUser}
                        onChange={handleInputChange}
                        isEdit={true}
                        isAdmin={false}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancelar</Button>
                    <Button onClick={handleSaveProfile} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Container>
    );
};

export default UserDashboard;