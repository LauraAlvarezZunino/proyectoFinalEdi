import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Grid } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import api from '../servicios/api';

const PanelDeControl = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdmin) {
          // Fetch admin stats from API
          const roomsRes = await api.get('/habitaciones');

          let roomsData = roomsRes.data;
          // Handle string response (remove 're' prefix if present)
          if (typeof roomsData === 'string') {
            try {
              roomsData = JSON.parse(roomsData.replace(/^re/, ''));
            } catch (e) {
              console.error('Failed to parse rooms response:', e);
              roomsData = [];
            }
          }

          const adminStats = [
            { title: 'Habitaciones Totales', value: roomsData.length.toString(), icon: <HotelIcon />, color: '#90caf9' },
            { title: 'Reservas Activas', value: '0', icon: <EventNoteIcon />, color: '#f48fb1' }, // API access denied for non-admin
            { title: 'Usuarios Registrados', value: '0', icon: <PeopleIcon />, color: '#81c784' }, // API access denied for non-admin
            { title: 'Notificaciones', value: '0', icon: <NotificationsIcon />, color: '#ffb74d' },
          ];
          setStats(adminStats);
        } else {
          // For regular users, show their personal stats (API access denied, so use mock data)
          const userStats = [
            { title: 'Mis Reservas', value: '0', icon: <EventNoteIcon />, color: '#f48fb1' },
            { title: 'Reservas Activas', value: '0', icon: <HotelIcon />, color: '#90caf9' },
          ];
          setStats(userStats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to mock data if API fails
        const fallbackStats = isAdmin ? [
          { title: 'Habitaciones Totales', value: '25', icon: <HotelIcon />, color: '#90caf9' },
          { title: 'Reservas Activas', value: '12', icon: <EventNoteIcon />, color: '#f48fb1' },
          { title: 'Usuarios Registrados', value: '150', icon: <PeopleIcon />, color: '#81c784' },
          { title: 'Notificaciones', value: '5', icon: <NotificationsIcon />, color: '#ffb74d' },
        ] : [
          { title: 'Mis Reservas', value: '3', icon: <EventNoteIcon />, color: '#f48fb1' },
          { title: 'Reservas Activas', value: '1', icon: <HotelIcon />, color: '#90caf9' },
        ];
        setStats(fallbackStats);
      }
    };

    fetchStats();
  }, [isAdmin, user]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        Panel de Control - {isAdmin ? 'Administrador' : 'Usuario'}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Bienvenido, {user?.nombreApellido}
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: stat.color, fontSize: 48, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
   
    </Container>
  );
};

export default PanelDeControl;