import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

export default function NavegacionSecundaria({ titulo, mostrarBotonVolver = true }) {
    const navigate = useNavigate();

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                {mostrarBotonVolver && (
                    <Button color="inherit" onClick={() => navigate('/')}>
                        <MeetingRoomIcon sx={{ mr: 1 }} />
                        Volver al Inicio
                    </Button>
                )}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                    {titulo}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}