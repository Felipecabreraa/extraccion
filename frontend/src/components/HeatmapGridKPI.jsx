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
    console.log('🔍 Procesando datos para heatmap:', data);
    
    if (!data || data.length === 0) {
      console.log('❌ No hay datos para procesar');
      return { values: [], maxValue: 0 };
    }

    // data: [{ day, month, value }] - estructura que viene del transformador
    // Creamos una matriz de [mes][dia]
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    // Inicializar matriz
    const values = meses.map(() => Array(31).fill(0));
    
    // Procesar datos reales
    data.forEach(item => {
      console.log('📊 Procesando item:', item);
      
      // Verificar si tenemos day, month, value (nueva estructura)
      if (item.day !== undefined && item.month !== undefined && item.value !== undefined) {
        const mesIndex = item.month - 1;
        const diaIndex = item.day - 1;
        if (mesIndex >= 0 && mesIndex < 12 && diaIndex >= 0 && diaIndex < 31) {
          values[mesIndex][diaIndex] = parseInt(item.value) || 0;
          console.log(`✅ Agregado valor ${item.value} en mes ${item.month}, día ${item.day}`);
        }
      }
      // Verificar si tenemos dia, mes, cantidad (estructura antigua)
      else if (item.dia !== undefined && item.mes !== undefined && item.cantidad !== undefined) {
        const mesIndex = item.mes - 1;
        const diaIndex = item.dia - 1;
        if (mesIndex >= 0 && mesIndex < 12 && diaIndex >= 0 && diaIndex < 31) {
          values[mesIndex][diaIndex] = parseInt(item.cantidad) || 0;
          console.log(`✅ Agregado valor ${item.cantidad} en mes ${item.mes}, día ${item.dia}`);
        }
      }
    });

    // Encontrar el valor máximo para normalizar los colores
    const maxValue = Math.max(...values.flat(), 1); // Mínimo 1 para evitar división por cero
    console.log('🎯 Valor máximo encontrado:', maxValue);
    console.log('📊 Matriz de valores:', values);

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
    if (value === 0) return '#f8f9fa';
    
    // Paleta de colores mejorada para mejor contraste
    if (value >= maxValue * 0.8) return '#dc2626'; // Rojo intenso
    if (value >= maxValue * 0.6) return '#ea580c'; // Naranja
    if (value >= maxValue * 0.4) return '#f59e0b'; // Amarillo
    if (value >= maxValue * 0.2) return '#10b981'; // Verde
    return '#3b82f6'; // Azul claro
  };

  const getTextColor = (value) => {
    if (value === 0) return '#9ca3af';
    return '#ffffff'; // Texto blanco para mejor contraste
  };

  const getIntensityLabel = (value) => {
    if (value === 0) return 'Sin daños';
    if (value >= maxValue * 0.8) return 'Muy alto';
    if (value >= maxValue * 0.6) return 'Alto';
    if (value >= maxValue * 0.4) return 'Medio';
    if (value >= maxValue * 0.2) return 'Bajo';
    return 'Muy bajo';
  };

  return (
    <Card sx={{ 
      borderRadius: 4, 
      p: 3,
      transition: 'all 0.3s ease',
      transform: isUpdating ? 'scale(1.02)' : 'scale(1)',
      boxShadow: isUpdating ? 8 : 6,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Distribución de daños por día y mes
            </Typography>
          </Box>
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
          <Box sx={{ minWidth: 900 }}>
            {/* Header con días */}
            <Grid container spacing={0.5} sx={{ mb: 2 }}>
              <Grid item xs={1}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#475569' }}>
                  Mes
                </Typography>
              </Grid>
              {dias.map((dia, index) => (
                <Grid item xs key={index}>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 'bold', 
                    display: 'block', 
                    textAlign: 'center',
                    color: '#475569',
                    fontSize: '0.75rem'
                  }}>
                    {dia}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Filas con meses y datos */}
            {meses.map((mes, mesIndex) => (
              <Grid container spacing={0.5} key={mes} sx={{ mb: 0.5 }}>
                <Grid item xs={1}>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 'bold',
                    color: '#475569',
                    fontSize: '0.8rem'
                  }}>
                    {mes}
                  </Typography>
                </Grid>
                {dias.map((dia, diaIndex) => {
                  const value = values[mesIndex][diaIndex];
                  return (
                    <Grid item xs key={diaIndex}>
                      <Tooltip 
                        title={`${mes} ${dia}: ${value} daños (${getIntensityLabel(value)})`}
                        arrow
                        placement="top"
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: 28,
                            backgroundColor: getCellColor(value),
                            color: getTextColor(value),
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: value > 0 ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: value > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            animation: isUpdating && value > 0 ? 'cellUpdate 0.5s ease-in-out' : 'none',
                            '@keyframes cellUpdate': {
                              '0%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.1)' },
                              '100%': { transform: 'scale(1)' }
                            },
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: 3,
                              zIndex: 1
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
        
        {/* Leyenda y estadísticas mejoradas */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: 'rgba(255,255,255,0.7)', 
          borderRadius: 2,
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body2" fontWeight="bold" color="#1e293b" gutterBottom>
                Leyenda de Intensidad
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { value: 0, label: 'Sin daños' },
                  { value: 1, label: 'Muy bajo' },
                  { value: 2, label: 'Bajo' },
                  { value: 3, label: 'Medio' },
                  { value: 4, label: 'Alto' },
                  { value: 5, label: 'Muy alto' }
                ].map((item) => (
                  <Box key={item.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: getCellColor(item.value),
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: getTextColor(item.value),
                        fontWeight: 'bold',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    >
                      {item.value}
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Estadísticas */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" fontWeight="bold" color="#1e293b" gutterBottom>
                Estadísticas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Total daños:
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color="error.main">
                    {data ? data.reduce((sum, item) => {
                      const itemValue = item.value !== undefined ? item.value : (item.cantidad || 0);
                      return sum + parseInt(itemValue) || 0;
                    }, 0) : 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Días con daños:
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color="info.main">
                    {data ? data.filter(item => {
                      const itemValue = item.value !== undefined ? item.value : (item.cantidad || 0);
                      return parseInt(itemValue) > 0;
                    }).length : 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Promedio por día:
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color="success.main">
                    {data && data.length > 0 ? 
                      (data.reduce((sum, item) => {
                        const itemValue = item.value !== undefined ? item.value : (item.cantidad || 0);
                        return sum + parseInt(itemValue) || 0;
                      }, 0) / data.filter(item => {
                        const itemValue = item.value !== undefined ? item.value : (item.cantidad || 0);
                        return parseInt(itemValue) > 0;
                      }).length).toFixed(1) : '0'
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 