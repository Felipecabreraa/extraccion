import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tabs, Tab, Fade, Zoom, Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import BarChartKPI from './BarChartKPI';
import DonutChartKPI from './DonutChartKPI';

const AnalisisPredictivo = ({ datos, loading }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <PsychologyIcon sx={{ mr: 1 }} />
            Análisis Predictivo
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!datos || !datos.predicciones) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <PsychologyIcon sx={{ mr: 1 }} />
            Análisis Predictivo
          </Typography>
          <Typography color="textSecondary">
            No hay datos predictivos disponibles
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Preparar datos para gráficos
  const prediccionesData = datos.predicciones.map(item => ({
    mes: item.nombreMes,
    prediccion: item.prediccion,
    confianza: Math.round(item.confianza * 100),
    minimo: item.rango.minimo,
    maximo: item.rango.maximo
  }));

  const estacionalidadData = datos.estacionalidad.map(item => ({
    mes: new Date(2024, item.mes - 1).toLocaleDateString('es-ES', { month: 'short' }),
    cantidad: item.cantidadDanos,
    promedio: Math.round(item.promedioCantidad),
    desviacion: Math.round(item.desviacionEstandar)
  }));

  const correlacionData = datos.correlacionActividad.slice(0, 10).map(item => ({
    sector: item.sector,
    ratio: Math.round(item.ratioDanosPlanilla * 100) / 100,
    planillas: item.totalPlanillas,
    danos: item.totalDanos
  }));

  return (
    <Fade in timeout={1000}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <PsychologyIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Análisis Predictivo de Daños
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Predicciones basadas en patrones históricos y análisis de tendencias
              </Typography>
            </Box>
          </Box>

          {/* Tabs de navegación */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab icon={<ShowChartIcon />} label="Predicciones" />
              <Tab icon={<TimelineIcon />} label="Estacionalidad" />
              <Tab icon={<AssessmentIcon />} label="Correlaciones" />
              <Tab icon={<AnalyticsIcon />} label="Patrones" />
            </Tabs>
          </Box>

          {/* Contenido de las tabs */}
          {activeTab === 0 && (
            <Zoom in timeout={300}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  📊 Predicciones para los Próximos 6 Meses
                </Typography>
                
                <Grid container spacing={3} mb={3}>
                  <Grid xs={12} lg={8}>
                    <BarChartKPI
                      data={prediccionesData}
                      title="Predicción de Daños"
                      height={300}
                      dataKey="prediccion"
                      nameKey="mes"
                    />
                  </Grid>
                  <Grid xs={12} lg={4}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Nivel de Confianza
                      </Typography>
                      {prediccionesData.map((item, index) => (
                        <Box key={index} mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">{item.mes}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {item.confianza}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.confianza}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: item.confianza > 80 ? 'success.main' : 
                                         item.confianza > 60 ? 'warning.main' : 'error.main'
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                {/* Tabla de predicciones detalladas */}
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Mes</strong></TableCell>
                        <TableCell align="center"><strong>Predicción</strong></TableCell>
                        <TableCell align="center"><strong>Rango</strong></TableCell>
                        <TableCell align="center"><strong>Confianza</strong></TableCell>
                        <TableCell align="center"><strong>Estado</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prediccionesData.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography fontWeight="bold">{item.mes}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="h6" color="primary">
                              {item.prediccion}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {item.minimo} - {item.maximo}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${item.confianza}%`}
                              color={item.confianza > 80 ? 'success' : 
                                     item.confianza > 60 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.prediccion > 50 ? 'Alto' : 
                                     item.prediccion > 25 ? 'Medio' : 'Bajo'}
                              color={item.prediccion > 50 ? 'error' : 
                                     item.prediccion > 25 ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Zoom>
          )}

          {activeTab === 1 && (
            <Zoom in timeout={400}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  📅 Análisis de Estacionalidad
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid xs={12} lg={8}>
                    <BarChartKPI
                      data={estacionalidadData}
                      title="Patrones Estacionales"
                      height={300}
                      dataKey="cantidad"
                      nameKey="mes"
                    />
                  </Grid>
                  <Grid xs={12} lg={4}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Estadísticas Mensuales
                      </Typography>
                      {estacionalidadData.slice(0, 6).map((item, index) => (
                        <Box key={index} mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {item.mes}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Daños: {item.cantidad} | Promedio: {item.promedio}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Zoom>
          )}

          {activeTab === 2 && (
            <Zoom in timeout={500}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  🔗 Correlación con Actividad
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid xs={12} lg={8}>
                    <BarChartKPI
                      data={correlacionData}
                      title="Ratio de Daños por Sector"
                      height={300}
                      dataKey="ratio"
                      nameKey="sector"
                    />
                  </Grid>
                  <Grid xs={12} lg={4}>
                    <DonutChartKPI
                      data={correlacionData.slice(0, 5)}
                      title="Top 5 Sectores Críticos"
                      dataKey="danos"
                      nameKey="sector"
                    />
                  </Grid>
                </Grid>

                {/* Tabla de correlaciones */}
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Sector</strong></TableCell>
                        <TableCell align="center"><strong>Planillas</strong></TableCell>
                        <TableCell align="center"><strong>Daños</strong></TableCell>
                        <TableCell align="center"><strong>Ratio (%)</strong></TableCell>
                        <TableCell align="center"><strong>Riesgo</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {correlacionData.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography fontWeight="bold">{item.sector}</Typography>
                          </TableCell>
                          <TableCell align="center">{item.planillas}</TableCell>
                          <TableCell align="center">{item.danos}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${item.ratio}%`}
                              color={item.ratio > 50 ? 'error' : 
                                     item.ratio > 25 ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.ratio > 50 ? 'Alto' : 
                                     item.ratio > 25 ? 'Medio' : 'Bajo'}
                              color={item.ratio > 50 ? 'error' : 
                                     item.ratio > 25 ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Zoom>
          )}

          {activeTab === 3 && (
            <Zoom in timeout={600}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  🧠 Patrones Temporales Detectados
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          📈 Tendencias Históricas
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Análisis de los últimos 2 años para identificar patrones recurrentes
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="body2">
                            • <strong>Meses pico:</strong> {datos.estacionalidad
                              .sort((a, b) => b.cantidadDanos - a.cantidadDanos)
                              .slice(0, 3)
                              .map(item => new Date(2024, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' }))
                              .join(', ')}
                          </Typography>
                          <Typography variant="body2">
                            • <strong>Promedio mensual:</strong> {Math.round(
                              datos.estacionalidad.reduce((sum, item) => sum + item.cantidadDanos, 0) / 
                              datos.estacionalidad.length
                            )} daños
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          🎯 Recomendaciones
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="body2" color="textSecondary">
                            Basado en el análisis predictivo:
                          </Typography>
                          <Box mt={1}>
                            <Typography variant="body2">
                              • <strong>Monitoreo intensivo:</strong> En los meses de mayor actividad
                            </Typography>
                            <Typography variant="body2">
                              • <strong>Mantenimiento preventivo:</strong> Antes de los picos estacionales
                            </Typography>
                            <Typography variant="body2">
                              • <strong>Recursos adicionales:</strong> En sectores de alto riesgo
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Zoom>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default AnalisisPredictivo; 