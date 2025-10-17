// src/componentes/InfoHabitacion.js (Mínima modificación)
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

export default function InfoHabitacion({ habitacion }) {
    // Las propiedades (nombre, descripcion, capacidad, precioNoche) ahora vienen 
    // directamente del objeto transformado por el servicio.
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h4" component="h1" gutterBottom color="primary">
                    {habitacion.nombre}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {habitacion.descripcion}
                </Typography>
                <Typography variant="h6" color="text.primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1 }} /> Capacidad: {habitacion.capacidad} personas
                </Typography>
                <Typography variant="h5" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon sx={{ mr: 1 }} /> Precio por noche: ${habitacion.precioNoche}
                </Typography>
            </CardContent>
        </Card>
    );
}