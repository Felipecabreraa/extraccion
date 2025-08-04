import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Alert, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton, Tabs, Tab, Button, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Container, Fade
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import BarChartKPI from '../components/BarChartKPI';
import KPIVisual from '../components/KPIVisual';
import DonutChartKPI from '../components/DonutChartKPI';
import RadarChartKPI from '../components/RadarChartKPI';
import HeatmapGridKPI from '../components/HeatmapGridKPI';
import AlertasInteligentes from '../components/AlertasInteligentes';
import GraficosPorZona from '../components/GraficosPorZona';
import { transformDanoStats } from '../utils/dataTransformers';
import { useEmitUpdate } from '../hooks/useAutoRefresh';

// Componente para gráfico de barras mejorado
const SimpleBarChart = ({ data, title, height = 400 }) => {
  if (!data || data.length === 0) {
    return (
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
            {title}
          </Typography>
          <Box height={height} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No hay datos disponibles</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Ordenar datos por valor descendente
  const sortedData = [...data].sort((a, b) => {
    const valueA = a.cantidad || a.total || 0;
    const valueB = b.cantidad || b.total || 0;
    return valueB - valueA;
  });

  const maxValue = Math.max(...sortedData.map(item => item.cantidad || item.total || 0));

  // Paleta de colores para las barras
  const colors = [
    '#3B82F6', // Azul
    '#F59E0B', // Naranja
    '#10B981', // Verde
    '#EC4899', // Rosa
    '#8B5CF6', // Púrpura
    '#EF4444', // Rojo
    '#6B7280', // Gris
    '#FCD34D', // Amarillo
    '#8BC34A', // Verde claro
    '#F44336'  // Rojo
  ];

  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: 6,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 600, 
          color: '#1e293b',
          mb: 3,
          textAlign: 'center'
        }}>
          {title}
        </Typography>
        
        <Box sx={{ 
          height: height - 100, 
          display: 'flex', 
          alignItems: 'end', 
          gap: 2,
          px: 2,
          position: 'relative'
        }}>
          {/* Líneas de fondo para mejor visualización */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
            opacity: 0.1
          }}>
            {[0, 25, 50, 75, 100].map((line, index) => (
              <Box key={index} sx={{
                height: '1px',
                bgcolor: '#64748b',
                width: '100%'
              }} />
            ))}
          </Box>

          {sortedData.map((item, index) => {
            const value = item.cantidad || item.total || 0;
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const label = item.mes || item.zona || item.periodo || item.tipo || 'N/A';
            const color = colors[index % colors.length];
            
            return (
              <Box 
                key={index} 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                {/* Barra principal */}
                <Box
                  sx={{
                    width: '80%',
                    height: `${Math.max(10, percentage)}%`,
                    minHeight: '20px',
                    background: `linear-gradient(180deg, ${color} 0%, ${color}dd 100%)`,
                    borderRadius: '8px 8px 0 0',
                    mb: 2,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'scaleY(1.05)',
                      boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                      '& .bar-tooltip': {
                        opacity: 1,
                        transform: 'translateY(-10px)'
                      }
                    }
                  }}
                >
                  {/* Tooltip en hover */}
                  <Box className="bar-tooltip" sx={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }}>
                    {value} daños
                  </Box>
                </Box>

                {/* Etiqueta del sector */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#475569',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    lineHeight: 1.2,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                </Typography>

                {/* Valor numérico */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: color,
                    mt: 0.5,
                    fontSize: '0.8rem'
                  }}
                >
                  {value}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Leyenda de colores */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
            Intensidad de daños:
          </Typography>
          {sortedData.slice(0, 5).map((item, index) => {
            const value = item.cantidad || item.total || 0;
            const color = colors[index % colors.length];
            const label = item.mes || item.zona || item.periodo || item.tipo || 'N/A';
            
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{
                  width: 12,
                  height: 12,
                  bgcolor: color,
                  borderRadius: 1
                }} />
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  {label} ({value})
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente para tabla de datos mejorada
const DataTable = ({ data, title, columns }) => {
  if (!data || data.length === 0) {
    return (
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
            {title}
          </Typography>
          <Typography color="textSecondary">No hay datos disponibles</Typography>
        </CardContent>
      </Card>
    );
  }

  // Ordenar datos por el primer campo numérico
  const sortedData = [...data].sort((a, b) => {
    const valueA = parseInt(a[columns[1]?.field]) || 0;
    const valueB = parseInt(b[columns[1]?.field]) || 0;
    return valueB - valueA;
  });

  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: 6,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 600, 
          color: '#1e293b',
          mb: 3,
          textAlign: 'center'
        }}>
          {title}
        </Typography>
        
        <TableContainer sx={{ 
          borderRadius: 2,
          border: '1px solid rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                '& th': { 
                  fontWeight: 'bold',
                  color: '#1e293b',
                  borderBottom: '2px solid #3b82f6'
                }
              }}>
                {columns.map((col, index) => (
                  <TableCell key={index} sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    textAlign: index === 0 ? 'left' : 'center'
                  }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => {
                const isEven = index % 2 === 0;
                return (
                  <TableRow 
                    key={index}
                    sx={{ 
                      bgcolor: isEven ? 'rgba(255,255,255,0.5)' : 'rgba(248,250,252,0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {columns.map((col, colIndex) => {
                      const value = row[col.field];
                      const isNumeric = typeof value === 'number' || !isNaN(parseInt(value));
                      
                      return (
                        <TableCell 
                          key={colIndex} 
                          sx={{ 
                            fontSize: '0.8rem',
                            textAlign: colIndex === 0 ? 'left' : 'center',
                            fontWeight: isNumeric ? 'bold' : 'normal',
                            color: isNumeric ? '#3b82f6' : '#475569'
                          }}
                        >
                          {isNumeric ? parseInt(value).toLocaleString() : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Resumen de datos */}
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: 'rgba(59, 130, 246, 0.05)', 
          borderRadius: 2,
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
            Resumen: {sortedData.length} sectores con daños registrados
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function Danos() {
  const [danoStats, setDanoStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedOrigen, setSelectedOrigen] = useState('todos');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Hook para emitir eventos de actualización
  const { emitUpdate } = useEmitUpdate();

  // Generar lista de años (últimos 5 años y el actual)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = [
    { value: '', label: 'Todos' },
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  const fetchDanoStats = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Construir query params
      let params = `?year=${selectedYear}`;
      if (selectedMonth) params += `&month=${selectedMonth}`;
      if (selectedOrigen !== 'todos') params += `&origen=${selectedOrigen}`;
      
      console.log('🔍 Fetching daño stats with params:', params);
      
      // TEMPORAL: Usar endpoint de prueba sin autenticación
      const response = await axios.get(`/danos/stats/test${params}`);
      
      // Transformar datos del backend al formato del frontend
      const transformedData = transformDanoStats(response.data);
      console.log('📊 Transformed data:', transformedData);
      
      setDanoStats(transformedData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching daño stats:', err);
      setError('Error al cargar las estadísticas de daños');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedYear, selectedMonth, selectedOrigen]);

  const fetchPredictiveData = useCallback(async () => {
    try {
      // TEMPORAL: Comentar datos predictivos hasta que esté implementado
      // const response = await axios.get(`/danos/predictive?year=${selectedYear}`);
      // setPredictiveData(response.data);
      // Por ahora no hay datos predictivos
    } catch (err) {
      console.error('Error fetching predictive data:', err);
      // No mostrar error para datos predictivos, son opcionales
    }
  }, []);

  useEffect(() => {
    fetchDanoStats();
    fetchPredictiveData();
  }, [fetchDanoStats, fetchPredictiveData]);

  // Auto-refresh cada 30 segundos si está activado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refresh: Actualizando estadísticas de daños...');
      fetchDanoStats(false);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, fetchDanoStats]);

  // Escuchar eventos de actualización de daños desde otras páginas
  useEffect(() => {
    const handleDanosUpdated = (event) => {
      console.log('Evento de actualización de daños recibido:', event.detail);
      // Actualizar inmediatamente cuando se detecte un cambio
      fetchDanoStats(false);
      
      // Mostrar notificación de actualización
      setShowUpdateNotification(true);
      setTimeout(() => setShowUpdateNotification(false), 3000);
    };

    window.addEventListener('danosUpdated', handleDanosUpdated);

    return () => {
      window.removeEventListener('danosUpdated', handleDanosUpdated);
    };
  }, [fetchDanoStats]);

  const handleRefresh = () => {
    fetchDanoStats(false);
    fetchPredictiveData();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleOrigenChange = (event) => {
    setSelectedOrigen(event.target.value);
  };

  const handleBarClick = (barData) => {
    setDetailData(barData);
    setDetailOpen(true);
  };

  const handleDetailClose = () => setDetailOpen(false);

  const handleAlertClick = (alerta) => {
    console.log('Alerta clickeada:', alerta);
    // Aquí se puede implementar navegación específica basada en la alerta
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={handleRefresh}>
            Reintentar
          </Button>
        </Box>
      </Container>
    );
  }

  // Preparar datos para gráficos
  const heatmapData = danoStats?.heatmapData || [];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header con título y controles */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }} />
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                  <AnalyticsIcon sx={{ mr: 2, fontSize: 40 }} />
                  Análisis de Daños
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Dashboard de monitoreo y análisis predictivo de daños en infraestructura
                </Typography>
                {danoStats?.metadata && (
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    Fuente: {danoStats.metadata.fuente} | Origen: {danoStats.metadata.origen} | Año: {danoStats.metadata.year}
                  </Typography>
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 100, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <InputLabel sx={{ color: 'white' }}>Año</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Año"
                    onChange={handleYearChange}
                    sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <InputLabel sx={{ color: 'white' }}>Mes</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Mes"
                    onChange={handleMonthChange}
                    sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <InputLabel sx={{ color: 'white' }}>Origen</InputLabel>
                  <Select
                    value={selectedOrigen}
                    label="Origen"
                    onChange={handleOrigenChange}
                    sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="historico_2025">Histórico 2025</MenuItem>
                    <MenuItem value="sistema_actual">Sistema Actual</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Actualizar datos">
                <IconButton onClick={handleRefresh} disabled={isRefreshing} sx={{ color: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={autoRefresh ? 'Desactivar auto-refresh' : 'Activar auto-refresh'}>
                <IconButton onClick={toggleAutoRefresh} sx={{ color: autoRefresh ? 'success.light' : 'white' }}>
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alertas Inteligentes */}
        <AlertasInteligentes 
          alertas={danoStats?.alertas || []} 
          onAlertClick={handleAlertClick}
        />

        {/* KPIs Principales */}
        <Fade in timeout={1000}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                animation: 'slideInUp 0.6s ease-out',
                '@keyframes slideInUp': {
                  '0%': { opacity: 0, transform: 'translateY(30px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                <KPIVisual
                  icon={<CalendarIcon />}
                  label="Total Daños"
                  value={danoStats?.resumen?.total_danos || 0}
                  subtitle="Daños registrados en el período"
                  trend={0}
                  color="warning"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                animation: 'slideInUp 0.6s ease-out 0.1s both',
                '@keyframes slideInUp': {
                  '0%': { opacity: 0, transform: 'translateY(30px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                <KPIVisual
                  icon={<AssessmentIcon />}
                  label="Órdenes con Daños"
                  value={danoStats?.resumen?.total_ordenes_con_danos || 0}
                  subtitle="Órdenes que presentan daños"
                  color="error"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                animation: 'slideInUp 0.6s ease-out 0.2s both',
                '@keyframes slideInUp': {
                  '0%': { opacity: 0, transform: 'translateY(30px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                <KPIVisual
                  icon={<LocationIcon />}
                  label="Sectores Afectados"
                  value={danoStats?.resumen?.sectores_con_danos || 0}
                  subtitle="Sectores con daños registrados"
                  color="info"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                animation: 'slideInUp 0.6s ease-out 0.3s both',
                '@keyframes slideInUp': {
                  '0%': { opacity: 0, transform: 'translateY(30px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                <KPIVisual
                  icon={<PsychologyIcon />}
                  label="Tipos de Daños"
                  value={danoStats?.resumen?.tipos_danos_diferentes || 0}
                  subtitle="Diferentes tipos de daños"
                  color="success"
                />
              </Box>
            </Grid>
          </Grid>
        </Fade>

        {/* Análisis Predictivo */}
        {/* TEMPORAL: Comentar hasta que esté implementado
        <AnalisisPredictivo 
          datos={predictiveData} 
          loading={predictiveLoading}
        />
        */}

        {/* Gráficos Principales */}
        <Grid container spacing={4} mb={4}>
          {/* Gráfico de daños por tipo */}
          <Grid xs={12} lg={8}>
            <Fade in timeout={1200}>
              <Box sx={{ 
                animation: 'fadeInScale 0.8s ease-out',
                '@keyframes fadeInScale': {
                  '0%': { opacity: 0, transform: 'scale(0.95)' },
                  '100%': { opacity: 1, transform: 'scale(1)' }
                }
              }}>
              <BarChartKPI
                data={danoStats?.porTipo || []}
                title="Daños por Tipo"
                height={400}
                onBarClick={handleBarClick}
              />
            </Box>
            </Fade>
          </Grid>
          
          {/* Donut por sector */}
          <Grid xs={12} lg={4}>
            <Fade in timeout={1400}>
              <Box sx={{ 
                animation: 'fadeInScale 0.8s ease-out 0.2s both',
                '@keyframes fadeInScale': {
                  '0%': { opacity: 0, transform: 'scale(0.95)' },
                  '100%': { opacity: 1, transform: 'scale(1)' }
                }
              }}>
              <DonutChartKPI
                data={danoStats?.porZona || []}
                title="Distribución por Sector"
                height={500}
                width="100%"
              />
            </Box>
            </Fade>
          </Grid>
        </Grid>

        {/* Segunda fila de gráficos */}
        <Grid container spacing={4} mb={4}>
          {/* Radar por sector */}
          <Grid xs={12} lg={6}>
            <Fade in timeout={1600}>
              <Box sx={{ 
                animation: 'slideInLeft 0.8s ease-out',
                '@keyframes slideInLeft': {
                  '0%': { opacity: 0, transform: 'translateX(-30px)' },
                  '100%': { opacity: 1, transform: 'translateX(0)' }
                }
              }}>
              <RadarChartKPI
                data={danoStats?.porZona || []}
                title="Comparativa de Daños por Sector"
              />
            </Box>
            </Fade>
          </Grid>
          
          {/* Heatmap por día/mes */}
          <Grid xs={12} lg={6}>
            <Fade in timeout={1800}>
              <Box sx={{ 
                animation: 'slideInRight 0.8s ease-out',
                '@keyframes slideInRight': {
                  '0%': { opacity: 0, transform: 'translateX(30px)' },
                  '100%': { opacity: 1, transform: 'translateX(0)' }
                }
              }}>
              <HeatmapGridKPI
                data={heatmapData}
                title="Mapa de Calor - Daños por Día/Mes"
              />
            </Box>
            </Fade>
          </Grid>
        </Grid>

        {/* Tabs mejoradas para diferentes vistas */}
        <Fade in timeout={2000}>
          <Paper sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
              p: 1
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant="scrollable" 
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: 'white',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderRadius: 2
                    }
                  }
                }}
              >
                <Tab label="Evolución Mensual" icon={<TimelineIcon />} />
                <Tab label="Análisis por Sector" icon={<LocationIcon />} />
                <Tab label="Tipos de Daño" icon={<BuildIcon />} />
                <Tab label="Supervisores" icon={<AssessmentIcon />} />
                <Tab label="Análisis por Zona" icon={<LocationIcon />} />
              </Tabs>
            </Box>
          </Paper>
        </Fade>

        {/* Contenido de las tabs con mejor layout */}
        <Fade in timeout={500}>
          <Box>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <BarChartKPI
                    data={danoStats?.porMes || []}
                    title="Evolución de Daños por Mes"
                    height={400}
                    onBarClick={handleBarClick}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <DataTable
                    data={danoStats?.porMes || []}
                    title="Detalle Mensual"
                    columns={[
                      { field: 'nombreMes', label: 'Mes' },
                      { field: 'cantidad', label: 'Órdenes' },
                      { field: 'total', label: 'Daños' }
                    ]}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <SimpleBarChart
                    data={danoStats?.porZona || []}
                    title="Daños por Sector"
                    height={400}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <DataTable
                    data={danoStats?.porZona || []}
                    title="Detalle por Sector"
                    columns={[
                      { field: 'zona', label: 'Sector' },
                      { field: 'cantidad', label: 'Órdenes' },
                      { field: 'total', label: 'Daños' }
                    ]}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <SimpleBarChart
                    data={danoStats?.porTipo || []}
                    title="Daños por Tipo"
                    height={400}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <DataTable
                    data={danoStats?.porTipo || []}
                    title="Detalle por Tipo"
                    columns={[
                      { field: 'tipo', label: 'Tipo' },
                      { field: 'cantidad', label: 'Órdenes' },
                      { field: 'total', label: 'Daños' }
                    ]}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <SimpleBarChart
                    data={danoStats?.porSupervisor || []}
                    title="Daños por Supervisor"
                    height={400}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <DataTable
                    data={danoStats?.porSupervisor || []}
                    title="Detalle por Supervisor"
                    columns={[
                      { field: 'supervisor', label: 'Supervisor' },
                      { field: 'cantidad', label: 'Órdenes' },
                      { field: 'total', label: 'Daños' }
                    ]}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 4 && (
              <GraficosPorZona 
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                selectedOrigen={selectedOrigen}
              />
            )}
          </Box>
        </Fade>

        {/* Resumen de estadísticas */}
        <Fade in timeout={2200}>
          <Card sx={{ mt: 4, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                Resumen de Estadísticas
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box textAlign="center" p={3}>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {danoStats?.resumen?.total_danos || 0}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Total de Daños
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      En {danoStats?.resumen?.total_ordenes_con_danos || 0} órdenes de servicio
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box textAlign="center" p={3}>
                    <Typography variant="h4" color="textSecondary" gutterBottom>
                      {danoStats?.resumen?.tipos_danos_diferentes || 0}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Tipos de Daños Diferentes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      En {danoStats?.resumen?.sectores_con_danos || 0} sectores afectados
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Dialog para detalles */}
        <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="md" fullWidth>
          <DialogTitle>Detalles del Daño</DialogTitle>
          <DialogContent>
            {detailData && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {detailData.mes || detailData.zona || detailData.tipo}
                </Typography>
                <Typography variant="body1">
                  Cantidad: {detailData.cantidad || detailData.total}
                </Typography>
                {/* Agregar más detalles según el tipo de dato */}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDetailClose}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Notificación de actualización */}
        {showUpdateNotification && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: 'success.main',
              color: 'white',
              p: 2,
              borderRadius: 2,
              zIndex: 9999,
              animation: 'slideInUp 0.3s ease-out'
            }}
          >
            <Typography variant="body2">
              ✅ Datos actualizados automáticamente
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
} 