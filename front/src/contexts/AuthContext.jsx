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
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        console.log('Restoring user data from localStorage:', parsedUserData);
        setUser(parsedUserData);
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        // Clear corrupted data
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      // Call the real backend API for login
      const response = await api.post('/autenticacion/inicio-sesion', {
        email: email, // Backend expects email for login
        clave: password // Map password to clave
      });

      console.log('Login response:', response.data);
      const data = response.data;
      console.log('Data type:', typeof data);
      if (typeof data === 'string') {
        console.log('Response is string, trying to parse as JSON');
        try {
          const parsedData = JSON.parse(data.replace(/^re/, ''));
          console.log('Parsed data:', parsedData);
          if (parsedData && typeof parsedData === 'object' && parsedData.token) {
            console.log('Login successful, setting user data');
            console.log('User is_admin from token:', parsedData.is_admin);
            const userData = {
              id: parsedData.user_id,
              nombreApellido: 'User',
              email: email,
              esAdmin: parsedData.is_admin === true || parsedData.is_admin === 1
            };
            localStorage.setItem('authToken', parsedData.token);
            localStorage.setItem('userData', JSON.stringify(userData));
            setUser(userData);
            console.log('User set with esAdmin:', userData.esAdmin);
            return { success: true };
          }
        } catch (e) {
          console.error('Failed to parse response:', e);
        }
      } else if (data && typeof data === 'object' && data.token) {
        console.log('Login successful, setting user data');
        console.log('User is_admin from token:', data.is_admin);
        const userData = {
          id: data.user_id,
          nombreApellido: 'User',
          email: email,
          esAdmin: data.is_admin === true || data.is_admin === 1
        };
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        console.log('User set with esAdmin:', userData.esAdmin);
        return { success: true };
      }
      console.log('No token in response or invalid data format');
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/autenticacion/registro', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin: user?.esAdmin || false,
    // Debug: Add function to check current user status
    debugUser: () => console.log('Current user:', user, 'isAdmin:', user?.esAdmin)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};