import React, { useState } from 'react';
import {
  Container, Box, Card, CardContent, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import FormularioRegistro from '../components/FormularioRegistro';
import FormularioLogin from '../components/FormularioLogin';
import BotonSubmit from '../components/BotonSubmit';
import EnlaceToggle from '../components/EnlaceToggle';
import CabeceraAuth from '../components/CabeceraAuth';

// Estado inicial del formulario
const initialFormState = {
  email: '',
  password: '',
  nombreApellido: '',
  dni: '',
  telefono: '',
};

export default function Autenticacion() {
  const [esRegistro, establecerEsRegistro] = useState(false);
  const [formData, establecerFormData] = useState(initialFormState);
  const [errorAuth, establecerErrorAuth] = useState('');
  const [cargando, establecerCargando] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // 1. Unificar el manejo de inputs
  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    establecerFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 2. Validación de campos básica
  const validarCampos = () => {
    const { email, password, nombreApellido, dni, telefono } = formData;
    
    // Validar Email y Contraseña básicos
    if (!email || !password) return false;
    
    if (esRegistro) {
      // Validar campos adicionales de registro y longitud mínima de contraseña
      return nombreApellido && dni && telefono && password.length >= 6;
    }
    
    return true;
  };

  const manejarEnvioFormulario = async (evento) => {
    evento.preventDefault();
    if (!validarCampos()) {
      // Evitar sobrescribir errores específicos de campo si ya existen
      if (!errorAuth) {
        establecerErrorAuth('Por favor, completa todos los campos requeridos.');
      }
      return;
    }

    establecerErrorAuth('');
    establecerCargando(true);

    try {
      let result;
      if (esRegistro) {
        result = await register(formData);
        if (result.success) {
          establecerErrorAuth('¡Registro exitoso! Por favor, inicia sesión.');
          establecerEsRegistro(false);
          // Limpiar datos sensibles después del registro
          establecerFormData(prev => ({ ...initialFormState, email: prev.email }));
        } else {
          establecerErrorAuth(result.error || 'Error al registrar.');
        }
      } else {
        result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/');
        } else {
          establecerErrorAuth(result.error || 'Credenciales incorrectas.');
        }
      }
    } catch (error) {
      console.error("Error de Auth:", error);
      establecerErrorAuth('Error de conexión o del servidor.');
    } finally {
      establecerCargando(false);
    }
  };

  return (
    // CONTENEDOR PRINCIPAL: Centrado Horizontal y Vertical
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',    // Centra verticalmente el Container
        justifyContent: 'center', // Centra horizontalmente el Container
        minHeight: '100vh',      // Ocupa la altura completa de la vista
        width: '100%',
        backgroundColor: (theme) => theme.palette.grey[50],
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 8 },
      }}
    >
      <Container
        component="main"
        maxWidth="sm" // Usa el valor 'sm' de Material UI para manejar el ancho automáticamente
        sx={{
          width: '100%',
          maxWidth: 400, // Forzar un ancho máximo específico si 'sm' no es suficiente (aprox. 400px)
          margin: '0 auto', // Garantiza el centrado horizontal
        }}
      >
        <Card
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* CONTENIDO DE LA TARJETA: Centrado Interno */}
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Centra el icono y el título
              p: { xs: 2, sm: 4 },
            }}
          >
            <CabeceraAuth esRegistro={esRegistro} />

            <Box component="form" onSubmit={manejarEnvioFormulario} noValidate sx={{ width: '100%', mt: 1 }}>

              <FormularioLogin
                formData={formData}
                manejarCambioInput={manejarCambioInput}
                errorAuth={errorAuth}
                esRegistro={esRegistro}
              />

              {/* Campos de Registro Condicionales */}
              {esRegistro && (
                <FormularioRegistro
                  formData={formData}
                  manejarCambioInput={manejarCambioInput}
                  errorAuth={errorAuth}
                />
              )}

              {/* Manejo de Errores */}
              {errorAuth && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorAuth}
                </Alert>
              )}

              <BotonSubmit
                cargando={cargando}
                validarCampos={validarCampos}
                esRegistro={esRegistro}
              />

              <EnlaceToggle
                esRegistro={esRegistro}
                onToggle={establecerEsRegistro}
                onClearError={establecerErrorAuth}
                onResetForm={() => establecerFormData(initialFormState)}
              />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}