import axios from 'axios';

// Obtiene la URL base desde el archivo .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api.php'


// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el Token JWT en el header 'Authorization'
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;