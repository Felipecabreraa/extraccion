import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; // Importar la instancia configurada de axios

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Verificar token al cargar
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        // Despertar backend antes de verificar (Render puede estar en cold start)
        await pingHealthWithRetry();
        const response = await api.get('/auth/verify'); // Usar la instancia configurada
        setUsuario(response.data.usuario);
        setError(null);
      } catch (err) {
        console.error('Error verificando token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Configurar interceptor para manejar errores de autenticación
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', credentials); // Usar la instancia configurada
      const { token: newToken, usuario: userData } = response.data;
      
      setUsuario(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error en el inicio de sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData); // Usar la instancia configurada
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error en el registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/auth/profile', profileData); // Usar la instancia configurada
      setUsuario(response.data.usuario);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error actualizando perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/auth/change-password', passwordData); // Usar la instancia configurada
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error cambiando contraseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Helpers ---
  async function pingHealthWithRetry() {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await api.get('/health'); // backend expone /api/health
        return;
      } catch (e) {
        const isLast = attempt === maxAttempts;
        if (isLast) throw e;
        // backoff exponencial hasta 2s
        const delay = Math.min(500 * 2 ** (attempt - 1), 2000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = !!token && !!usuario;
  const isAdmin = usuario?.rol === 'administrador';
  const isSupervisor = usuario?.rol === 'supervisor';
  const isOperador = usuario?.rol === 'operador';

  const value = {
    user: usuario,
    usuario,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isSupervisor,
    isOperador,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 