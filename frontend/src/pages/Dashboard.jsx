import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Chip,
  CircularProgress, Alert, IconButton, Tooltip, Skeleton,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  TrendingDown as TrendingDownIcon,
  Equalizer as EqualizerIcon,
  Engineering as EngineeringIcon,
  PrecisionManufacturing,
  Apartment,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

// Componente de gráficos mejorado con datos reales
const DashboardCharts = ({ metrics }) => {
  if (!metrics || !metrics.charts) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gráficos
              </Typography>
              <LoadingSpinner message="Cargando gráficos..." />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 Tendencias Mensuales
            </Typography>
            <Box height={300}>
              {metrics.charts.tendenciasMensuales && metrics.charts.tendenciasMensuales.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Últimos {metrics.charts.tendenciasMensuales.length} meses
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {metrics.charts.tendenciasMensuales.map((item, index) => (
                      <Box key={index} display="flex" justifyContent="space-between" alignItems="center" p={1} sx={{ bgcolor: 'rgba(102,126,234,0.05)', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.mes}
                        </Typography>
                        <Box display="flex" gap={2}>
                          <Chip
                            label={`${item.planillas} planillas`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${item.pabellones} pabellones`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="textSecondary">
                    No hay datos de tendencias disponibles
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Estado de Planillas
            </Typography>
            <Box height={300}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ bgcolor: 'rgba(76,175,80,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Activas
                  </Typography>
                  <Chip label={metrics.planillasActivas || 0} color="success" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ bgcolor: 'rgba(255,152,0,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Pendientes
                  </Typography>
                  <Chip label={metrics.planillasPendientes || 0} color="warning" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ bgcolor: 'rgba(33,150,243,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Completadas
                  </Typography>
                  <Chip label={metrics.planillasCompletadas || 0} color="info" size="small" />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏢 Top Sectores
            </Typography>
            <Box height={300}>
              {metrics.charts.rendimientoPorSector && metrics.charts.rendimientoPorSector.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Sectores con mayor actividad
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {metrics.charts.rendimientoPorSector.slice(0, 5).map((sector, index) => (
                      <Box key={index} display="flex" justifyContent="space-between" alignItems="center" p={1} sx={{ bgcolor: 'rgba(156,39,176,0.05)', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sector.nombre}
                        </Typography>
                        <Box display="flex" gap={2}>
                          <Chip
                            label={`${sector.planillas} planillas`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${sector.pabellones} pabellones`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="textSecondary">
                    No hay datos de sectores disponibles
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default function Dashboard() {
  const { usuario } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    origen: 'todos'
  });

  // Función para obtener datos del dashboard
  const fetchDashboardData = useCallback(async (showLoading = true, signal = null) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      // Construir parámetros de consulta
      const params = new URLSearchParams({
        year: filtros.year,
        origen: filtros.origen
      });

      console.log('📊 Obteniendo datos del dashboard...');

      // Intentar con la ruta principal primero
      let response;
      try {
        console.log('🔄 Intentando ruta principal: /dashboard/frontend-metrics');
        response = await axios.get(`/dashboard/frontend-metrics?${params}`, { signal });
        console.log('✅ Datos obtenidos de ruta principal');
      } catch (error) {
        // Si falla, intentar con la ruta alternativa
        console.log('🔄 Ruta principal falló, intentando ruta alternativa...');
        console.log('Error en ruta principal:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        
        try {
          response = await axios.get(`/unified/test-metrics?${params}`, { signal });
          console.log('✅ Datos obtenidos de ruta alternativa');
        } catch (alternativeError) {
          console.error('❌ Ambas rutas fallaron:', {
            principal: error.message,
            alternativa: alternativeError.message
          });
          throw alternativeError;
        }
      }

      // Transformar los datos si es necesario
      const data = response.data;
      
      // Asegurar que los campos requeridos estén presentes
      const transformedData = {
        ...data,
        operadoresActivos: data.operadoresActivos || data.totalOperadores || 0,
        eficienciaPromedio: data.eficienciaPromedio || data.eficienciaGlobal || 0,
        totalPlanillas: data.totalPlanillas || data.total || 0,
        totalPabellones: data.totalPabellones || data.totalPabellonesUnicos || 0,
        planillasMes: data.planillasMes || data.planillasDelMes || 0,
        pabellonesMes: data.pabellonesMes || data.pabellonesDelMes || 0,
        mts2Mes: data.mts2Mes || data.mts2DelMes || 0,
        charts: data.charts || {
          tendenciasMensuales: data.tendenciasMensuales || [],
          rendimientoPorSector: data.rendimientoPorSector || []
        }
      };

      setMetrics(transformedData);
      setError(null);
      console.log('✅ Datos del dashboard procesados correctamente');
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('⏹️ Request cancelado');
        return;
      }
      
      console.error('❌ Error fetching dashboard data:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      if (!err.response) {
        setError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
      } else {
        setError('Error al cargar los datos del dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [filtros.year, filtros.origen]);

  // Usar el hook de auto-refresh
  const {
    isRefreshing,
    lastUpdate,
    autoRefreshEnabled,
    manualRefresh,
    toggleAutoRefresh
  } = useAutoRefresh(fetchDashboardData, 30000, true, [filtros.year, filtros.origen]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    manualRefresh();
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const getVariationColor = (variation) => {
    const num = parseFloat(variation);
    if (num > 0) return 'success';
    if (num < 0) return 'error';
    return 'default';
  };

  const getVariationIcon = (variation) => {
    const num = parseFloat(variation);
    if (num > 0) return <TrendingUpIcon />;
    if (num < 0) return <TrendingDownIcon />;
    return <EqualizerIcon />;
  };

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

        <Grid container spacing={3} mb={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item}>
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

        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <IconButton onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshIcon />
          </IconButton>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3} className="dashboard-container">
      {/* Header con controles */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            📊 Dashboard Principal
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Filtros */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Año</InputLabel>
            <Select
              value={filtros.year}
              label="Año"
              onChange={(e) => handleFiltroChange('year', e.target.value)}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Origen</InputLabel>
            <Select
              value={filtros.origen}
              label="Origen"
              onChange={(e) => handleFiltroChange('origen', e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="sistema">Sistema Actual</MenuItem>
              <MenuItem value="historico">Histórico</MenuItem>
            </Select>
          </FormControl>

          {/* Controles de actualización */}
          <Tooltip title="Actualizar datos">
            <IconButton onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={autoRefreshEnabled ? 'Desactivar auto-refresh' : 'Activar auto-refresh'}>
            <IconButton onClick={toggleAutoRefresh} color={autoRefreshEnabled ? 'success' : 'default'}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPIs Principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {metrics?.totalPlanillas || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Planillas
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {metrics?.totalPabellones || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Pabellones
                  </Typography>
                </Box>
                <Apartment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {metrics?.operadoresActivos || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Operadores Activos
                  </Typography>
                </Box>
                <EngineeringIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {metrics?.eficienciaPromedio || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Eficiencia Promedio
                  </Typography>
                </Box>
                <PrecisionManufacturing sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <DashboardCharts metrics={metrics} />
    </Box>
  );
} 