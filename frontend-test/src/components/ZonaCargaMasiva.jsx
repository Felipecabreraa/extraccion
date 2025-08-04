import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Female as FemaleIcon,
  Male as MaleIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const steps = ['Descargar Plantilla', 'Cargar Archivo', 'Revisar Resultados'];

export default function ZonaCargaMasiva({ open, onClose, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setResultados(null);
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const descargarPlantilla = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/zonas-carga-masiva/descargar-plantilla', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_zonas.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      handleNext();
    } catch (err) {
      setError('Error al descargar la plantilla');
      console.error('Error descargando plantilla:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV válido');
      setSelectedFile(null);
      return;
    }
    setError('');
    // Leer y procesar el archivo
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n');
        // Detectar separador automáticamente
        let separator = ',';
        if (lines[0].includes(';') && !lines[0].includes(',')) {
          separator = ';';
        }
        // Limpiar encabezados de tildes y espacios
        const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').toLowerCase();
        const headers = lines[0].split(separator).map(h => normalize(h));
        // Validar encabezados
        const requiredHeaders = ['nombre', 'tipo'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(normalize(h)));
        if (missingHeaders.length > 0) {
          setError(`Encabezados faltantes: ${missingHeaders.join(', ')}`);
          setSelectedFile(null);
          return;
        }
        setSelectedFile(file);
        setError('');
      } catch (error) {
        setError('Error al procesar el archivo CSV');
        setSelectedFile(null);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const cargarArchivo = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('archivo', selectedFile);

      const response = await axios.post('/zonas-carga-masiva/cargar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResultados(response.data);
      handleNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el archivo');
      console.error('Error en carga masiva:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'HEMBRA' ? <FemaleIcon /> : <MaleIcon />;
  };

  const getTipoColor = (tipo) => {
    return tipo === 'HEMBRA' ? 'secondary' : 'primary';
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Descargar Plantilla CSV
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Descarga la plantilla CSV con el formato correcto para cargar zonas masivamente.
              La plantilla incluye los campos: nombre y tipo (HEMBRA/MACHO).
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={descargarPlantilla}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Descargar Plantilla'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cargar Archivo CSV
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Selecciona el archivo CSV con los datos de las zonas a cargar.
            </Typography>
            
            <Box sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 3, 
              textAlign: 'center',
              bgcolor: selectedFile ? '#f0f8ff' : '#fafafa'
            }}>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="csv-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Seleccionar Archivo CSV
                </Button>
              </label>
              
              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="primary">
                    Archivo seleccionado: {selectedFile.name}
                  </Typography>
                </Box>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resultados de la Carga
            </Typography>

            {resultados && (
              <>
                {/* Resumen */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#e8f5e8' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {resultados.resumen.exitosos}
                        </Typography>
                        <Typography variant="body2">Exitosos</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {resultados.resumen.errores}
                        </Typography>
                        <Typography variant="body2">Errores</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#f3e5f5' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main">
                          {resultados.resumen.total}
                        </Typography>
                        <Typography variant="body2">Total</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Zonas Creadas Exitosamente */}
                {resultados.resultados.exitosos.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                      ✅ Zonas Creadas Exitosamente ({resultados.resultados.exitosos.length})
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Fila</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>ID Creado</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {resultados.resultados.exitosos.map((item, index) => (
                            <TableRow key={index} sx={{ bgcolor: '#f8fff8' }}>
                              <TableCell>{item.fila}</TableCell>
                              <TableCell>{item.datos.nombre}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={getTipoIcon(item.datos.tipo)}
                                  label={item.datos.tipo}
                                  color={getTipoColor(item.datos.tipo)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{item.zona.id}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Errores */}
                {resultados.resultados.errores.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
                      ❌ Errores ({resultados.resultados.errores.length})
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Fila</TableCell>
                            <TableCell>Datos</TableCell>
                            <TableCell>Errores</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {resultados.resultados.errores.map((item, index) => (
                            <TableRow key={index} sx={{ bgcolor: '#fff5f5' }}>
                              <TableCell>{item.fila}</TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  <strong>Nombre:</strong> {item.datos.nombre || 'N/A'}<br/>
                                  <strong>Tipo:</strong> {item.datos.tipo || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {item.errores.map((error, errorIndex) => (
                                  <Typography key={errorIndex} variant="body2" color="error" sx={{ mb: 0.5 }}>
                                    • {error}
                                  </Typography>
                                ))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Carga Masiva de Zonas
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={handleClose}
          sx={{ borderRadius: 2 }}
        >
          Cancelar
        </Button>
        
        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={cargarArchivo}
            disabled={!selectedFile || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Cargando...' : 'Cargar Archivo'}
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={() => {
              handleClose();
              if (onSuccess) onSuccess();
            }}
            sx={{ borderRadius: 2 }}
          >
            Finalizar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 