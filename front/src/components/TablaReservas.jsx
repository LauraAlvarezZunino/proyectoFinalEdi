import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Chip,
} from '@mui/material';

const TablaReservas = ({ reservations, isAdmin, onEdit, onCancel }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Habitación</TableCell>
            {isAdmin && <TableCell>Cliente</TableCell>}
            <TableCell>Fecha Inicio</TableCell>
            <TableCell>Fecha Fin</TableCell>
            <TableCell>Costo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservations && reservations.length > 0 ? reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.habitacion ? reservation.habitacion.numero : reservation.habitacion_id}</TableCell>
              {isAdmin && <TableCell>{reservation.usuarioId}</TableCell>}
              <TableCell>{reservation.fechaInicio}</TableCell>
              <TableCell>{reservation.fechaFin}</TableCell>
              <TableCell>${reservation.costo}</TableCell>
              <TableCell>
                <Chip
                  label="Confirmada"
                  color="success"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onEdit(reservation)}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => onCancel(reservation.id)}
                  >
                    Cancelar
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                No hay reservas disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TablaReservas;