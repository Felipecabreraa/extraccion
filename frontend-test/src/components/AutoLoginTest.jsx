import React, { useEffect } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AutoLoginTest = () => {
  const { login, environment } = useAuth();

  const handleAutoLogin = async () => {
    try {
      await login({
        email: 'test@extraccion.com',
        password: 'test123'
      });
    } catch (error) {
      console.error('Error en auto-login:', error);
    }
  };

  // Auto-login si estamos en ambiente de prueba
  useEffect(() => {
    if (environment === 'test') {
      handleAutoLogin();
    }
  }, [environment]);

  if (environment !== 'test') {
    return null;
  }

  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🧪 Ambiente de Prueba
        </Typography>
        <Typography variant="body2">
          Credenciales de prueba: test@extraccion.com / test123
        </Typography>
      </Alert>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleAutoLogin}
        sx={{ mt: 1 }}
      >
        Acceso Automático
      </Button>
    </Box>
  );
};

export default AutoLoginTest; 