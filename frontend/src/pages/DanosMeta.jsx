import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper,
  CircularProgress, Alert, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  MenuItem, Select, FormControl, InputLabel,
  LinearProgress, Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Adjust as TargetIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import DanosAcumuladosChart from '../components/DanosAcumuladosChart';

export default function DanosMeta() {
  const [metaData, setMetaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPorcentaje, setSelectedPorcentaje] = useState(5.0);

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);
  const porcentajes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];

  const fetchMetaData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axios.get('/danos/meta/stats/test', {
        params: {
          year: selectedYear,
          porcentaje: selectedPorcentaje
        }
      });
      
      setMetaData(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching meta data:', err);
      setError('Error al cargar los datos de metas de daños');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedYear, selectedPorcentaje]);

  useEffect(() => {
    fetchMetaData();
  }, [fetchMetaData]);

  const handleRefresh = () => {
    fetchMetaData(false);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handlePorcentajeChange = (event) => {
    setSelectedPorcentaje(event.target.value);
  };

  const getCumplimientoColor = (cumplimiento) => {
    if (cumplimiento >= 80) return 'success';
    if (cumplimiento >= 60) return 'warning';
    return 'error';
  };

  const getDiferenciaColor = (diferencia) => {
    if (diferencia <= 0) return 'success';
    return 'error';
  };

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
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
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>
            🎯 Metas y Proyecciones de Daños
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Análisis de cumplimiento de metas anuales • Última actualización: {lastUpdate.toLocaleTimeString()}
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

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuración de Análisis
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Año de Análisis</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  label="Año de Análisis"
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>% Disminución Esperada</InputLabel>
                <Select
                  value={selectedPorcentaje}
                  onChange={handlePorcentajeChange}
                  label="% Disminución Esperada"
                >
                  {porcentajes.map((porcentaje) => (
                    <MenuItem key={porcentaje} value={porcentaje}>
                      {porcentaje}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPIs */}
      {metaData && (
        <Grid container spacing={3} mb={3}>
          {/* Meta Anual */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.1)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TargetIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h6" color="success.main">
                    Meta Anual
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                  {metaData.configuracion.metaAnual.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Objetivo {metaData.configuracion.anioActual}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Real hasta ahora */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(33, 150, 243, 0.05)', border: '1px solid rgba(33, 150, 243, 0.1)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AssessmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" color="primary.main">
                    Real Actual
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                  {metaData.datosAnioActual.totalRealHastaAhora.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {metaData.datosAnioActual.mesesConDatos} meses con datos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Cumplimiento */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: `rgba(${getCumplimientoColor(metaData.datosAnioActual.cumplimientoMeta) === 'success' ? '76, 175, 80' : 
                               getCumplimientoColor(metaData.datosAnioActual.cumplimientoMeta) === 'warning' ? '255, 152, 0' : '244, 67, 54'}, 0.05)`,
              border: `1px solid rgba(${getCumplimientoColor(metaData.datosAnioActual.cumplimientoMeta) === 'success' ? '76, 175, 80' : 
                                        getCumplimientoColor(metaData.datosAnioActual.cumplimientoMeta) === 'warning' ? '255, 152, 0' : '244, 67, 54'}, 0.1)`
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {metaData.datosAnioActual.cumplimientoMeta >= 80 ? <CheckCircleIcon /> : 
                   metaData.datosAnioActual.cumplimientoMeta >= 60 ? <WarningIcon /> : <TrendingDownIcon />}
                  <Typography variant="h6" sx={{ ml: 1, color: `${getCumplimientoColor(metaData.datosAnioActual.cumplimientoMeta)}.main` }}>
                    Cumplimiento
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                  {metaData.datosAnioActual.cumplimientoMeta}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(metaData.datosAnioActual.cumplimientoMeta, 100)}
                  color={getCumplimientoColor(metaData.datosAnioActual.cumplimientoMeta)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Año anterior */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(156, 39, 176, 0.05)', border: '1px solid rgba(156, 39, 176, 0.1)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TimelineIcon sx={{ color: 'secondary.main', mr: 1 }} />
                  <Typography variant="h6" color="secondary.main">
                    {metaData.configuracion.anioAnterior}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                  {metaData.datosAnioAnterior.totalDanos.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Base para cálculo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

             {/* Gráfico de Daños Acumulados */}
       {metaData && metaData.datosMensuales && (
         <Box mb={3}>
           <DanosAcumuladosChart data={metaData} />
         </Box>
       )}

       {/* Tabla Comparativa */}
       {metaData && metaData.datosMensuales && (
         <Card>
           <CardContent>
             <Typography variant="h6" gutterBottom>
               📊 Tabla Comparativa Mensual
             </Typography>
            
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Mes</strong></TableCell>
                    <TableCell align="right"><strong>Daños Reales</strong></TableCell>
                    <TableCell align="right"><strong>Meta Mensual</strong></TableCell>
                    <TableCell align="right"><strong>Diferencia</strong></TableCell>
                    <TableCell align="right"><strong>Acumulado Real</strong></TableCell>
                    <TableCell align="right"><strong>Acumulado Meta</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metaData.datosMensuales.map((item) => (
                    <TableRow key={item.mes} sx={{ 
                      bgcolor: item.tieneDatos ? 'inherit' : 'rgba(0,0,0,0.02)',
                      opacity: item.tieneDatos ? 1 : 0.6
                    }}>
                      <TableCell>
                        {item.nombreMes}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.danosReales.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {item.metaMensual.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          {item.diferencia > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: `${getDiferenciaColor(item.diferencia)}.main`
                            }}
                          >
                            {item.diferencia > 0 ? '+' : ''}{item.diferencia.toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.acumuladoReal.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {item.acumuladoMeta.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {item.tieneDatos ? (
                          <Chip 
                            label={item.diferencia <= 0 ? "✅ Cumple" : "❌ Excede"}
                            color={getDiferenciaColor(item.diferencia)}
                            size="small"
                          />
                        ) : (
                          <Chip label="⏳ Pendiente" color="default" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 