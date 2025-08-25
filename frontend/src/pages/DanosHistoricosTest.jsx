import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Typography, Grid, Container, CircularProgress, Alert,
  Card, CardContent, Button, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import axios from '../api/axios';
import BarChartKPI from '../components/BarChartKPI';
import DonutChartKPI from '../components/DonutChartKPI';
import KPIVisual from '../components/KPIVisual';
import { transformMesesData, transformZonasData } from '../utils/dataTransformers';

export default function DanosHistoricosTest() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datos, setDatos] = useState(null);
  const [datosCompletos, setDatosCompletos] = useState(null);
  
  // Ref para el AbortController
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      console.log('🔍 Iniciando fetch de datos históricos con queries específicas...');
      
      // Obtener datos básicos y datos completos en paralelo
      const [responseBasica, responseCompleta] = await Promise.all([
        axios.get(`/danos-historicos/test-historicos?year=2024`, {
          signal: abortControllerRef.current.signal,
          timeout: 30000 // 30 segundos de timeout
        }),
        axios.get(`/danos-historicos/test-datos-completos?year=2024`, {
          signal: abortControllerRef.current.signal,
          timeout: 30000 // 30 segundos de timeout
        })
      ]);
      
      console.log('✅ Datos básicos recibidos:', responseBasica.data);
      console.log('✅ Datos completos recibidos:', responseCompleta.data);
      
      setDatos(responseBasica.data);
      setDatosCompletos(responseCompleta.data);
      setError(null);
    } catch (err) {
      // No mostrar error si fue cancelado intencionalmente
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        console.log('🔄 Request cancelado - nueva llamada en progreso');
        return;
      }
      
      console.error('❌ Error fetching datos:', err);
      setError('Error al cargar los datos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Cleanup function para cancelar request al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]); // Agregada dependencia fetchData

  // Memoizar las transformaciones de datos para evitar recálculos innecesarios
  const datosMeses = useMemo(() => {
    return datos ? transformMesesData(datos.porMes) : [];
  }, [datos]);
  
  const datosZonas = useMemo(() => {
    return datos ? transformZonasData(datos.porZona) : [];
  }, [datos]);

  // Datos para gráficas específicas
  const datosTipos = useMemo(() => {
    return datosCompletos?.distribucionTipo?.map(item => ({
      name: item.tipo,
      value: item.cantidad
    })) || [];
  }, [datosCompletos?.distribucionTipo]);

  const datosMaquinas = useMemo(() => {
    return datosCompletos?.topMaquinas?.map(item => ({
      name: item.maquina,
      value: item.total_danos
    })) || [];
  }, [datosCompletos?.topMaquinas]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Reintentar
        </Button>
      </Container>
    );
  }

  if (!datos || !datosCompletos) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay datos disponibles
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        📊 Daños Históricos 2024 - Datos Completos
      </Typography>
      
      <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
        Total de daños: {datos.total} | Promedio por servicio: {datos.promedioPorServicio} | 
        Sectores: {datos.porZona?.length || 0} | Operadores: {datos.porOperador?.length || 0}
      </Typography>

      <Box>
        {/* KPIs principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPIVisual
              icon="🔢"
              label="Total Daños 2024"
              value={datos.total || 0}
              subtitle="Registros históricos"
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPIVisual
              icon="🧮"
              label="Promedio por Servicio"
              value={datos.promedioPorServicio || 0}
              subtitle="Daños promedio"
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPIVisual
              icon="🗺️"
              label="Sectores Afectados"
              value={datos.porZona?.length || 0}
              subtitle="Zonas con daños"
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPIVisual
              icon="👷"
              label="Operadores Involucrados"
              value={datos.porOperador?.length || 0}
              subtitle="Personal afectado"
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Gráficos principales - Row 1 */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📅 Daños por Mes (Tendencia Mensual 2024)
                </Typography>
                <BarChartKPI
                  data={datosMeses}
                  title=""
                  height={400}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📁 Distribución por Tipo de Daño
                </Typography>
                <DonutChartKPI
                  data={datosTipos}
                  title=""
                  height={400}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficos secundarios - Row 2 */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🗺️ Distribución por Zona/Sector
                </Typography>
                <DonutChartKPI
                  data={datosZonas}
                  title=""
                  height={350}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚙️ Top 10 Máquinas con Más Daños
                </Typography>
                <BarChartKPI
                  data={datosMaquinas}
                  title=""
                  height={350}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Operadores con Tabla Completa */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏆 Top 10 Operadores con Más Daños - 2024
                </Typography>
                
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.light' }}>
                        <TableCell><strong>Posición</strong></TableCell>
                        <TableCell><strong>Operador</strong></TableCell>
                        <TableCell align="center"><strong>Total Daños</strong></TableCell>
                        <TableCell align="center"><strong>Órdenes</strong></TableCell>
                        <TableCell align="center"><strong>Promedio/Orden</strong></TableCell>
                        <TableCell align="center"><strong>% del Total</strong></TableCell>
                        <TableCell align="center"><strong>Período</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {datosCompletos.topOperadores?.map((operador, index) => (
                        <TableRow key={operador.nombre} sx={{ 
                          backgroundColor: index < 3 ? 'warning.light' : 'inherit' 
                        }}>
                          <TableCell>
                            {index < 3 ? '🏆' : ''} {operador.posicion}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <span style={{ marginRight: 8 }}>👷</span>
                              {operador.nombre}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={operador.total_danos} 
                              color={index < 3 ? "error" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">{operador.total_ordenes}</TableCell>
                          <TableCell align="center">{operador.promedio_por_orden}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${operador.porcentaje_total}%`} 
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontSize="0.75rem">
                              {new Date(operador.periodo.fecha_inicio).toLocaleDateString('es-ES')} - 
                              {new Date(operador.periodo.fecha_fin).toLocaleDateString('es-ES')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    💡 Los datos se basan en registros históricos del año 2024. Los operadores están ordenados por cantidad total de daños registrados.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tablas detalladas */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏆 Top 10 Zonas con Más Daños
                </Typography>
                <Box>
                  {datosZonas.slice(0, 10).map((item, index) => (
                    <Box key={item.zona} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2">
                        {index + 1}. {item.zona}
                      </Typography>
                      <Chip label={item.cantidad} size="small" color="primary" />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🧱 Top 10 Descripciones de Daños
                </Typography>
                <Box>
                  {datos.porDescripcion?.slice(0, 10).map((item, index) => (
                    <Box key={item.descripcion} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                        {index + 1}. {item.descripcion}
                      </Typography>
                      <Chip label={item.cantidad} size="small" color="secondary" />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Resumen de datos completos */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Resumen de Datos Completos - 2024
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  <Typography variant="body2">
                    <strong>📁 Distribución por Tipo:</strong>
                  </Typography>
                  {datosCompletos.distribucionTipo?.map((item, index) => (
                    <Typography key={item.tipo} variant="body2" sx={{ ml: 2 }}>
                      • {item.tipo}: {item.cantidad} daños ({item.porcentaje}%)
                    </Typography>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  <Typography variant="body2">
                    <strong>⚙️ Top 3 Máquinas:</strong>
                  </Typography>
                  {datosCompletos.topMaquinas?.slice(0, 3).map((item, index) => (
                    <Typography key={item.maquina} variant="body2" sx={{ ml: 2 }}>
                      • {item.maquina}: {item.total_danos} daños
                    </Typography>
                  ))}
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>👷 Top 3 Operadores:</strong>
                  </Typography>
                  {datosCompletos.topOperadores?.slice(0, 3).map((item, index) => (
                    <Typography key={item.nombre} variant="body2" sx={{ ml: 2 }}>
                      • {item.nombre}: {item.total_danos} daños ({item.porcentaje_total}%)
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 