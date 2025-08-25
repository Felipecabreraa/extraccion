import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Skeleton,
  CircularProgress,
  Divider,
  LinearProgress
} from '@mui/material';
import ResponsiveWrapper from '../components/ResponsiveWrapper';
import ResponsiveCard from '../components/ResponsiveCard';
import { useResponsive } from '../context/ResponsiveContext';
import { 
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  LocalGasStation as FuelIcon,
  AreaChart as AreaIcon,
  Speed as EfficiencyIcon,
  Assessment as MetricsIcon,
  Timeline as TimelineIcon,
  ShowChart as ChartIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Componente de métricas principales mejorado
const MainMetrics = ({ metrics }) => {
  if (!metrics) return null;

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatArea = (m2) => {
    if (!m2 || m2 === 0) return '0 m²';
    if (m2 >= 1000000) return `${(m2 / 1000000).toFixed(1)}M m²`;
    if (m2 >= 1000) return `${(m2 / 1000).toFixed(1)}K m²`;
    return `${formatNumber(m2)} m²`;
  };

  const formatFuel = (liters) => {
    if (!liters || liters === 0) return '0 L';
    if (liters >= 1000000) return `${(liters / 1000000).toFixed(1)}M L`;
    if (liters >= 1000) return `${(liters / 1000).toFixed(1)}K L`;
    return `${formatNumber(liters)} L`;
  };

  return (
    <ResponsiveWrapper gridColumns={4} gap={3} mb={3}>
      {/* Superficie Limpiada */}
      <ResponsiveCard sx={{ 
        bgcolor: 'rgba(76,175,80,0.05)', 
        border: '1px solid rgba(76,175,80,0.1)',
        height: '100%'
      }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                <AreaIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Superficie Limpiada
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                  {formatArea(metrics.totalMetrosSuperficie || 0)}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="textSecondary">
                Promedio: {formatArea(metrics.promedioMetrosPorPlanilla || 0)}
              </Typography>
              <Chip 
                label={`${metrics.planillasMes || 0} planillas`} 
                size="small" 
                color="success" 
                variant="outlined"
              />
            </Box>
          </CardContent>
        </ResponsiveCard>

      {/* Combustible Consumido */}
      <ResponsiveCard sx={{ 
          bgcolor: 'rgba(255,152,0,0.05)', 
          border: '1px solid rgba(255,152,0,0.1)',
          height: '100%'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                <FuelIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Combustible Consumido
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                  {formatFuel(metrics.totalCombustible || 0)}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="textSecondary">
                Eficiencia: {metrics.eficienciaCombustible || '0'} L/m²
              </Typography>
              <Chip 
                label={`${metrics.maquinasActivas || 0} máquinas`} 
                size="small" 
                color="warning" 
                variant="outlined"
              />
            </Box>
          </CardContent>
        </ResponsiveCard>

      {/* Daños Registrados */}
      <ResponsiveCard sx={{ 
          bgcolor: 'rgba(244,67,54,0.05)', 
          border: '1px solid rgba(244,67,54,0.1)',
          height: '100%'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Daños Registrados
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                  {formatNumber(metrics.totalDanos || 0)}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="textSecondary">
                {metrics.porcentajePlanillasConDanos || 0}% planillas afectadas
              </Typography>
              <Chip 
                label={`${metrics.danosMes || 0} este mes`} 
                size="small" 
                color="error" 
                variant="outlined"
              />
            </Box>
          </CardContent>
        </ResponsiveCard>

      {/* Eficiencia Operativa */}
      <ResponsiveCard sx={{ 
          bgcolor: 'rgba(102,126,234,0.05)', 
          border: '1px solid rgba(102,126,234,0.1)',
          height: '100%'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                <EfficiencyIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Eficiencia Operativa
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                  {metrics.eficienciaOperativa || 0}%
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="textSecondary">
                {metrics.operadoresActivos || 0} operadores
              </Typography>
              <Chip 
                label={`${metrics.sectoresActivos || 0} sectores`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </CardContent>
        </ResponsiveCard>
    </ResponsiveWrapper>
  );
};

// Componente de métricas detalladas
const DetailedMetrics = ({ metrics }) => {
  if (!metrics) return null;

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  return (
    <ResponsiveWrapper gridColumns={2} gap={3} mb={3}>
      {/* Métricas de Superficie */}
      <ResponsiveCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AreaIcon sx={{ mr: 1 }} />
              Métricas de Superficie
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2">Total Limpiado (Año)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatNumber(metrics.totalMetrosSuperficie || 0)} m²
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2">Promedio por Planilla</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatNumber(metrics.promedioMetrosPorPlanilla || 0)} m²
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2">Superficie este Mes</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatNumber(metrics.metrosSuperficieMes || 0)} m²
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Eficiencia por Sector</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatNumber(metrics.eficienciaPorSector || 0)} m²/hora
              </Typography>
            </Box>
          </CardContent>
        </ResponsiveCard>

      {/* Métricas de Combustible */}
      <ResponsiveCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FuelIcon sx={{ mr: 1 }} />
              Métricas de Combustible
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2">Total Consumido (Año)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatNumber(metrics.totalCombustible || 0)} L
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2">Promedio por Pabellón</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatNumber(metrics.promedioCombustiblePorPabellon || 0)} L
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2">Eficiencia de Consumo</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatNumber(metrics.eficienciaCombustible || 0)} L/m²
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Consumo este Mes</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatNumber(metrics.combustibleMes || 0)} L
              </Typography>
            </Box>
          </CardContent>
        </ResponsiveCard>
    </ResponsiveWrapper>
  );
};

// Componente de análisis de daños
const DamageAnalysis = ({ metrics }) => {
  if (!metrics || !metrics.danosPorTipo) return null;

  return (
    <ResponsiveWrapper gridColumns={2} gap={3} mb={3}>
      <ResponsiveCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ mr: 1 }} />
              Análisis de Daños
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total de Daños: {metrics.totalDanos || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((metrics.totalDanos || 0) / 100 * 100, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
                color={metrics.totalDanos > 50 ? 'error' : 'warning'}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Daños por Tipo
              </Typography>
              {metrics.danosPorTipo && metrics.danosPorTipo.slice(0, 5).map((tipo, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">{tipo.tipo || 'Sin especificar'}</Typography>
                  <Chip label={tipo.cantidad || 0} size="small" color="error" variant="outlined" />
                </Box>
              ))}
            </Box>
          </CardContent>
        </ResponsiveCard>

      <ResponsiveCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ mr: 1 }} />
              Zonas Críticas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Zonas con más daños
              </Typography>
              {metrics.danosPorZona && metrics.danosPorZona.slice(0, 5).map((zona, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">{zona.zona || 'Sin especificar'}</Typography>
                  <Chip label={zona.cantidad || 0} size="small" color="warning" variant="outlined" />
                </Box>
              ))}
            </Box>
          </CardContent>
        </ResponsiveCard>
    </ResponsiveWrapper>
  );
};

// Componente de gráficos mejorado
const DashboardCharts = ({ metrics }) => {
  if (!metrics || !metrics.charts) {
    return (
      <ResponsiveWrapper gridColumns={1} gap={3}>
        <ResponsiveCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gráficos
              </Typography>
              <LoadingSpinner message="Cargando gráficos..." />
            </CardContent>
          </ResponsiveCard>
        </ResponsiveWrapper>
      );
    }

  return (
    <ResponsiveWrapper gridColumns={2} gap={3}>
      <ResponsiveCard sx={{ gridColumn: { xs: '1 / -1', lg: '1 / 2' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1 }} />
              Tendencias Mensuales
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
        </ResponsiveCard>

      <ResponsiveCard sx={{ gridColumn: { xs: '1 / -1', lg: '2 / 3' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MetricsIcon sx={{ mr: 1 }} />
              Resumen Rápido
            </Typography>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Planillas Activas</Typography>
                <Chip label={metrics.planillasActivas || 0} size="small" color="success" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Máquinas Operativas</Typography>
                <Chip label={metrics.maquinasActivas || 0} size="small" color="primary" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Operadores Activos</Typography>
                <Chip label={metrics.operadoresActivos || 0} size="small" color="warning" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Sectores Activos</Typography>
                <Chip label={metrics.sectoresActivos || 0} size="small" color="info" />
              </Box>
            </Box>
          </CardContent>
        </ResponsiveCard>
    </ResponsiveWrapper>
  );
};

export default function Dashboard() {
  const { usuario } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Cargar datos del dashboard con métricas mejoradas
      // En desarrollo usar rutas de prueba, en producción usar rutas con autenticación
      const isDevelopment = process.env.NODE_ENV === 'development';
      const basePath = isDevelopment ? '/dashboard' : '/dashboard';
      
      const [dashboardResponse, petroleoResponse, danosResponse, chartsResponse] = await Promise.all([
        axios.get(`${basePath}/unified/test-metrics?year=${selectedYear}`),
        axios.get(`${basePath}/petroleo/test-metrics?year=${selectedYear}`),
        axios.get(`${basePath}/unified/test-stats?year=${selectedYear}`),
        axios.get(`${basePath}/unified/test-charts?year=${selectedYear}`)
      ]);

      // Transformar y combinar todas las métricas para el formato esperado por el frontend
      const transformMetrics = (dashboardData, petroleoData, danosData, chartsData) => {
        return {
          // Métricas principales del dashboard
          totalPlanillas: dashboardData.totalPlanillas || 0,
          planillasActivas: dashboardData.planillasActivas || 0,
          planillasCompletadas: dashboardData.planillasCompletadas || 0,
          planillasMes: dashboardData.planillasMes || 0,
          totalPabellones: dashboardData.totalPabellones || 0,
          pabellonesMes: dashboardData.pabellonesMes || 0,
          totalMaquinas: dashboardData.totalMaquinas || 0,
          totalOperadores: dashboardData.totalOperadores || 0,
          totalSectores: dashboardData.totalSectores || 0,
          
          // Métricas de superficie (transformar de mts2)
          totalMetrosSuperficie: dashboardData.totalMts2 || 0,
          promedioMetrosPorPlanilla: dashboardData.totalMts2 && dashboardData.totalPlanillas 
            ? Math.round(dashboardData.totalMts2 / dashboardData.totalPlanillas) 
            : 0,
          mts2Mes: dashboardData.mts2Mes || 0,
          metrosSuperficieMes: dashboardData.mts2Mes || 0,
          eficienciaPorSector: dashboardData.totalMts2 && dashboardData.totalPlanillas
            ? Math.round(dashboardData.totalMts2 / dashboardData.totalPlanillas / 8) // 8 horas promedio
            : 0,
          
          // Métricas de combustible (transformar de petróleo)
          totalCombustible: petroleoData.kpis?.totalLitrosConsumidos || 0,
          eficienciaCombustible: petroleoData.kpis?.promedioLitrosPorRegistro || 0,
          maquinasActivas: petroleoData.kpis?.totalMaquinas || 0,
          promedioCombustiblePorPabellon: petroleoData.kpis?.totalLitrosConsumidos && petroleoData.kpis?.totalPabellonesProcesados
            ? Math.round(petroleoData.kpis.totalLitrosConsumidos / petroleoData.kpis.totalPabellonesProcesados)
            : 0,
          
          // Métricas de daños
          totalDanos: dashboardData.danosMes || 0, // Usar danosMes como totalDanos temporalmente
          danosMes: dashboardData.danosMes || 0,
          porcentajePlanillasConDanos: dashboardData.totalPlanillas && dashboardData.danosMes
            ? Math.round((dashboardData.danosMes / dashboardData.totalPlanillas) * 100)
            : 0,
          
          // Eficiencia operativa
          eficienciaOperativa: dashboardData.eficienciaGlobal || 0,
          
          // Operadores y sectores activos
          operadoresActivos: dashboardData.totalOperadores || 0,
          sectoresActivos: dashboardData.totalSectores || 0,
          
          // Variaciones
          variacionPlanillas: dashboardData.variacionPlanillas || 0,
          variacionPabellones: dashboardData.variacionPabellones || 0,
          variacionMts2: dashboardData.variacionMts2 || 0,
          
          // Gráficos y tendencias
          charts: {
            tendenciasMensuales: chartsData?.tendenciasMensuales || [],
            rendimientoPorSector: chartsData?.rendimientoPorSector || [],
            estados: chartsData?.estados || []
          },
          
          // Metadatos
          metadata: dashboardData.metadata || {},
          
          // Datos originales para debugging
          _rawDashboard: dashboardData,
          _rawPetroleo: petroleoData,
          _rawDanos: danosData,
          _rawCharts: chartsData
        };
      };

      const combinedMetrics = transformMetrics(
        dashboardResponse.data, 
        petroleoResponse.data, 
        danosResponse.data,
        chartsResponse.data
      );

      console.log('📊 Datos transformados del dashboard:', combinedMetrics);
      setMetrics(combinedMetrics);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(false);
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
            Dashboard Operativo
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Bienvenido, {usuario?.nombre || 'Usuario'} • Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {/* Filtro por año */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="textSecondary">
              Año:
            </Typography>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
              <option value={2029}>2029</option>
              <option value={2030}>2030</option>
            </select>
          </Box>
          <Tooltip title="Actualizar datos">
            <IconButton 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Métricas Principales */}
      <MainMetrics metrics={metrics} />

      {/* Métricas Detalladas */}
      <DetailedMetrics metrics={metrics} />

      {/* Análisis de Daños */}
      <DamageAnalysis metrics={metrics} />

      {/* Gráficos */}
      <DashboardCharts metrics={metrics} />

      {/* Alertas */}
      {metrics?.alertas && metrics.alertas.length > 0 && (
        <Grid container spacing={3} mt={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alertas del Sistema
                </Typography>
                <List>
                  {metrics.alertas.map((alerta) => (
                    <ListItem key={alerta.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alerta.tipo === 'error' ? 'error.main' : 'warning.main' }}>
                          {alerta.tipo === 'error' ? <ErrorIcon /> : <WarningIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={alerta.titulo}
                        secondary={alerta.mensaje}
                      />
                      <Chip 
                        label={alerta.prioridad} 
                        color={alerta.prioridad === 'alta' ? 'error' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
} 