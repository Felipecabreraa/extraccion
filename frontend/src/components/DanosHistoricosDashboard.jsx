import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, CircularProgress, Tabs, Tab, Accordion,
  AccordionSummary, AccordionDetails, IconButton, Tooltip
} from '@mui/material';
import {
  Warning as WarningIcon,
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import BarChartKPI from './BarChartKPI';
import DonutChartKPI from './DonutChartKPI';
import KPIVisual from './KPIVisual';
import { transformMesesData, transformZonasData, transformTiposData, transformOperadoresData, transformMaquinasData, transformPabellonesData, transformDescripcionesData } from '../utils/dataTransformers';

const DanosHistoricosDashboard = ({ datos, loading, error }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('panel1');

  // Debug: Log de datos recibidos
  console.log('🔍 DanosHistoricosDashboard - Datos recibidos:', datos);
  console.log('📊 porMes:', datos?.porMes);
  console.log('🗺️ porZona:', datos?.porZona);
  console.log('📁 porTipo:', datos?.porTipo);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!datos) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No hay datos históricos disponibles
      </Alert>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danos-historicos-2024-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header con título y acciones */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            📊 Análisis Histórico de Daños - 2024
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Reporte completo de daños históricos del sistema anterior
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Exportar datos">
            <IconButton onClick={exportData} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir reporte">
            <IconButton onClick={printReport} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Compartir">
            <IconButton color="primary">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPIs Principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<WarningIcon />}
            label="Total Daños 2024"
            value={datos.total || 0}
            subtitle="Registros históricos"
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<AssessmentIcon />}
            label="Promedio por Servicio"
            value={datos.promedioPorServicio || 0}
            subtitle="Daños promedio"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<LocationIcon />}
            label="Sectores Afectados"
            value={datos.porZona?.length || 0}
            subtitle="Zonas con daños"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIVisual
            icon={<PersonIcon />}
            label="Operadores Involucrados"
            value={datos.porOperador?.length || 0}
            subtitle="Personal afectado"
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Tabs de navegación */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab icon={<BarChartIcon />} label="Resumen Ejecutivo" />
          <Tab icon={<PieChartIcon />} label="Análisis por Categorías" />
          <Tab icon={<TableChartIcon />} label="Datos Detallados" />
          <Tab icon={<TrendingUpIcon />} label="Tendencias Temporales" />
        </Tabs>
      </Box>

      {/* Contenido de las tabs */}
      {activeTab === 0 && (
        <Box>
          {/* Resumen Ejecutivo */}
          <Grid container spacing={4} mb={4}>
            <Grid xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1 }} />
                    📅 Distribución Mensual de Daños 2024
                  </Typography>
                  <BarChartKPI
                    data={(() => {
                      const transformed = transformMesesData(datos.porMes);
                      console.log('🔄 transformMesesData resultado:', transformed);
                      return transformed;
                    })()}
                    title=""
                    height={300}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📁 Tipos de Daño
                  </Typography>
                  <DonutChartKPI
                    data={(() => {
                      const transformed = transformTiposData(datos.porTipo);
                      console.log('🔄 transformTiposData resultado:', transformed);
                      return transformed;
                    })()}
                    title=""
                    dataKey="cantidad"
                    nameKey="tipo"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Resumen de estadísticas */}
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🏭 Top 5 Sectores con Más Daños
                  </Typography>
                                     <Box>
                     {transformZonasData(datos.porZona)
                       .slice(0, 5)
                       .map((item, index) => (
                                                 <Box key={item.zona} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    👷 Top 5 Operadores con Más Daños
                  </Typography>
                                     <Box>
                     {transformOperadoresData(datos.porOperador)
                       .slice(0, 5)
                       .map((item, index) => (
                         <Box key={item.operador} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                           <Typography variant="body2" sx={{ maxWidth: '70%' }}>
                             {index + 1}. {item.operador.length > 30 ? item.operador.substring(0, 30) + '...' : item.operador}
                           </Typography>
                           <Chip label={item.cantidad} size="small" color="secondary" />
                         </Box>
                       ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Análisis por Categorías */}
          <Grid container spacing={4}>
            <Grid xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📁 Distribución por Tipo de Daño
                  </Typography>
                  <DonutChartKPI
                    data={transformTiposData(datos.porTipo)}
                    title=""
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🏢 Distribución por Pabellón
                  </Typography>
                  <DonutChartKPI
                    data={transformPabellonesData(datos.porPabellon)}
                    title=""
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top descripciones de daños */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧱 Top 10 Descripciones de Daños
              </Typography>
                             <Grid container spacing={2}>
                 {transformDescripcionesData(datos.porDescripcion)
                   .slice(0, 10)
                   .map((item, index) => (
                                         <Grid item xs={12} sm={6} md={4} key={item.descripcion}>
                       <Box display="flex" justifyContent="space-between" alignItems="center" p={1} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                         <Typography variant="body2" sx={{ maxWidth: '70%' }}>
                           {index + 1}. {item.descripcion.length > 25 ? item.descripcion.substring(0, 25) + '...' : item.descripcion}
                         </Typography>
                         <Chip label={item.cantidad} size="small" color="warning" />
                       </Box>
                     </Grid>
                  ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {/* Datos Detallados */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Accordion expanded={expandedAccordion === 'panel1'} onChange={handleAccordionChange('panel1')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    Daños por Sector/Zona
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Sector/Zona</TableCell>
                          <TableCell align="right">Cantidad de Daños</TableCell>
                          <TableCell align="right">Porcentaje</TableCell>
                        </TableRow>
                      </TableHead>
                                             <TableBody>
                         {transformZonasData(datos.porZona).map((item) => (
                           <TableRow key={item.zona}>
                             <TableCell>{item.zona}</TableCell>
                             <TableCell align="right">{item.cantidad}</TableCell>
                             <TableCell align="right">
                               {((item.cantidad / datos.total) * 100).toFixed(1)}%
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion expanded={expandedAccordion === 'panel2'} onChange={handleAccordionChange('panel2')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Daños por Operador
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Operador</TableCell>
                          <TableCell align="right">Cantidad de Daños</TableCell>
                          <TableCell align="right">Porcentaje</TableCell>
                        </TableRow>
                      </TableHead>
                                             <TableBody>
                         {transformOperadoresData(datos.porOperador).map((item) => (
                           <TableRow key={item.operador}>
                             <TableCell>{item.operador}</TableCell>
                             <TableCell align="right">{item.cantidad}</TableCell>
                             <TableCell align="right">
                               {((item.cantidad / datos.total) * 100).toFixed(1)}%
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion expanded={expandedAccordion === 'panel3'} onChange={handleAccordionChange('panel3')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EngineeringIcon sx={{ mr: 1 }} />
                    Daños por Máquina
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Máquina</TableCell>
                          <TableCell align="right">Cantidad de Daños</TableCell>
                          <TableCell align="right">Porcentaje</TableCell>
                        </TableRow>
                      </TableHead>
                                             <TableBody>
                         {transformMaquinasData(datos.porMaquina).map((item) => (
                           <TableRow key={item.maquina}>
                             <TableCell>{item.maquina}</TableCell>
                             <TableCell align="right">{item.cantidad}</TableCell>
                             <TableCell align="right">
                               {((item.cantidad / datos.total) * 100).toFixed(1)}%
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          {/* Tendencias Temporales */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📈 Tendencias de los Últimos 12 Meses
                  </Typography>
                                     <BarChartKPI
                     data={transformMesesData(datos.ultimos12Meses)}
                     title=""
                     height={400}
                   />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🔥 Mapa de Calor - Distribución Temporal
                  </Typography>
                  <Box height={300} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="textSecondary">
                      Mapa de calor temporal de daños (datos disponibles: {datos.heatmapData?.length || 0} puntos)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default DanosHistoricosDashboard; 