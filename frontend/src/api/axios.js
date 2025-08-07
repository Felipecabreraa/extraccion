import axios from 'axios';

// Configuración de axios para desarrollo y producción
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://extraccion-backend-test.onrender.com/api'  // URL correcta del backend en Render
  : 'http://localhost:3001/api';                 // URL local

const api = axios.create({
  baseURL,
  timeout: 30000, // Aumentar timeout a 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autorización automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API:', error);
    
    // Si el error es 401 (No autorizado) o 403 (Prohibido), limpiar el token
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      // Redirigir al login si es necesario
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 