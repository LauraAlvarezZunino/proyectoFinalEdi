import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Grid, CircularProgress, Alert } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';

// Importar el nuevo servicio
import { fetchDashboardStats } from '../services/panelService'; 

// Mapeo para renderizar los iconos de Material UI (ya que los pasamos como string en el servicio)
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


const PanelDeControl = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return; 
            
            setLoading(true);
            setError(null);
            
            try {
                // LLAMADA SIMPLIFICADA AL SERVICIO
                const data = await fetchDashboardStats(user.id, isAdmin);
                setStats(data);
            } catch (err) {
                console.error('Error loading dashboard stats:', err);
                setError('Error al cargar las estadísticas del panel.');
                setStats([]); // Limpiar las estadísticas si hay un error
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [isAdmin, user]); // Dependencias claras

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
                Panel de Control - {isAdmin ? 'Administrador' : 'Usuario'}
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
)}

            
        </Container>
    );
};

export default PanelDeControl;