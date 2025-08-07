import React from 'react';
import { Box, Alert, AlertTitle, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAlert = styled(Alert)(({ theme }) => ({
  position: 'fixed',
  top: '12px',
  right: '12px',
  zIndex: 9999,
  borderRadius: '6px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  backgroundColor: '#ff9800',
  color: '#fff',
  border: 'none',
  padding: '4px 10px',
  fontSize: '0.8rem',
  minWidth: 'auto',
  maxWidth: '100px',
  '& .MuiAlert-icon': {
    color: '#fff',
    fontSize: '1rem',
    marginRight: '4px',
  },
  '& .MuiAlert-message': {
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.8rem',
    padding: '0',
    lineHeight: '1.2',
  },
  '& .MuiAlertTitle-root': {
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.8rem',
    padding: '0',
    lineHeight: '1.2',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  position: 'fixed',
  top: '12px',
  right: '12px',
  zIndex: 9999,
  backgroundColor: '#ff9800',
  color: '#fff',
  fontSize: '0.75rem',
  height: '28px',
  '& .MuiChip-label': {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0 10px',
  },
}));

const StyledDot = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '15px',
  right: '15px',
  zIndex: 9999,
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: '#ff9800',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
}));

const EnvironmentBanner = () => {
  const environment = process.env.REACT_APP_ENV || process.env.REACT_APP_ENVIRONMENT || 'development';
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const dbName = process.env.REACT_APP_DB_NAME || '';
  
  // Solo mostrar el banner si estamos conectados específicamente a la base de datos de prueba
  const isTestEnvironment = 
    environment === 'test' || 
    apiUrl.includes('test') || 
    apiUrl.includes('staging') ||
    dbName.includes('test') ||
    (environment !== 'production' && apiUrl.includes('railway.app'));
  
  // No mostrar en producción o si no es ambiente de prueba
  if (environment === 'production' || !isTestEnvironment) {
    return null;
  }

  // Elegir el estilo del banner (puedes cambiar esto)
  const bannerStyle = 'chip'; // Opciones: 'alert', 'chip', 'dot'

  switch (bannerStyle) {
    case 'alert':
      return (
        <StyledAlert severity="warning">
          <AlertTitle sx={{ color: '#fff', fontWeight: '600' }}>
            PRUEBA
          </AlertTitle>
        </StyledAlert>
      );
    
    case 'dot':
      return <StyledDot />;
    
    case 'chip':
    default:
      return (
        <StyledChip
          label="PRUEBA"
          size="small"
          variant="filled"
        />
      );
  }
};

export default EnvironmentBanner; 