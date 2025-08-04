import axios from 'axios';

// Configuración de axios para desarrollo y producción
const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'https://trn-extraccion-production.up.railway.app/api'  // URL de Railway
  : process.env.REACT_APP_API_URL || 'http://localhost:3001/api';  // URL desde variable de entorno

const api = axios.create({
  baseURL,
  timeout: 30000, // Aumentado a 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para depuración
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y reintentos
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ Error en API:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    // Si es un error 404, intentar con rutas alternativas
    if (error.response?.status === 404) {
      const originalRequest = error.config;
      
      // Si es frontend-metrics, intentar con ruta alternativa
      if (originalRequest.url.includes('/dashboard/frontend-metrics')) {
        try {
          console.log('🔄 Intentando ruta alternativa para frontend-metrics...');
          const alternativeUrl = originalRequest.url.replace('/dashboard/frontend-metrics', '/unified/test-metrics');
          const alternativeResponse = await axios({
            ...originalRequest,
            url: alternativeUrl
          });
          console.log('✅ Ruta alternativa exitosa');
          return alternativeResponse;
        } catch (alternativeError) {
          console.error('❌ Error en ruta alternativa:', alternativeError);
        }
      }
    }
    
    // Si es un error de red (sin respuesta del servidor)
    if (!error.response) {
      console.error('🌐 Error de conexión - Servidor no responde');
      console.error('Verifica que el backend esté ejecutándose en:', baseURL);
    }
    
    return Promise.reject(error);
  }
);

export default api; 