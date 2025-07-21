import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(usuario.rol)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
        p: 3
      }}>
        <LockIcon sx={{ fontSize: 64, color: '#b71c1c' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', maxWidth: 400 }}>
          No tienes permisos para acceder a esta página. 
          Solo los usuarios con rol de {allowedRoles.join(' o ')} pueden acceder.
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, maxWidth: 400 }}>
          Tu rol actual: <strong>{usuario.rol}</strong>
        </Alert>
      </Box>
    );
  }

  return children;
} 