import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
// api ya no se necesita directamente, solo se usa en authService
// import api from '../servicios/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

//si existe una sesión de usuario guardada en el navegador,restaurarla en el estado de React al recargar
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const restoreSession = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        // Aquí asumimos que los datos almacenados ya son seguros y limpios
        setUser(parsedUserData);
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        // Limpiar datos corruptos y asegurar logout
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // --- Funciones de Autenticación ---

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/auth');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
  };
  
  const login = async (email, password) => {
    try {
      setLoading(true);
      // 1. Llamada al servicio
      const { token, user: userData } = await authService.loginUser(email, password);

      // 2. Almacenamiento y Estado
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('userId', userData.id.toString());
      setUser(userData);

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message }; 
    }
  };

  const register = async (userData) => {
    try {
      // Llamada directa al servicio
      await authService.registerUser(userData);
      return { success: true };
    } catch (error) {
      // El error ya viene limpio desde authService.js
      return { success: false, error: error.message };
    }
  };

  // --- Valor del Contexto ---
  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAdmin: user?.esAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;