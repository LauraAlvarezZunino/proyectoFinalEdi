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

const TablaUsuarios = ({ users, isAdmin, onEdit, onToggleStatus }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre y Apellido</TableCell>
            <TableCell>DNI</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            {isAdmin && <TableCell>Rol</TableCell>}
            {isAdmin && <TableCell>Estado</TableCell>}
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.nombre_apellido}</TableCell>
              <TableCell>{u.dni}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.telefono}</TableCell>
              {isAdmin && <TableCell>{u.esAdmin ? 'Admin' : 'Usuario'}</TableCell>}
              {isAdmin && (
                <TableCell>
                  <Chip
                    label={u.estado}
                    color={u.estado === 'Activo' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              )}
              <TableCell>
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onEdit(u)}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outlined"
                      size="small"
                      color={u.estado === 'Activo' ? 'warning' : 'success'}
                      onClick={() => onToggleStatus(u.id, u.estado)}
                    >
                      {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TablaUsuarios;