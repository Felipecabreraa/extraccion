import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import axios from '../api/axios';

const GeneradorPDFPanel = () => {
  const [fecha, setFecha] = useState(new Date());
  const [orientacion, setOrientacion] = useState('vertical');
  const [generando, setGenerando] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [alert, setAlert] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [dialogEliminar, setDialogEliminar] = useState({ open: false, fileName: '' });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [pdfsRes, statsRes] = await Promise.all([
        axios.get('/generador-pdf-simple/listar'),
        axios.get('/generador-pdf-simple/estadisticas')
      ]);

      if (pdfsRes.data.success) {
        setPdfs(pdfsRes.data.data);
      }

      if (statsRes.data.success) {
        setEstadisticas(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setAlert({
        type: 'error',
        message: 'Error cargando datos del generador de PDF'
      });
    } finally {
      setCargando(false);
    }
  };

  const generarPDF = async () => {
    try {
      setGenerando(true);
      setAlert(null);

      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      const response = await axios.post('/generador-pdf-simple/generar', {
        fecha: fechaFormateada,
        orientacion: orientacion
      });

      if (response.data.success) {
        setAlert({
          type: 'success',
          message: `PDF generado exitosamente: ${response.data.data.fileName}`
        });
        
        // Recargar datos
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error generando PDF'
      });
    } finally {
      setGenerando(false);
    }
  };

  const descargarPDF = async (fileName) => {
    try {
      const response = await axios.get(`/generador-pdf-simple/descargar/${fileName}`, {
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setAlert({
        type: 'success',
        message: `PDF descargado: ${fileName}`
      });
    } catch (error) {
      console.error('Error descargando PDF:', error);
      setAlert({
        type: 'error',
        message: 'Error descargando PDF'
      });
    }
  };

  const eliminarPDF = async (fileName) => {
    try {
      const response = await axios.delete(`/generador-pdf-simple/eliminar/${fileName}`);

      if (response.data.success) {
        setAlert({
          type: 'success',
          message: `PDF eliminado: ${fileName}`
        });
        
        // Recargar datos
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error eliminando PDF:', error);
      setAlert({
        type: 'error',
        message: 'Error eliminando PDF'
      });
    } finally {
      setDialogEliminar({ open: false, fileName: '' });
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PdfIcon color="primary" />
          Generador de PDF - Panel de Control
        </Typography>

        {/* Alertas */}
        {alert && (
          <Alert 
            severity={alert.type} 
            sx={{ mb: 3 }}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Panel de Generación */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generar Nuevo PDF
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <DatePicker
                    label="Fecha del Reporte"
                    value={fecha}
                    onChange={(newFecha) => setFecha(newFecha)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    maxDate={new Date()}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Orientación</InputLabel>
                    <Select
                      value={orientacion}
                      label="Orientación"
                      onChange={(e) => setOrientacion(e.target.value)}
                    >
                      <MenuItem value="vertical">Vertical (A4)</MenuItem>
                      <MenuItem value="horizontal">Horizontal (A4)</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    startIcon={generando ? <CircularProgress size={20} /> : <PdfIcon />}
                    onClick={generarPDF}
                    disabled={generando}
                    fullWidth
                    size="large"
                  >
                    {generando ? 'Generando PDF...' : 'Generar PDF'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estadísticas */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estadísticas
                </Typography>
                
                {estadisticas && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total de PDFs:</Typography>
                      <Chip label={estadisticas.totalPDFs} color="primary" />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tamaño Total:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {estadisticas.tamañoTotal}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Última Generación:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {estadisticas.ultimaGeneracion 
                          ? formatearFecha(estadisticas.ultimaGeneracion)
                          : 'N/A'
                        }
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de PDFs */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    PDFs Generados
                  </Typography>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={cargarDatos}
                    variant="outlined"
                    size="small"
                  >
                    Actualizar
                  </Button>
                </Box>

                {pdfs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">
                      No hay PDFs generados aún
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre del Archivo</TableCell>
                          <TableCell>Tamaño</TableCell>
                          <TableCell>Fecha de Creación</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pdfs.map((pdf) => (
                          <TableRow key={pdf.fileName}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PdfIcon color="primary" />
                                {pdf.fileName}
                              </Box>
                            </TableCell>
                            <TableCell>{pdf.size}</TableCell>
                            <TableCell>
                              {formatearFecha(pdf.fechaModificacion)}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                color="primary"
                                onClick={() => descargarPDF(pdf.fileName)}
                                title="Descargar"
                              >
                                <DownloadIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => setDialogEliminar({ open: true, fileName: pdf.fileName })}
                                title="Eliminar"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dialog de confirmación para eliminar */}
        <Dialog
          open={dialogEliminar.open}
          onClose={() => setDialogEliminar({ open: false, fileName: '' })}
        >
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que quieres eliminar el archivo "{dialogEliminar.fileName}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogEliminar({ open: false, fileName: '' })}>
              Cancelar
            </Button>
            <Button 
              onClick={() => eliminarPDF(dialogEliminar.fileName)}
              color="error"
              variant="contained"
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default GeneradorPDFPanel;
