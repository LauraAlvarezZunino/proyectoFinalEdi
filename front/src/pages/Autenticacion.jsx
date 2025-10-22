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
  
  // 2. Validación de campos (Ahora devuelve el mensaje de error si existe)
  const validarCampos = () => {
    const { email, password, nombreApellido, dni, telefono } = formData;

    // Validación de campos generales
    if (!email || !password) {
        return 'El email y la contraseña son obligatorios.';
    }

    // Validación específica de Registro
    if (esRegistro) {
      if (!nombreApellido || !dni || !telefono) {
          return 'Todos los campos son obligatorios para el registro.';
      }
      
      if (dni.length < 7 || dni.length > 8 || !/^\d+$/.test(dni)) {
          return 'El DNI debe ser numérico y tener 7 u 8 dígitos.';
      }
      if (telefono.length < 10 || telefono.length > 11 || !/^\d+$/.test(telefono)) {
          return 'El teléfono debe ser numérico y tener entre 10 y 11 dígitos.';
      }
    }

    return ''; // Cadena vacía significa que la validación es exitosa
  };

  const manejarEnvioFormulario = async (evento) => {
    evento.preventDefault();
    establecerErrorAuth('');

    const validationError = validarCampos();
    if (validationError) {
      establecerErrorAuth(validationError);
      return;
    }

    establecerCargando(true);

    try {
      let result;
      
      if (esRegistro) {
        // Mapeo de datos para el backend
        const backendData = {
          nombreApellido: formData.nombreApellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          clave: formData.password
        };
        
        result = await register(backendData);
        
        if (result.success) {
          establecerErrorAuth('¡Registro exitoso! Ya puedes iniciar sesión.');
          establecerEsRegistro(false);
          establecerFormData(prev => ({ ...initialFormState, email: prev.email }));
          establecerCargando(false); // Reset loading state after successful registration
        } else {
          establecerErrorAuth(result.error || 'Error al registrar.');
          establecerCargando(false); // Reset loading state after failed registration
        }
      } else {
        // Login usa email y password (clave)
        result = await login(formData.email, formData.password);
        
        if (result.success) {
          // Navegar a la página principal después del login exitoso
          navigate('/'); 
        } else {
          console.log('Login failed with error:', result.error);
          establecerErrorAuth(result.error || 'Usuario o contraseña incorrectos.');
          establecerCargando(false); // Asegurar que se quite el estado de carga
          return; // Importante: salir aquí para evitar continuar con el flujo de éxito
        }
      }
    } catch (error) {
      console.error("Error de Auth inesperado:", error);
      establecerErrorAuth(error.message || 'Error de conexión o del servidor.');
      establecerCargando(false); // Asegurar que se quite el estado de carga en caso de error
    } finally {
      // El finally se ejecuta siempre, pero ya manejamos el estado de carga en cada caso
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',    
        justifyContent: 'center', 
        minHeight: '100vh',      
        width: '100%',
        backgroundColor: (theme) => theme.palette.grey[50],
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 8 },
      }}
    >
      <Container
        component="main"
        maxWidth="sm" 
        sx={{
          width: '100%',
          maxWidth: 400, 
          margin: '0 auto', 
        }}
      >
        <Card
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', 
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

              {/* 🛑 CORRECCIÓN: Se eliminó la prop validarCampos para evitar el TypeError. */}
              <BotonSubmit
                cargando={cargando}
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