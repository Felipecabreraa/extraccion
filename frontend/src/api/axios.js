import axios from 'axios';

const instance = axios.create({ 
  baseURL: 'http://localhost:3001/api',
  timeout: 30000 // 30 segundos de timeout (aumentado de 10)
});

// Interceptor de requests
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de responses
instance.interceptors.response.use(response => {
  return response;
}, error => {
  // Manejar errores de cancelación
  if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
    console.log('🔄 Request cancelado intencionalmente');
    return Promise.reject(error);
  }
  
  // Manejar errores de timeout
  if (error.code === 'ECONNABORTED') {
    console.error('⏰ Timeout en la petición:', error.message);
    return Promise.reject(new Error('La petición tardó demasiado tiempo'));
  }
  
  // Manejar errores de red
  if (!error.response) {
    console.error('🌐 Error de red:', error.message);
    return Promise.reject(new Error('Error de conexión. Verifica tu conexión a internet.'));
  }
  
  if (error.response?.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  if (error.response?.status === 500) {
    console.error('Error del servidor:', error.response.data);
  }
  
  return Promise.reject(error);
});

export default instance; 