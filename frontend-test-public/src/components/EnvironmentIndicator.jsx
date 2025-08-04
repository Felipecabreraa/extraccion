import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const EnvironmentIndicator = () => {
  const { environment } = useAuth();
  
  if (!environment || environment === 'production') {
    return null; // No mostrar en producción
  }
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <Chip
        label={`🧪 AMBIENTE DE PRUEBA`}
        color="warning"
        variant="filled"
        sx={{
          fontWeight: 'bold',
          fontSize: '0.8rem',
          backgroundColor: '#ff9800',
          color: 'white',
          '& .MuiChip-label': {
            fontWeight: 'bold'
          }
        }}
      />
    </Box>
  );
};

export default EnvironmentIndicator; 