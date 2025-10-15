import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HotelIcon from '@mui/icons-material/Hotel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const allMenuItems = [
  { text: 'Inicio', icon: <DashboardIcon />, path: '/', roles: ['admin', 'user'] },
  { text: 'Habitaciones', icon: <HotelIcon />, path: '/habitaciones', roles: ['admin', 'user'] },
  { text: 'Reservas', icon: <EventNoteIcon />, path: '/reservas', roles: ['admin', 'user'] },
  { text: 'Usuario', icon: <PeopleIcon />, path: '/usuarios', roles: ['admin', 'user'] },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const menuItems = allMenuItems.filter(item => item.roles.includes(isAdmin ? 'admin' : 'user'));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <List  sx={{mt:10}}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
             
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;