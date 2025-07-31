import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Grid, Chip, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const ReporteDetalladoMetros = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const cargarReporte = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/metros-superficie/reporte-detallado?year=${filtros.year}&month=${filtros.month}`);
      setReporte(response.data);

    } catch (err) {
      console.error('Error cargando reporte:', err);
      setError('Error al cargar el reporte detallado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [filtros]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateStr) => {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateStr.split('-').map(Number);
    // Crear fecha en UTC para evitar desplazamientos
    const fechaUTC = new Date(Date.UTC(year, month - 1, day));
    return fechaUTC.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const generarDiasQuincena = (fechaInicio, fechaFin) => {
    const dias = [];
    const fechaActual = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);

    while (fechaActual <= fechaFinObj) {
      dias.push(fechaActual.toISOString().split('T')[0]);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return dias;
  };

  const TablaQuincena = ({ titulo, fechaInicio, fechaFin, datosPorDia, totales, colorFondo }) => {
    const dias = generarDiasQuincena(fechaInicio, fechaFin);

    return (
      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {formatDate(fechaInicio)} - {formatDate(fechaFin)}
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: colorFondo }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>ZONAS</TableCell>
                  {dias.map(fecha => (
                    <TableCell key={fecha} align="center" sx={{ fontWeight: 600, minWidth: 80 }}>
                      {formatDate(fecha)}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#fff3cd', minWidth: 120 }}>
                    TOTAL {titulo.toUpperCase()}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Fila Hembra */}
                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>HEMBRA</TableCell>
                  {dias.map(fecha => (
                    <TableCell key={fecha} align="center" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {formatNumber(datosPorDia[fecha]?.hebra || 0)}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#fff3cd', color: 'primary.main' }}>
                    {formatNumber(totales.hebra)}
                  </TableCell>
                </TableRow>

                {/* Fila Macho */}
                <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>MACHO</TableCell>
                  {dias.map(fecha => (
                    <TableCell key={fecha} align="center" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                      {formatNumber(datosPorDia[fecha]?.macho || 0)}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#fff3cd', color: 'secondary.main' }}>
                    {formatNumber(totales.macho)}
                  </TableCell>
                </TableRow>

                {/* Fila Totales */}
                <TableRow sx={{ bgcolor: '#fff3cd' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>TOTALES</TableCell>
                  {dias.map(fecha => (
                    <TableCell key={fecha} align="center" sx={{ color: 'success.main', fontWeight: 700 }}>
                      {formatNumber(datosPorDia[fecha]?.total || 0)}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#fff3cd', color: 'success.main' }}>
                    {formatNumber(totales.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!reporte) {
    return (
      <Alert severity="info">
        No hay datos disponibles para el período seleccionado
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header con filtros */}
      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <AssessmentIcon color="primary" />
              <Typography variant="h5" fontWeight={700} color="primary">
                Reporte Detallado - Metros Superficie
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Año</InputLabel>
                <Select
                  value={filtros.year}
                  onChange={(e) => setFiltros({ ...filtros, year: e.target.value })}
                  label="Año"
                >
                  {[2024, 2025, 2026].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Mes</InputLabel>
                <Select
                  value={filtros.month}
                  onChange={(e) => setFiltros({ ...filtros, month: e.target.value })}
                  label="Mes"
                >
                  {[
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
                  ].map(month => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Primera Quincena */}
      <TablaQuincena
        titulo="1ERA QUINCENA"
        fechaInicio={reporte.quincena1.fecha_inicio}
        fechaFin={reporte.quincena1.fecha_fin}
        datosPorDia={reporte.quincena1.datos_por_dia}
        totales={reporte.quincena1.totales}
        colorFondo="#f8f9fa"
      />

      {/* Segunda Quincena */}
      <TablaQuincena
        titulo="2DA QUINCENA"
        fechaInicio={reporte.quincena2.fecha_inicio}
        fechaFin={reporte.quincena2.fecha_fin}
        datosPorDia={reporte.quincena2.datos_por_dia}
        totales={reporte.quincena2.totales}
        colorFondo="#f8f9fa"
      />

      {/* Resumen Mensual */}
      <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0', bgcolor: '#d4edda' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'success.main' }}>
            📊 TOTAL MENSUAL
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="rgba(25,118,210,0.1)" borderRadius={2}>
                <Typography variant="h5" color="primary" fontWeight={700}>
                  {formatNumber(reporte.totales_mensuales.hebra)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Hembra (m²)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="rgba(156,39,176,0.1)" borderRadius={2}>
                <Typography variant="h5" color="secondary" fontWeight={700}>
                  {formatNumber(reporte.totales_mensuales.macho)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Macho (m²)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="rgba(76,175,80,0.1)" borderRadius={2}>
                <Typography variant="h5" color="success.main" fontWeight={700}>
                  {formatNumber(reporte.totales_mensuales.total)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total (m²)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resumen del Mes Anterior */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUpIcon color="info" />
            <Typography variant="h6" fontWeight={700} color="info.main">
              MES ANTERIOR: {formatNumber(reporte.mes_anterior)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReporteDetalladoMetros;