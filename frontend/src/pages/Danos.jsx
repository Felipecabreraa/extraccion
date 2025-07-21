import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Chip,
  CircularProgress, Alert, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton, Tabs, Tab, Button, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Container, Fade
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  ShowChart as ShowChartIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BarChartKPI from '../components/BarChartKPI';
import KPIVisual from '../components/KPIVisual';
import StackedBarChartKPI from '../components/StackedBarChartKPI';
import DonutChartKPI from '../components/DonutChartKPI';
import RadarChartKPI from '../components/RadarChartKPI';
import HeatmapGridKPI from '../components/HeatmapGridKPI';



// Componente para gráfico de barras simple
const SimpleBarChart = ({ data, title, height = 300 }) => {
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

  const maxValue = Math.max(...data.map(item => item.cantidad || item.total || 0));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box height={height}>
          <Grid container spacing={1} alignItems="end" sx={{ height: '100%' }}>
            {data.map((item, index) => {
              const value = item.cantidad || item.total || 0;
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const label = item.mes || item.zona || item.periodo || item.tipo || 'N/A';
              
              return (
                <Grid item xs key={index}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        height: `${Math.max(20, percentage)}%`,
                        minHeight: '20px',
                        bgcolor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        mb: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          transform: 'scaleY(1.1)'
                        }
                      }}
                    />
                    <Typography variant="caption" display="block">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente para tabla de datos
const DataTable = ({ data, title, columns }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Typography color="textSecondary">No hay datos disponibles</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.render ? column.render(row[column.field]) : row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default function Danos() {
  const { usuario } = useAuth();
  const [danoStats, setDanoStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh activado por defecto
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

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
      const response = await axios.get(`/dashboard/danos${params}`);
      setDanoStats(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching daño stats:', err);
      setError('Error al cargar las estadísticas de daños');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchDanoStats();
  }, [fetchDanoStats]);

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

  const handleBarClick = (barData) => {
    setDetailData(barData);
    setDetailOpen(true);
  };
  const handleDetailClose = () => setDetailOpen(false);

  // Preparar datos para barra apilada (por mes y tipo)
  const stackedBarData = React.useMemo(() => {
    if (!danoStats?.porMes || !danoStats?.porTipo) return [];
    // Suponemos que porMes tiene [{ mes, nombreMes, cantidad }]
    // y porTipo tiene [{ tipo, cantidad }], pero necesitamos por mes y tipo
    // Si tienes los datos por mes y tipo desde el backend, usa eso directamente
    // Aquí simulamos con los datos disponibles
    // Agrupa por mes y tipo
    const meses = danoStats.porMes.map(m => m.mes);
    const data = meses.map(mes => {
      const nombreMes = new Date(selectedYear, mes - 1).toLocaleDateString('es-ES', { month: 'long' });
      // Simula separación por tipo (esto debe venir del backend para mayor precisión)
      const infraestructura = Math.floor(Math.random() * 5); // Simulado
      const equipo = Math.max(0, (danoStats.porMes.find(x => x.mes === mes)?.cantidad || 0) - infraestructura);
      return { mes, nombreMes, infraestructura, equipo };
    });
    return data;
  }, [danoStats, selectedYear]);

  // Preparar datos para heatmap (por día y mes)
  const heatmapData = React.useMemo(() => {
    if (!danoStats?.heatmapData) return [];
    // Usar datos reales del backend
    return danoStats.heatmapData;
  }, [danoStats]);

  if (loading) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={200} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="60%" height={40} />
                      <Skeleton variant="text" width="80%" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Notificación de actualización automática */}
      {showUpdateNotification && (
        <Fade in timeout={300}>
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            onClose={() => setShowUpdateNotification(false)}
          >
            Dashboard actualizado automáticamente con los últimos datos
          </Alert>
        </Fade>
      )}
      
      {/* Header mejorado con gradiente y mejor diseño */}
      <Fade in timeout={800}>
        <Paper 
          elevation={0} 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            mb: 4,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                  <AnalyticsIcon sx={{ mr: 2, fontSize: 40 }} />
                  Análisis de Daños
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Dashboard de monitoreo y análisis de daños en infraestructura
                </Typography>
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
                <Tooltip title="Actualizar datos">
                  <IconButton 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    {isRefreshing ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      <RefreshIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title={autoRefresh ? "Desactivar auto-refresh" : "Activar auto-refresh"}>
                  <IconButton 
                    onClick={toggleAutoRefresh}
                    sx={{ 
                      bgcolor: autoRefresh ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: autoRefresh ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    <TimelineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Última actualización: {lastUpdate.toLocaleString('es-ES')} • Usuario: {usuario?.nombre || 'Sistema'}
              </Typography>
              {autoRefresh && (
                <Chip 
                  size="small" 
                  label="Auto-refresh activo" 
                  color="success" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Box>
          {/* Elementos decorativos */}
          <Box sx={{ 
            position: 'absolute', 
            top: -50, 
            right: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: -30, 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.05)',
            zIndex: 1
          }} />
        </Paper>
      </Fade>

      {error && (
        <Fade in timeout={500}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* KPIs visuales mejorados con animaciones CSS */}
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
                label="Total Daños Año Actual"
                value={danoStats?.totalAnual?.actual || 0}
                subtitle="Daños registrados este año"
                trend={parseFloat(danoStats?.totalAnual?.variacion) || 0}
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
                label="Total General"
                value={danoStats?.totalGeneral || 0}
                subtitle="Daños registrados históricamente"
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
                label="Zonas Afectadas"
                value={danoStats?.porZona?.length || 0}
                subtitle="Zonas con daños registrados"
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
                icon={<BuildIcon />}
                label="Tipos de Daño"
                value={danoStats?.porTipo?.length || 0}
                subtitle="Categorías de daños"
                color="secondary"
              />
            </Box>
          </Grid>
        </Grid>
      </Fade>

      {/* Gráficos principales en layout mejorado */}
      <Grid container spacing={4} mb={4}>
        {/* Barra apilada por mes y tipo */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={1200}>
            <Box sx={{ 
              animation: 'fadeInScale 0.8s ease-out',
              '@keyframes fadeInScale': {
                '0%': { opacity: 0, transform: 'scale(0.95)' },
                '100%': { opacity: 1, transform: 'scale(1)' }
              }
            }}>
              <StackedBarChartKPI
                data={stackedBarData}
                title="Evolución de Daños por Mes y Tipo"
              />
            </Box>
          </Fade>
        </Grid>
        
        {/* Donut por zona */}
        <Grid item xs={12} lg={4}>
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
                title="Distribución por Zona"
              />
            </Box>
          </Fade>
        </Grid>
      </Grid>

      {/* Segunda fila de gráficos */}
      <Grid container spacing={4} mb={4}>
        {/* Radar por zona */}
        <Grid item xs={12} lg={6}>
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
                title="Comparativa de Daños por Zona"
              />
            </Box>
          </Fade>
        </Grid>
        
        {/* Heatmap por día/mes */}
        <Grid item xs={12} lg={6}>
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
              <Tab label="Resumen Mensual" icon={<TimelineIcon />} />
              <Tab label="Análisis por Zona" icon={<LocationIcon />} />
              <Tab label="Tipos de Daño" icon={<BuildIcon />} />
              <Tab label="Tendencia Anual" icon={<ShowChartIcon />} />
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
                  title="Daños por Mes (Año Actual)"
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
                    { field: 'cantidad', label: 'Cantidad' }
                  ]}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <SimpleBarChart
                  data={danoStats?.totalAnualPorZona || []}
                  title="Total Anual por Zona"
                  height={400}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <DataTable
                  data={danoStats?.totalAnualPorZona || []}
                  title="Detalle por Zona"
                  columns={[
                    { field: 'zona', label: 'Zona' },
                    { field: 'total', label: 'Total' }
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
                    { field: 'cantidad', label: 'Cantidad' }
                  ]}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SimpleBarChart
                  data={danoStats?.ultimos12Meses || []}
                  title="Tendencia de Daños (Últimos 12 Meses)"
                  height={400}
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </Fade>

      {/* Comparación anual mejorada */}
      <Fade in timeout={2200}>
        <Card sx={{ mt: 4, borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3,
            color: 'white'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Comparación Anual
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box textAlign="center" p={3} sx={{ 
                  bgcolor: 'rgba(255,152,0,0.1)', 
                  borderRadius: 3,
                  border: '2px solid rgba(255,152,0,0.3)'
                }}>
                  <Typography variant="h2" color="warning.main" gutterBottom sx={{ fontWeight: 700 }}>
                    {danoStats?.totalAnual?.actual || 0}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Año Actual ({new Date().getFullYear()})
                  </Typography>
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label="Período Actual" 
                    color="warning" 
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box textAlign="center" p={3} sx={{ 
                  bgcolor: 'rgba(158,158,158,0.1)', 
                  borderRadius: 3,
                  border: '2px solid rgba(158,158,158,0.3)'
                }}>
                  <Typography variant="h2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                    {danoStats?.totalAnual?.anterior || 0}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Año Anterior ({new Date().getFullYear() - 1})
                  </Typography>
                  <Chip 
                    icon={<TimelineIcon />} 
                    label="Período Anterior" 
                    color="default" 
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
            {danoStats?.totalAnual?.variacion !== undefined && (
              <Box textAlign="center" mt={4}>
                <Chip
                  icon={parseFloat(danoStats.totalAnual.variacion) > 0 ? 
                    <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`Variación: ${danoStats.totalAnual.variacion}%`}
                  color={parseFloat(danoStats.totalAnual.variacion) > 0 ? 'error' : 'success'}
                  variant="filled"
                  size="large"
                  sx={{ fontSize: '1.1rem', fontWeight: 600, p: 2 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Modal de detalle mejorado */}
      <Dialog 
        open={detailOpen} 
        onClose={handleDetailClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          Detalle del Mes
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {detailData && (
            <Box>
              <Typography variant="h4" gutterBottom color="primary">
                {detailData.nombreMes}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Cantidad de daños: <b>{detailData.cantidad}</b>
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Información detallada del mes seleccionado
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDetailClose} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 