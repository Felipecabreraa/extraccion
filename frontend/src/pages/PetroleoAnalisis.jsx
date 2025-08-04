import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, IconButton, Tooltip, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem,
  LinearProgress, Badge
} from '@mui/material';
import {
  LocalGasStation as GasIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Engineering as EngineeringIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Analytics as AnalyticsIcon,
  DirectionsCar as CarIcon,
  Route as RouteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import BarChartKPI from '../components/BarChartKPI';
import DonutChartKPI from '../components/DonutChartKPI';
import KPIVisual from '../components/KPIVisual';
import { formatLitersValue, formatKmValue, formatAreaValue, formatLitersPerM2Value, formatLitersPerKmValue } from '../utils/dataTransformers';

const PetroleoAnalisis = () => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    month: 'todos',
    origen: 'todos'
  });
  const [refreshing, setRefreshing] = useState(false);

  // Array de meses para el filtro
  const meses = [
    { value: 'todos', label: 'Todos los Meses' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const fetchPetroleoData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const params = new URLSearchParams({
        year: filtros.year,
        month: filtros.month,
        origen: filtros.origen
      });
      
      const response = await axios.get(`/dashboard/petroleo/test-metrics?${params}`);
      console.log('📊 Datos recibidos del backend:', response.data);
      setDatos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching petróleo data:', err);
      setError('Error al cargar los datos de análisis de petróleo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchPetroleoData();
  }, [fetchPetroleoData]);

  const handleRefresh = () => {
    fetchPetroleoData(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  // Función para calcular el nivel de eficiencia en consumo de petróleo
  const getEficienciaLevel = (litrosPorPabellon) => {
    const valor = parseFloat(litrosPorPabellon);
    // Clasificación basada en litros por pabellón (menos es mejor)
    if (valor <= 50) return { level: 'excelente', color: 'success', icon: <CheckCircleIcon />, label: 'Excelente' };
    if (valor <= 100) return { level: 'bueno', color: 'warning', icon: <TrendingUpIcon />, label: 'Bueno' };
    if (valor <= 150) return { level: 'regular', color: 'info', icon: <SpeedIcon />, label: 'Regular' };
    return { level: 'mejorar', color: 'error', icon: <WarningIcon />, label: 'Mejorar' };
  };

  // Función para calcular el porcentaje de eficiencia en consumo de petróleo
  const getEficienciaPorcentaje = (rendimiento) => {
    const valor = parseFloat(rendimiento);
    if (valor < 0.1) return 95;
    if (valor < 0.2) return 80;
    if (valor < 0.5) return 60;
    return 30;
  };

  // Función para calcular el nivel de eficiencia en rendimiento L/km
  const getEficienciaLevelKm = (rendimientoLitroKm) => {
    const valor = parseFloat(rendimientoLitroKm);
    // Clasificación basada en rendimiento L/km (menos es mejor)
    if (valor <= 0.1) return { level: 'excelente', color: 'success', icon: <CheckCircleIcon />, label: 'Excelente' };
    if (valor <= 0.2) return { level: 'bueno', color: 'warning', icon: <TrendingUpIcon />, label: 'Bueno' };
    if (valor <= 0.5) return { level: 'regular', color: 'info', icon: <SpeedIcon />, label: 'Regular' };
    return { level: 'mejorar', color: 'error', icon: <WarningIcon />, label: 'Mejorar' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Cargando análisis de rendimiento de petróleo...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!datos) {
    return (
      <Alert severity="info">
        No hay datos de análisis de petróleo disponibles
      </Alert>
    );
  }

  return (
    <Box p={3} className="petroleo-analisis-container" sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Principal */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CarIcon sx={{ fontSize: 40 }} />
                Análisis Rendimiento Petróleo
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Análisis completo de consumo y eficiencia de combustible por máquina • Última actualización: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
            <Tooltip title="Actualizar datos">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Filtros Mejorados */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
            <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtros de Análisis
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Año de Análisis</InputLabel>
                <Select
                  value={filtros.year}
                  onChange={(e) => handleFiltroChange('year', e.target.value)}
                  label="Año de Análisis"
                >
                  {[2024, 2025, 2026].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Mes de Análisis</InputLabel>
                <Select
                  value={filtros.month}
                  onChange={(e) => handleFiltroChange('month', e.target.value)}
                  label="Mes de Análisis"
                >
                  {meses.map(mes => (
                    <MenuItem key={mes.value} value={mes.value}>{mes.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Origen de Datos</InputLabel>
                <Select
                  value={filtros.origen}
                  onChange={(e) => handleFiltroChange('origen', e.target.value)}
                  label="Origen de Datos"
                >
                  <MenuItem value="todos">Todos los Datos</MenuItem>
                  <MenuItem value="historico_2025">Histórico 2025</MenuItem>
                  <MenuItem value="sistema_actual">Sistema Actual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  icon={<EngineeringIcon />}
                  label={`${datos?.metadata?.totalRegistros || 0} máquinas analizadas`} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<GasIcon />}
                  label={`${datos?.metadata?.origen || 'N/A'}`} 
                  color="secondary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<TimelineIcon />}
                  label={`Año ${datos?.metadata?.year || 'N/A'}`} 
                  color="info" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<CalendarMonthIcon />}
                  label={`Mes: ${filtros.month === 'todos' ? 'Todos' : meses.find(m => m.value === filtros.month)?.label || 'N/A'}`} 
                  color="warning" 
                  variant="outlined" 
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPIs Principales Mejorados */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<GasIcon />}
            label="Total Litros Consumidos"
            value={`${(datos?.kpis?.totalLitrosConsumidos || 0).toLocaleString()} L`}
            subtitle="Consumo total de combustible"
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<RouteIcon />}
            label="Total Km Recorridos"
            value={`${(datos?.kpis?.totalKmRecorridos || 0).toLocaleString()} km`}
            subtitle="Distancia total recorrida"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<EngineeringIcon />}
            label="Máquinas Activas"
            value={datos?.kpis?.totalMaquinas || 0}
            subtitle="Máquinas con consumo registrado"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<TrendingUpIcon />}
            label="Rendimiento Global"
            value={`${(datos?.kpis?.promedioLitroKm || 0).toFixed(2)} L/km`}
            subtitle="Promedio de consumo por km"
            color="warning"
          />
          {/* Debug: Mostrar el valor exacto */}
          {console.log('🔍 Debug - Valor promedioLitroKm:', datos?.kpis?.promedioLitroKm, 'Tipo:', typeof datos?.kpis?.promedioLitroKm)}
        </Grid>
      </Grid>

      {/* Tabs de navegación mejoradas */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="petroleo tabs"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '0.9rem',
                fontWeight: 600
              }
            }}
          >
                         <Tab icon={<BarChartIcon />} label="Resumen Petróleo" />
             <Tab icon={<PieChartIcon />} label="Análisis por Máquinas" />
             <Tab icon={<TableChartIcon />} label="Km Recorridos" />
             <Tab icon={<TimelineIcon />} label="Tendencias Mensuales" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Contenido de las tabs */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Gráfico de consumo por máquina */}
          <Grid xs={12} lg={8}>
            <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BarChartIcon sx={{ fontSize: 28, color: 'white', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Consumo por Máquina (Top 10)
                  </Typography>
                </Box>
                {datos?.litrosPorMaquina && datos.litrosPorMaquina.length > 0 ? (
                  <BarChartKPI 
                    data={datos?.litrosPorMaquina?.slice(0, 10).map(maquina => ({
                      name: maquina.nroMaquina,
                      value: maquina.totalLitros
                    })) || []}
                    title="Consumo de Petróleo"
                    height={300}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      No hay datos disponibles - litrosPorMaquina: {datos?.litrosPorMaquina?.length || 0}
                      {datos?.litrosPorMaquina && datos.litrosPorMaquina.length > 0 && (
                        <div>Primeros 3: {datos.litrosPorMaquina.slice(0, 3).map(m => `${m.nroMaquina}:${m.totalLitros}L`).join(', ')}</div>
                      )}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} lg={4}>
            <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PieChartIcon sx={{ fontSize: 28, color: 'white', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Consumo por Sector
                  </Typography>
                </Box>
                {datos?.distribucionConsumoPorSector?.graficoDonut?.datos && datos.distribucionConsumoPorSector.graficoDonut.datos.length > 0 ? (
                  <DonutChartKPI 
                    data={datos?.distribucionConsumoPorSector?.graficoDonut?.datos || []}
                    title=""
                    dataKey="valor"
                    nameKey="sector"
                    height={300}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      No hay datos disponibles - graficoDonut: {datos?.distribucionConsumoPorSector?.graficoDonut?.datos?.length || 0}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Tabla detallada de máquinas */}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChartIcon color="primary" />
                  Rendimiento Detallado por Máquina
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Análisis completo de eficiencia y consumo por máquina
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 600, boxShadow: 2 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Máquina</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Órdenes</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total Litros</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Promedio L/Registro</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total m²</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total Pabellones</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>L/Pabellón</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>L/m²</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Eficiencia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {datos?.litrosPorMaquina?.map((maquina) => {
                        const eficiencia = getEficienciaLevel(maquina.litrosPorPabellon);
                        return (
                          <TableRow key={maquina.nroMaquina} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                            <TableCell component="th" scope="row">
                              <Box display="flex" alignItems="center">
                                <EngineeringIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  {maquina.nroMaquina}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Badge badgeContent={maquina.totalOrdenesServicio} color="primary">
                                <Typography variant="body2">{maquina.totalOrdenesServicio}</Typography>
                              </Badge>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600} color="error.main">
                                {maquina.totalLitros?.toLocaleString() || '0'} L
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {parseFloat(maquina.promedioLitrosPorRegistro || 0).toFixed(1)} L
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="info.main">
                                {formatAreaValue(maquina.totalMts2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {maquina.totalPabellones?.toLocaleString() || '0'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600} color={eficiencia.color}>
                                {maquina.litrosPorPabellon} L/pab
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {maquina.litrosPorMts2} L/m²
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={eficiencia.icon}
                                label={eficiencia.label}
                                color={eficiencia.color}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

             {activeTab === 2 && (
         <Grid container spacing={3}>
           {/* Análisis de km recorridos por máquina */}
           <Grid item xs={12}>
             <Card sx={{ boxShadow: 3 }}>
               <CardContent>
                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                   <RouteIcon color="primary" />
                   Análisis de Kilómetros Recorridos por Máquina
                 </Typography>
                 <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                   Cálculo basado en lecturas de odómetro (inicio y fin) por máquina
                 </Typography>
                 <TableContainer component={Paper} sx={{ maxHeight: 600, boxShadow: 2 }}>
                   <Table stickyHeader>
                     <TableHead>
                       <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                         <TableCell sx={{ fontWeight: 600 }}>Máquina</TableCell>
                         <TableCell align="right" sx={{ fontWeight: 600 }}>Órdenes</TableCell>
                         <TableCell align="right" sx={{ fontWeight: 600 }}>Total Km</TableCell>
                         <TableCell align="right" sx={{ fontWeight: 600 }}>Promedio Km/Orden</TableCell>
                         <TableCell align="right" sx={{ fontWeight: 600 }}>Total Litros</TableCell>
                         <TableCell align="right" sx={{ fontWeight: 600 }}>Rendimiento L/km</TableCell>
                         <TableCell align="center" sx={{ fontWeight: 600 }}>Eficiencia</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {datos?.kmPorMaquina?.map((maquina) => {
                         const eficiencia = getEficienciaLevelKm(maquina.rendimientoLitroKm);
                         return (
                           <TableRow key={maquina.nroMaquina} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                             <TableCell component="th" scope="row">
                               <Box display="flex" alignItems="center">
                                 <EngineeringIcon sx={{ mr: 1, color: 'primary.main' }} />
                                 <Typography variant="body2" fontWeight={600}>
                                   {maquina.nroMaquina}
                                 </Typography>
                               </Box>
                             </TableCell>
                             <TableCell align="right">
                               <Badge badgeContent={maquina.totalOrdenesServicio} color="primary">
                                 <Typography variant="body2">{maquina.totalOrdenesServicio}</Typography>
                               </Badge>
                             </TableCell>
                             <TableCell align="right">
                               <Typography variant="body2" fontWeight={600} color="info.main">
                                 {maquina.totalKmRecorridos?.toLocaleString() || '0'} km
                               </Typography>
                             </TableCell>
                             <TableCell align="right">
                               <Typography variant="body2">
                                 {parseFloat(maquina.promedioKmRecorridos || 0).toFixed(1)} km
                               </Typography>
                             </TableCell>
                             <TableCell align="right">
                               <Typography variant="body2" fontWeight={600} color="error.main">
                                 {maquina.totalLitros?.toLocaleString() || '0'} L
                               </Typography>
                             </TableCell>
                             <TableCell align="right">
                               <Typography variant="body2" fontWeight={600} color={eficiencia.color}>
                                 {parseFloat(maquina.rendimientoLitroKm).toFixed(2)} L/km
                               </Typography>
                             </TableCell>
                             <TableCell align="center">
                               <Chip
                                 icon={eficiencia.icon}
                                 label={eficiencia.label}
                                 color={eficiencia.color}
                                 size="small"
                                 sx={{ fontWeight: 600 }}
                               />
                             </TableCell>
                           </TableRow>
                         );
                       })}
                     </TableBody>
                   </Table>
                 </TableContainer>
               </CardContent>
             </Card>
           </Grid>

           {/* Gráfico de km recorridos */}
           <Grid item xs={12} lg={6}>
             <Card sx={{ height: '100%', boxShadow: 3 }}>
               <CardContent>
                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                   <BarChartIcon color="primary" />
                   Top 10 Máquinas por Km Recorridos
                 </Typography>
                 <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                   Máquinas con mayor distancia recorrida
                 </Typography>
                 <Box height={400}>
                                     <BarChartKPI
                    data={datos?.kmPorMaquina?.slice(0, 10).map(item => ({
                      name: item.nroMaquina,
                      value: item.totalKmRecorridos,
                      color: '#4ecdc4'
                    })) || []}
                    title="Kilómetros Recorridos por Máquina"
                    height={350}
                  />
                 </Box>
               </CardContent>
             </Card>
           </Grid>

           {/* Resumen de eficiencia por km */}
           <Grid item xs={12} lg={6}>
             <Card sx={{ height: '100%', boxShadow: 3 }}>
               <CardContent>
                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                   <TrendingUpIcon color="primary" />
                   Eficiencia por Km Recorrido
                 </Typography>
                 <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                   Mejor rendimiento L/km basado en odómetros
                 </Typography>
                 <Box>
                   {datos?.kmPorMaquina?.slice(0, 5).map((maquina, index) => {
                     const eficiencia = getEficienciaLevelKm(maquina.rendimientoLitroKm);
                     return (
                       <Box key={maquina.nroMaquina} sx={{ mb: 2 }}>
                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                           <Typography variant="body2" fontWeight={600}>
                             {maquina.nroMaquina}
                           </Typography>
                           <Chip
                             icon={eficiencia.icon}
                             label={eficiencia.label}
                             color={eficiencia.color}
                             size="small"
                           />
                         </Box>
                         <Box display="flex" justifyContent="space-between" alignItems="center">
                           <Typography variant="caption" color="textSecondary">
                             {maquina.totalKmRecorridos?.toLocaleString() || '0'} km • {maquina.totalLitros?.toLocaleString() || '0'} L
                           </Typography>
                           <Typography variant="caption" fontWeight={600} color={eficiencia.color}>
                             {parseFloat(maquina.rendimientoLitroKm).toFixed(2)} L/km
                           </Typography>
                         </Box>
                         <LinearProgress 
                           variant="determinate" 
                           value={getEficienciaPorcentaje(maquina.rendimientoLitroKm)}
                           color={eficiencia.color}
                           sx={{ height: 3, borderRadius: 2, mt: 0.5 }}
                         />
                       </Box>
                     );
                   })}
                 </Box>
               </CardContent>
             </Card>
           </Grid>
         </Grid>
       )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Consumo mensual */}
          <Grid xs={12} lg={8}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon color="primary" />
                  Evolución Mensual del Consumo
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Tendencias de consumo de combustible a lo largo del tiempo
                </Typography>
                <Box height={400}>
                  <BarChartKPI
                    data={(datos?.consumoMensual || [])
                      .sort((a, b) => {
                        // Ordenar por mes de Enero a Diciembre
                        const mesA = parseInt(a.mes?.split('-')[1]) || 1;
                        const mesB = parseInt(b.mes?.split('-')[1]) || 1;
                        return mesA - mesB;
                      })
                      .map(item => ({
                        name: item.mesNombre || item.mes,
                        value: item.litrosConsumidos,
                        color: '#4ecdc4'
                      }))}
                    title="Consumo de Petróleo por Mes (Litros)"
                    height={350}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen de tendencias */}
          <Grid xs={12} lg={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  Resumen de Tendencias
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Análisis de rendimiento mensual
                </Typography>
                <Box>
                  {(datos?.consumoMensual || [])
                    .sort((a, b) => {
                      // Ordenar por mes de Enero a Diciembre
                      const mesA = parseInt(a.mes?.split('-')[1]) || 1;
                      const mesB = parseInt(b.mes?.split('-')[1]) || 1;
                      return mesA - mesB;
                    })
                    .slice(0, 6).map((mes, index) => (
                    <Box key={mes.mes} sx={{ mb: 2, p: 2, bgcolor: 'rgba(76, 205, 196, 0.1)', borderRadius: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {mes.mesNombre || mes.mes}
                        </Typography>
                        <Chip
                          label={mes.eficiencia}
                          color={mes.eficiencia === 'excelente' ? 'success' : 
                                 mes.eficiencia === 'bueno' ? 'warning' : 
                                 mes.eficiencia === 'regular' ? 'info' : 'error'}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">
                          {mes.litrosFormateado} L • {mes.kmFormateado} km
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color="primary">
                          {mes.litrosPorPabellon} L/pab
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {mes.maquinasActivas} máquinas • {mes.ordenesServicio} órdenes
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Métricas adicionales */}
          <Grid xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  Métricas Adicionales
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Indicadores complementarios de rendimiento
                </Typography>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={2} sx={{ bgcolor: 'rgba(33,150,243,0.1)', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Promedio por Registro
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Consumo promedio por registro de servicio
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      {datos?.kpis?.promedioLitrosPorRegistro || '0'} L
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={2} sx={{ bgcolor: 'rgba(76,175,80,0.1)', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Rendimiento por Pabellón
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Consumo promedio por pabellón procesado
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="success.main" fontWeight={600}>
                      {datos?.kpis?.litrosPorPabellonGlobal || '0'} L/pab
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={2} sx={{ bgcolor: 'rgba(255,152,0,0.1)', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Rendimiento por m²
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Consumo promedio por metro cuadrado
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="warning.main" fontWeight={600}>
                      {datos?.kpis?.litrosPorMts2Global || '0'} L/m²
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ bgcolor: 'rgba(156,39,176,0.1)', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Total Pabellones Procesados
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Pabellones procesados con consumo registrado
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="secondary.main" fontWeight={600}>
                      {datos.kpis.totalPabellonesProcesados?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estadísticas de tendencias */}
          <Grid xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Estadísticas de Tendencias
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Análisis detallado de rendimiento mensual
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400, boxShadow: 2 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Mes</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Litros</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Km</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Pabellones</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>m²</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>L/Pabellón</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>L/m²</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>L/km</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Eficiencia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {datos?.consumoMensual?.map((mes) => (
                        <TableRow key={mes.mes} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight={600}>
                              {mes.mesNombre || mes.mes}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              {formatLitersValue(mes.litrosConsumidos)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="info.main">
                              {formatKmValue(mes.kmRecorridos)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {mes.pabellonesFormateado}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="info.main">
                              {formatAreaValue(mes.mts2Procesados)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color={mes.eficiencia === 'excelente' ? 'success.main' : 
                                                                           mes.eficiencia === 'bueno' ? 'warning.main' : 
                                                                           mes.eficiencia === 'regular' ? 'info.main' : 'error.main'}>
                              {parseFloat(mes.litrosPorPabellon || 0).toFixed(2)} L/pab
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main" fontWeight={500}>
                              {mes.litrosPorMts2Formateado ? `${mes.litrosPorMts2Formateado} L/m²` : formatLitersPerM2Value(mes.litrosPorMts2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="info.main" fontWeight={500}>
                              {mes.litrosPorKmFormateado ? `${mes.litrosPorKmFormateado} L/km` : formatLitersPerKmValue(mes.litrosPorKm)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={mes.eficiencia}
                              color={mes.eficiencia === 'excelente' ? 'success' : 
                                     mes.eficiencia === 'bueno' ? 'warning' : 
                                     mes.eficiencia === 'regular' ? 'info' : 'error'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default PetroleoAnalisis; 