import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

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
  const [environment, setEnvironment] = useState(process.env.REACT_APP_ENVIRONMENT || 'production');

  const logout = () => {
    console.log('Cerrando sesión...');
    setUsuario(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    sessionStorage.clear();
  };

  // Verificar token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        console.log('No hay token almacenado');
        setLoading(false);
        return;
      }

      try {
        console.log('Verificando token...');
        const response = await axios.get('/auth/verify');
        console.log('Token válido:', response.data.usuario);
        setUsuario(response.data.usuario);
        setError(null);
      } catch (err) {
        console.error('Error verificando token:', err);
        if (err.response?.status === 401) {
          console.log('Token inválido o expirado, cerrando sesión');
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Configurar interceptor para manejar errores de autenticación
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('Error 401 detectado, cerrando sesión');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando login...');
      const response = await axios.post('/auth/login', credentials);
      const { token: newToken, usuario: userData, environment: env } = response.data;
      
      console.log('Login exitoso:', userData);
      setUsuario(userData);
      setToken(newToken);
      setEnvironment(env || environment);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (err) {
      console.error('Error en login:', err);
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
      
      const response = await axios.post('/auth/register', userData);
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
      
      const response = await axios.put('/auth/profile', profileData);
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
      
      const response = await axios.put('/auth/change-password', passwordData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error cambiando contraseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

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
    environment,
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