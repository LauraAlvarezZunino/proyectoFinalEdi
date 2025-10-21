import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Grid, CircularProgress, Alert, Button } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Importar el servicio
import { fetchDashboardStats } from '../services/panelService';

// Mapeo para renderizar los iconos de Material UI
const iconMap = {
    HotelIcon: HotelIcon,
    EventNoteIcon: EventNoteIcon,
    PeopleIcon: PeopleIcon,
    NotificationsIcon: NotificationsIcon,
};

// Componente para mostrar una métrica
const StatCard = ({ title, value, iconName, color }) => {
    const IconComponent = iconMap[iconName] || NotificationsIcon;

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

// Componente para acciones rápidas de admin
const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Acciones Rápidas
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => navigate('/usuarios')}
                        >
                            Gestionar Usuarios
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            onClick={() => navigate('/habitaciones')}
                        >
                            Gestionar Habitaciones
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={() => navigate('/reservas')}
                        >
                            Ver Reservas
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            color="secondary"
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

const AdminDashboard = () => {
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
                // Llamada específica para admin
                const data = await fetchDashboardStats(user.id, true);
                setStats(data);
            } catch (err) {
                console.error('Error loading admin dashboard stats:', err);
                setError('Error al cargar las estadísticas del panel de administración.');
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
                Panel de Administración
            </Typography>
            <Typography variant="h6" gutterBottom>
                Bienvenido, Administrador {user?.nombreApellido}
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
                            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title={stat.title}
                                    value={stat.value}
                                    iconName={stat.icon}
                                    color={stat.color}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <QuickActions />
                </>
            )}
        </Container>
    );
};

export default AdminDashboard;