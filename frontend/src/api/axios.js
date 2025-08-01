import axios from 'axios';

// Configuración de axios para desarrollo y producción
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://extraccion-bm4kowa1t-felipe-lagos-projects-f57024eb.vercel.app/api'  // URL de Vercel
  : 'http://localhost:3001/api';                 // URL local

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API:', error);
    return Promise.reject(error);
  }
);

export default api; 