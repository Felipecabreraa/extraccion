import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import DonutChartKPI from './DonutChartKPI';
import BarChartKPI from './BarChartKPI';
import axios from '../api/axios';

const GraficosPorZona = ({ selectedYear, selectedMonth, selectedOrigen }) => {
  const [datosPorZona, setDatosPorZona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zonasExpandidas, setZonasExpandidas] = useState({});

  // Cargar datos por zona con filtros
  const fetchDatosPorZona = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta basados en los filtros
      let params = new URLSearchParams();
      
      if (selectedYear) {
        params.append('year', selectedYear);
      }
      
      if (selectedMonth) {
        params.append('month', selectedMonth);
      }
      
      if (selectedOrigen && selectedOrigen !== 'todos') {
        params.append('origen', selectedOrigen);
      }
      
      const queryString = params.toString();
      const url = `/danos/stats/por-zona/test${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching datos por zona con filtros:', { selectedYear, selectedMonth, selectedOrigen });
      console.log('🔍 URL:', url);
      
      const response = await axios.get(url);
      setDatosPorZona(response.data);
      console.log('Datos por zona cargados:', response.data);
    } catch (error) {
      console.error('Error cargando datos por zona:', error);
      setError('Error cargando datos por zona');
    } finally {
      setLoading(false);
    }
  };

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    fetchDatosPorZona();
  }, [selectedYear, selectedMonth, selectedOrigen]);

  const toggleZonaExpansion = (zonaId) => {
    setZonasExpandidas(prev => ({
      ...prev,
      [zonaId]: !prev[zonaId]
    }));
  };

  const expandirTodasLasZonas = () => {
    if (datosPorZona?.zonas) {
      const todasExpandidas = {};
      datosPorZona.zonas.forEach(zona => {
        todasExpandidas[zona.zona_id] = true;
      });
      setZonasExpandidas(todasExpandidas);
    }
  };

  const contraerTodasLasZonas = () => {
    setZonasExpandidas({});
  };

  const transformarDatosDonut = (zonas) => {
    if (!zonas || zonas.length === 0) return [];
    
    return zonas.map(zona => ({
      label: zona.zona_nombre,
      value: zona.total_danos,
      color: zona.zona_tipo === 'HEMBRA' ? '#FF6B6B' : '#4ECDC4'
    }));
  };

  const transformarDatosBarras = (zonas) => {
    if (!zonas || zonas.length === 0) return [];
    
    return zonas.map(zona => ({
      label: zona.zona_nombre,
      value: zona.total_danos,
      color: zona.zona_tipo === 'HEMBRA' ? '#FF6B6B' : '#4ECDC4'
    }));
  };

  const transformarDatosPorTipo = (danosPorTipo) => {
    if (!danosPorTipo || danosPorTipo.length === 0) return [];
    
    return danosPorTipo.map(item => ({
      label: item.tipo,
      value: item.total_danos,
      color: item.tipo === 'INFRAESTRUCTURA' ? '#FF6B6B' : '#4ECDC4'
    }));
  };

  // Generar texto descriptivo de los filtros aplicados
  const getFiltrosDescripcion = () => {
    const filtros = [];
    
    if (selectedYear) {
      filtros.push(`Año ${selectedYear}`);
    }
    
    if (selectedMonth) {
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      filtros.push(meses[selectedMonth - 1]);
    }
    
    if (selectedOrigen && selectedOrigen !== 'todos') {
      const origenes = {
        'historico_2025': 'Histórico 2025',
        'sistema_actual': 'Sistema Actual'
      };
      filtros.push(origenes[selectedOrigen] || selectedOrigen);
    }
    
    return filtros.length > 0 ? `(${filtros.join(' - ')})` : '';
  };

  if (loading && !datosPorZona) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          Análisis de Daños por Zona {getFiltrosDescripcion()}
        </Typography>
        
        {/* Resumen general */}
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip 
            icon={<BarChartIcon />} 
            label={`${datosPorZona?.resumen?.total_danos || 0} Total Daños`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            icon={<PieChartIcon />} 
            label={`${datosPorZona?.resumen?.sectores_con_danos || 0} Sectores`}
            color="secondary"
            variant="outlined"
          />
          <Chip 
            icon={<TrendingUpIcon />} 
            label={`${datosPorZona?.resumen?.total_ordenes_con_danos || 0} Órdenes`}
            color="info"
            variant="outlined"
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {datosPorZona && (
        <>
          {/* Gráficos principales */}
          <Grid container spacing={3} mb={3}>
            {/* Gráfico de dona - Distribución por zona */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribución de Daños por Zona {getFiltrosDescripcion()}
                  </Typography>
                  {datosPorZona.zonas && datosPorZona.zonas.length > 0 ? (
                    <DonutChartKPI
                      data={transformarDatosDonut(datosPorZona.zonas)}
                      title="Daños por Zona"
                      height={300}
                    />
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="textSecondary">
                        No hay datos disponibles para mostrar
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Gráfico de barras - Comparación por zona */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comparación de Daños por Zona {getFiltrosDescripcion()}
                  </Typography>
                  {datosPorZona.zonas && datosPorZona.zonas.length > 0 ? (
                    <BarChartKPI
                      data={transformarDatosBarras(datosPorZona.zonas)}
                      title="Total Daños por Zona"
                      height={300}
                    />
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="textSecondary">
                        No hay datos disponibles para mostrar
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráfico de tipos de daños */}
          {datosPorZona.danosPorTipo && datosPorZona.danosPorTipo.length > 0 && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tipos de Daños por Zona {getFiltrosDescripcion()}
                    </Typography>
                    <BarChartKPI
                      data={transformarDatosPorTipo(datosPorZona.danosPorTipo)}
                      title="Daños por Tipo"
                      height={250}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Resumen de zonas con botones de control */}
          {datosPorZona.zonas && datosPorZona.zonas.length > 0 && (
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Resumen por Zona {getFiltrosDescripcion()}
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={expandirTodasLasZonas}
                    startIcon={<ExpandMoreIcon />}
                  >
                    Expandir Todo
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={contraerTodasLasZonas}
                    startIcon={<ExpandLessIcon />}
                  >
                    Contraer Todo
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {datosPorZona.zonas.map((zona) => (
                  <Grid xs={12} md={6} lg={4} key={zona.zona_id}>
                    <Card>
                      <CardContent>
                        {/* Header de la zona */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h6">
                              {zona.zona_nombre}
                            </Typography>
                            <Chip 
                              label={zona.zona_tipo} 
                              size="small" 
                              color={zona.zona_tipo === 'HEMBRA' ? 'error' : 'success'}
                            />
                          </Box>
                          <Tooltip title={zonasExpandidas[zona.zona_id] ? "Ocultar detalles" : "Ver detalles"}>
                            <IconButton
                              size="small"
                              onClick={() => toggleZonaExpansion(zona.zona_id)}
                              color="primary"
                            >
                              {zonasExpandidas[zona.zona_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        {/* Estadísticas principales */}
                        <Box mb={2}>
                          <Typography variant="h4" color="primary" gutterBottom>
                            {zona.total_danos}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total de daños
                          </Typography>
                        </Box>

                        {/* Información adicional */}
                        <Box display="flex" gap={2} mb={2}>
                          <Chip 
                            size="small"
                            label={`${zona.sectores_con_danos.length} sectores`}
                            variant="outlined"
                            color="secondary"
                          />
                          <Chip 
                            size="small"
                            label={`${zona.total_ordenes} órdenes`}
                            variant="outlined"
                            color="info"
                          />
                        </Box>

                        {/* Detalles expandibles */}
                        <Collapse in={zonasExpandidas[zona.zona_id]}>
                          <Divider sx={{ my: 2 }} />
                          
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <VisibilityIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2">
                              Sectores con daños:
                            </Typography>
                          </Box>
                          
                          <Box maxHeight="200px" overflow="auto">
                            {zona.sectores_con_danos.map((sector) => (
                              <Box 
                                key={sector.sector_id} 
                                display="flex" 
                                justifyContent="space-between" 
                                alignItems="center"
                                mb={1}
                                p={1}
                                sx={{ 
                                  backgroundColor: 'action.hover',
                                  borderRadius: 1,
                                  '&:hover': {
                                    backgroundColor: 'action.selected'
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {sector.sector_nombre}
                                </Typography>
                                <Chip 
                                  label={sector.total_danos}
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                />
                              </Box>
                            ))}
                          </Box>

                          <Box mt={2} textAlign="center">
                            <Typography variant="caption" color="textSecondary">
                              {zona.sectores_con_danos.length} sectores afectados en total
                            </Typography>
                          </Box>
                        </Collapse>

                        {/* Botón para expandir/contraer */}
                        <Box mt={2} textAlign="center">
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => toggleZonaExpansion(zona.zona_id)}
                            startIcon={zonasExpandidas[zona.zona_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          >
                            {zonasExpandidas[zona.zona_id] ? 'Ocultar detalles' : 'Ver detalles'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default GraficosPorZona; 