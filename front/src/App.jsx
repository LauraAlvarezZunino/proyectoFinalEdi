import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PanelDeControl from './pages/PanelDeControl';
import Habitaciones from './pages/Habitaciones';
import Reservas from './pages/Reservas';
import Usuarios from './pages/Usuarios';
import Autenticacion from './pages/Autenticacion';
import logo from './assets/logo.png';

// Light theme configuration
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

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isLoginPage && user && <Header />}
      {!isLoginPage && user && <Sidebar />}
      <main style={{ flexGrow: 1, padding: isLoginPage ? '0' : '24px', marginTop: isLoginPage ? '0' : '64px' }}>
        <Routes>
          <Route path="/login" element={<Autenticacion />} />
          <Route path="/" element={<ProtectedRoute><PanelDeControl /></ProtectedRoute>} />
          <Route path="/habitaciones" element={<ProtectedRoute><Habitaciones /></ProtectedRoute>} />
          <Route path="/reservas" element={<ProtectedRoute><Reservas /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Logo en la esquina inferior derecha */}
      {!isLoginPage && user && (
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

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;