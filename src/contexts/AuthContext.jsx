import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../servicios/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Decode token or fetch user info
      // Assuming token contains user info or we fetch from /me endpoint
      // For now, mock user data
      setUser({ id: 1, nombreApellido: 'Admin User', email: 'admin@example.com', esAdmin: true });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login for testing
    if (email === 'admin@example.com' && password === 'admin') {
      const mockUser = { id: 1, nombreApellido: 'Admin User', dni: '12345678', email: 'admin@example.com', telefono: '123456789', esAdmin: true };
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('authToken', mockToken);
      setUser(mockUser);
      return { success: true };
    } else if (email === 'user@example.com' && password === 'user') {
      const mockUser = { id: 2, nombreApellido: 'Common User', dni: '87654321', email: 'user@example.com', telefono: '987654321', esAdmin: false };
      const mockToken = 'mock-jwt-token-user';
      localStorage.setItem('authToken', mockToken);
      setUser(mockUser);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/autenticacion/registro', userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin: user?.esAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};