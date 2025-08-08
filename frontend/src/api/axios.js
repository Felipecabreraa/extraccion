import axios from 'axios';

// Resolver baseURL priorizando variable de entorno del build
// REACT_APP_API_URL es inyectada por Render durante el build del frontend
const resolvedBaseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://extraccion-backend-test.onrender.com/api'
    : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 120000, // 120s para tolerar cold starts del backend en Render
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

// Helpers de reintento con backoff para errores transitorios
function shouldRetryRequest(error) {
  if (!error) return false;
  if (error.code === 'ECONNABORTED') return true; // timeout
  const status = error.response?.status;
  return status === 502 || status === 503 || status === 504; // errores temporales
}

function isIdempotentMethod(method) {
  const m = (method || 'get').toLowerCase();
  return m === 'get' || m === 'head' || m === 'options';
}

// Interceptor para manejar errores y reintentos controlados
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log legible
    // eslint-disable-next-line no-console
    console.error('Error en API:', error?.message || error);

    // 401/403: limpiar sesión sin reintentar
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const originalConfig = error.config || {};

    // Aplicar reintento solo a métodos idempotentes y errores transitorios
    if (shouldRetryRequest(error) && isIdempotentMethod(originalConfig.method)) {
      originalConfig.__retryCount = (originalConfig.__retryCount || 0) + 1;
      const maxRetries = 3;
      if (originalConfig.__retryCount <= maxRetries) {
        const delayMs = Math.min(1000 * 2 ** (originalConfig.__retryCount - 1), 4000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return api.request(originalConfig);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 