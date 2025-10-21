// src/componentes/InfoHabitacion.js (Mínima modificación)
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

export default function InfoHabitacion({ habitacion }) {
    // Las propiedades (nombre, descripcion, capacidad, precioNoche) ahora vienen 
    // directamente del objeto transformado por el servicio.
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography component="h3" variant="h2"  gutterBottom color="primary">
                    Habitacion {habitacion.numero}
                </Typography>
                <Typography variant="h5" color="text.primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1 }} /> Capacidad: {habitacion.capacidad} personas
                </Typography>
                <Typography variant="h5" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                   Precio por noche: ${habitacion.precioNoche}
                </Typography>
            </CardContent>
        </Card>
    );
}