import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, Tooltip } from '@mui/material';

export default function HeatmapGridKPI({ data, title, height = 350 }) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Detectar cambios en los datos para mostrar animación de actualización
  useEffect(() => {
    if (data && data.length > 0) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // Memoizar el procesamiento de datos para evitar recálculos innecesarios
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { values: [], maxValue: 0 };
    }

    // data: [{ dia, mes, cantidad }]
    // Creamos una matriz de [mes][dia]
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    // Inicializar matriz
    const values = meses.map(() => Array(31).fill(0));
    
    // Procesar datos reales
    data.forEach(item => {
      if (item.mes && item.dia && item.cantidad) {
        const mesIndex = item.mes - 1;
        const diaIndex = item.dia - 1;
        if (mesIndex >= 0 && mesIndex < 12 && diaIndex >= 0 && diaIndex < 31) {
          values[mesIndex][diaIndex] = item.cantidad;
        }
      }
    });

    // Encontrar el valor máximo para normalizar los colores
    const maxValue = Math.max(...values.flat(), 1); // Mínimo 1 para evitar división por cero

    return { values, maxValue };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box height={height} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No hay datos disponibles</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const { values, maxValue } = processedData;
  const dias = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const meses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const getCellColor = (value) => {
    if (value === 0) return '#f5f5f5';
    const intensity = Math.min(0.1 + (value / maxValue) * 0.9, 1);
    return `rgba(0, 188, 212, ${intensity})`;
  };

  const getTextColor = (value) => {
    if (value === 0) return '#999';
    return value > maxValue * 0.5 ? '#fff' : '#333';
  };

  return (
    <Card sx={{ 
      borderRadius: 4, 
      p: 2,
      transition: 'all 0.3s ease',
      transform: isUpdating ? 'scale(1.02)' : 'scale(1)',
      boxShadow: isUpdating ? 8 : 6
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">{title}</Typography>
          {isUpdating && (
            <Typography variant="caption" color="primary" sx={{ 
              animation: 'pulse 1s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }}>
              Actualizando...
            </Typography>
          )}
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 800 }}>
            {/* Header con días */}
            <Grid container spacing={0.5} sx={{ mb: 1 }}>
              <Grid item xs={1}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Mes
                </Typography>
              </Grid>
              {dias.map((dia, index) => (
                <Grid item xs key={index}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', textAlign: 'center' }}>
                    {dia}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Filas con meses y datos */}
            {meses.map((mes, mesIndex) => (
              <Grid container spacing={0.5} key={mes} sx={{ mb: 0.5 }}>
                <Grid item xs={1}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {mes}
                  </Typography>
                </Grid>
                {dias.map((dia, diaIndex) => {
                  const value = values[mesIndex][diaIndex];
                  return (
                    <Grid item xs key={diaIndex}>
                      <Tooltip 
                        title={`${mes} ${dia}: ${value} daños`}
                        arrow
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: 24,
                            backgroundColor: getCellColor(value),
                            color: getTextColor(value),
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: value > 0 ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            animation: isUpdating && value > 0 ? 'cellUpdate 0.5s ease-in-out' : 'none',
                            '@keyframes cellUpdate': {
                              '0%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.1)' },
                              '100%': { transform: 'scale(1)' }
                            },
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: 1
                            }
                          }}
                        >
                          {value > 0 ? value : ''}
                        </Box>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Box>
        </Box>
        
        {/* Leyenda y estadísticas */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Intensidad: 
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <Box
                  key={value}
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: getCellColor(value),
                    borderRadius: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    color: getTextColor(value),
                    fontWeight: 'bold'
                  }}
                >
                  {value}
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Total de daños */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Total daños:
            </Typography>
            <Typography variant="caption" fontWeight="bold" color="primary">
              {data ? data.reduce((sum, item) => sum + (item.cantidad || 0), 0) : 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 