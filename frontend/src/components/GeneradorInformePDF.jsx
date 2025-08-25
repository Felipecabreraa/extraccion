import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import axios from '../api/axios';

const GeneradorInformePDF = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fecha, setFecha] = useState(new Date());
  const [tipoInforme, setTipoInforme] = useState('diario');

  const generarInforme = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const fechaStr = fecha.toISOString().split('T')[0];
      
      // Configurar axios para recibir blob (PDF)
      const response = await axios.get(`/reportes-pdf/informe-diario?fecha=${fechaStr}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Danos_${fechaStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Informe PDF generado y descargado exitosamente');
      
    } catch (err) {
      console.error('Error generando informe:', err);
      setError('Error al generar el informe PDF. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const generarInformePrueba = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.get('/reportes-pdf/informe-prueba', {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Informe_Prueba.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Informe de prueba generado y descargado exitosamente');
      
    } catch (err) {
      console.error('Error generando informe de prueba:', err);
      setError('Error al generar el informe de prueba.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PdfIcon sx={{ fontSize: 32, color: '#d32f2f', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Generador de Informes PDF
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Genera informes diarios de daños en formato PDF
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Alertas */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Configuración del Informe */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                Configuración del Informe
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Informe</InputLabel>
                    <Select
                      value={tipoInforme}
                      label="Tipo de Informe"
                      onChange={(e) => setTipoInforme(e.target.value)}
                    >
                      <MenuItem value="diario">Informe Diario</MenuItem>
                      <MenuItem value="prueba">Informe de Prueba</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha del Informe"
                    value={fecha}
                    onChange={(newValue) => setFecha(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    disabled={tipoInforme === 'prueba'}
                  />
                </Grid>
              </Grid>

              {/* Información del Informe */}
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Información del Informe:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label={`Fecha: ${formatDate(fecha)}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Tipo: ${tipoInforme === 'diario' ? 'Diario' : 'Prueba'}`} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                  <Chip 
                    label="Formato: PDF" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Paper>

            {/* Contenido del Informe */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff3e0' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1 }} />
                Contenido del Informe
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Secciones Incluidas:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                    <li>Metros Superficie (m² limpiados)</li>
                    <li>Daños Acumulados 2025 (Real/Ppto)</li>
                    <li>Daños Acumulados Valores $ (Real/Ppto)</li>
                    <li>Daños del Año por Género</li>
                    <li>Consolidado Hembras y Machos</li>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Características:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                    <li>Tablas detalladas por quincenas</li>
                    <li>Gráficos de tendencias</li>
                    <li>Indicadores de estado (colores)</li>
                    <li>Datos por operador</li>
                    <li>Formato profesional A4</li>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Botones de Acción */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
                onClick={generarInforme}
                disabled={loading || tipoInforme === 'prueba'}
                sx={{ minWidth: 200 }}
              >
                {loading ? 'Generando...' : 'Generar Informe Diario'}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                onClick={generarInformePrueba}
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? 'Generando...' : 'Generar Informe de Prueba'}
              </Button>

              <Button
                variant="text"
                color="info"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setFecha(new Date());
                  setError(null);
                  setSuccess(null);
                }}
                disabled={loading}
              >
                Reiniciar
              </Button>
            </Box>

            {/* Información Adicional */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Nota:</strong> El informe se generará con los datos disponibles en el sistema para la fecha seleccionada. 
                Asegúrate de que los datos estén actualizados antes de generar el informe.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default GeneradorInformePDF;


