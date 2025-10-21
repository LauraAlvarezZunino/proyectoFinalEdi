import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Grid, CircularProgress, Alert, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Importar el servicio
import { fetchDashboardStats } from '../services/panelService';

// Mapeo para renderizar los iconos de Material UI
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
const ProfileInfo = ({ user }) => {
    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <AccountCircleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">
                        Información del Perfil
                    </Typography>
                </Box>
                <List>
                    <ListItem>
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

// Componente para acciones rápidas de usuario
const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Acciones Rápidas
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => navigate('/reservas')}
                        >
                            Mis Reservas
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={() => navigate('/catalogo')}
                        >
                            Ver Catálogo
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

                    <ProfileInfo user={user} />
                    <QuickActions />
                </>
            )}
        </Container>
    );
};

export default UserDashboard;