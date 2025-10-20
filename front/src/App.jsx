import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import {  Typography } from '@mui/material';
// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Componentes de Navegación/Ruta
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Páginas - Importaciones actualizadas
import PanelDeControl from './pages/PanelDeControl';
import GestionHabitaciones from './pages/GestionHabitaciones'; // Para el Admin
import Reservas from './pages/Reservas';
import Usuarios from './pages/Usuarios';
import Autenticacion from './pages/Autenticacion'; // Para /auth

// Páginas Públicas - Nuevas importaciones
import CatalogoHabitaciones from './pages/CatalogoHabitaciones'; // Para el listado público
import HabitacionDetalleReserva from './pages/HabitacionDetalleReserva'; // Para el detalle y reserva

import logo from './assets/logo.png';

// Configuración del tema
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1b1615ff',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

// ----------------------------------------------------------------------
// Componente que contiene la lógica de enrutamiento y el layout
// ----------------------------------------------------------------------

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Definir si la ruta actual es una página que no necesita el Header/Sidebar (el "chrome")
  const isPublicPage =
    location.pathname === '/auth' ||
    location.pathname.startsWith('/habitacion/');
  
  // Mostrar Header y Sidebar solo si está autenticado Y no está en una página pública
  const showChrome = user && !isPublicPage;

  // Si la aplicación está cargando la sesión inicial, podemos mostrar un spinner o null
  if (loading) {
      // Opcional: mostrar un spinner global
      return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando aplicación...</Box>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header y Sidebar solo para el área logueada */}
      {showChrome && <Header />}
      {showChrome && <Sidebar />}

      {/* El margen superior solo se aplica si se muestra el Header */}
      <main style={{ 
        flexGrow: 1, 
        padding: showChrome ? '24px' : '0', 
        marginTop: showChrome ? '64px' : '0' 
      }}>
        <Routes>
          {/* ------------------ RUTAS PÚBLICAS Y DE AUTENTICACIÓN ------------------ */}
          
          {/* 1. Ruta de Autenticación */}
          <Route path="/auth" element={<Autenticacion />} />
          
          {/* 2. Rutas del Catálogo de Habitaciones */}
          <Route path="/habitaciones" element={<CatalogoHabitaciones />} />
          <Route path="/habitacion/:id" element={<HabitacionDetalleReserva />} />
          
          {/* 3. Ruta Raíz (Home) */}
          <Route
            path="/"
            element={user ?
              <ProtectedRoute><PanelDeControl /></ProtectedRoute> : // Si está logueado, ir al Dashboard
              <Navigate to="/auth" replace /> // Si no está logueado, ir al formulario de autenticación
            }
          />
          
          {/* ------------------ RUTAS PROTEGIDAS (Admin/Usuario Logueado) ------------------ */}

          {/* Dashboard (Protegida) */}
          <Route path="/dashboard" element={<ProtectedRoute><PanelDeControl /></ProtectedRoute>} />

          {/* Gestión de Habitaciones (Protegida, idealmente solo para Admin) */}
          <Route path="/gestion-habitaciones" element={<ProtectedRoute><GestionHabitaciones /></ProtectedRoute>} />

          {/* Habitaciones (Protegida) */}
          <Route path="/habitaciones" element={<ProtectedRoute><CatalogoHabitaciones /></ProtectedRoute>} />

          {/* Reservas (Protegida) */}
          <Route path="/reservas" element={<ProtectedRoute><Reservas /></ProtectedRoute>} />

          {/* Usuarios (Protegida) */}
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          
          {/* Opcional: Ruta de Fallback para 404 */}
          <Route path="*" element={<Box sx={{ mt: 5, textAlign: 'center' }}><Typography variant="h4">404 - Página no encontrada</Typography></Box>} />
        </Routes>
      </main>

      {/* Logo en la esquina inferior derecha (Mostrar solo si se muestra el Chrome) */}
      {showChrome && (
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: { xs: 100, sm: 120 },
            height: 'auto',
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;