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
  CircularProgress
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  TrendingDown as TrendingDownIcon,
  Equalizer as EqualizerIcon,
  Engineering as EngineeringIcon,
  PrecisionManufacturing as MachineIcon,
  Apartment as SectorIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Componente de gráficos simplificado
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
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tendencias Mensuales
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Typography color="textSecondary">
                Gráfico de tendencias - {metrics.charts.tendenciasMensuales?.length || 0} meses de datos
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estado de Planillas
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Typography color="textSecondary">
                Activas: {metrics.planillasActivas} | Completadas: {metrics.planillasCompletadas}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rendimiento por Sector
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Typography color="textSecondary">
                {metrics.charts.rendimientoPorSector?.length || 0} sectores registrados
              </Typography>
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
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axios.get('/dashboard/metrics');
      setMetrics(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activa': return 'success';
      case 'pendiente': return 'warning';
      case 'completada': return 'info';
      case 'cancelada': return 'error';
      case 'mantenimiento': return 'warning';
      case 'inactiva': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'activa': return <CheckCircleIcon />;
      case 'pendiente': return <WarningIcon />;
      case 'completada': return <AssignmentIcon />;
      case 'cancelada': return <ErrorIcon />;
      case 'mantenimiento': return <BuildIcon />;
      case 'inactiva': return <ErrorIcon />;
      default: return <AssignmentIcon />;
    }
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Bienvenido, {usuario?.nombre || 'Usuario'} • Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
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

      {/* KPIs Principales */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'rgba(62,214,214,0.05)', border: '1px solid rgba(62,214,214,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>
                    {metrics?.totalPlanillas || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Planillas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                  <MachineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>
                    {metrics?.totalMaquinas || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Máquinas Activas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'rgba(255,152,0,0.05)', border: '1px solid rgba(255,152,0,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <EngineeringIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>
                    {metrics?.totalOperadores || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Operadores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                  <SectorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>
                    {metrics?.totalSectores || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sectores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Estado de Planillas */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de Planillas
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip 
                  icon={getStatusIcon('activa')} 
                  label={`Activas: ${metrics?.planillasActivas || 0}`} 
                  color={getStatusColor('activa')} 
                />
                <Chip 
                  icon={getStatusIcon('completada')} 
                  label={`Completadas: ${metrics?.planillasCompletadas || 0}`} 
                  color={getStatusColor('completada')} 
                />
                <Chip 
                  icon={getStatusIcon('pendiente')} 
                  label={`Pendientes: ${metrics?.planillasPendientes || 0}`} 
                  color={getStatusColor('pendiente')} 
                />
                <Chip 
                  icon={getStatusIcon('cancelada')} 
                  label={`Canceladas: ${metrics?.planillasCanceladas || 0}`} 
                  color={getStatusColor('cancelada')} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métricas del Mes
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Planillas</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {metrics?.planillasMes || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ 
                      color: getVariationColor(metrics?.variacionPlanillas),
                      fontSize: '0.75rem'
                    }}>
                      {getVariationIcon(metrics?.variacionPlanillas)}
                      {Math.abs(metrics?.variacionPlanillas || 0)}%
                    </Box>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Máquinas</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {metrics?.maquinasMes || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ 
                      color: getVariationColor(metrics?.variacionMaquinas),
                      fontSize: '0.75rem'
                    }}>
                      {getVariationIcon(metrics?.variacionMaquinas)}
                      {Math.abs(metrics?.variacionMaquinas || 0)}%
                    </Box>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Operadores</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {metrics?.operadoresMes || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ 
                      color: getVariationColor(metrics?.variacionOperadores),
                      fontSize: '0.75rem'
                    }}>
                      {getVariationIcon(metrics?.variacionOperadores)}
                      {Math.abs(metrics?.variacionOperadores || 0)}%
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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