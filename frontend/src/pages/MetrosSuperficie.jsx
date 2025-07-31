import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, IconButton, Tooltip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Snackbar, Divider, LinearProgress,
  FormHelperText, InputAdornment, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Calculate as CalculateIcon,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon,
  LocationOn as LocationIcon,
  ViewModule as ViewModuleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReporteDetalladoMetros from '../components/ReporteDetalladoMetros';

const MetrosSuperficie = () => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mesAnterior, setMesAnterior] = useState(null);
  
  // Estado para controlar la vista de registros
  const [vistaRegistros, setVistaRegistros] = useState('normal'); // 'normal' o 'especifica'
  
  // Estados del formulario
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fecha: new Date(),
    zona_id: '',
    sector_id: '',
    pabellones_limpiados: '',
    observacion: ''
  });
  const [calculado, setCalculado] = useState({
    metros_cuadrados: 0,
    sector_info: null
  });

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    search: '',
    zona_id: '',
    sector_id: '',
    tipo_zona: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  // Estados de notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estado para mostrar filtros avanzados
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [vistaActual, setVistaActual] = useState('registros'); // 'registros' o 'reporte'

  // Cargar datos iniciales
  const cargarDatosIniciales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query params para filtros
      const queryParams = new URLSearchParams();
      if (filtros.search) queryParams.append('search', filtros.search);
      if (filtros.zona_id) queryParams.append('zona_id', filtros.zona_id);
      if (filtros.sector_id) queryParams.append('sector_id', filtros.sector_id);
      if (filtros.tipo_zona) queryParams.append('tipo_zona', filtros.tipo_zona);
      if (filtros.fecha_inicio) queryParams.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) queryParams.append('fecha_fin', filtros.fecha_fin);

      const [zonasRes, registrosRes, estadisticasRes, mesAnteriorRes] = await Promise.all([
        axios.get('/zonas'),
        axios.get(`/metros-superficie?${queryParams.toString()}`),
        axios.get(`/metros-superficie/estadisticas/quincena?year=${filtros.year}&month=${filtros.month}`),
        axios.get(`/metros-superficie/estadisticas/mes-anterior?year=${filtros.year}&month=${filtros.month}`)
      ]);

      setZonas(zonasRes.data);
      setRegistros(registrosRes.data.registros || []);
      setEstadisticas(estadisticasRes.data);
      setMesAnterior(mesAnteriorRes.data);

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos de metros superficie');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Función para aplicar filtros automáticamente
  const aplicarFiltrosAutomatico = useCallback(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      search: '',
      zona_id: '',
      sector_id: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
  };

  // Función para manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Cargar sectores cuando se selecciona una zona
  const cargarSectores = useCallback(async (zonaId) => {
    if (!zonaId) {
      setSectores([]);
      return;
    }

    try {
      const response = await axios.get(`/metros-superficie/sectores/${zonaId}`);
      setSectores(response.data);
    } catch (err) {
      console.error('Error cargando sectores:', err);
      setSectores([]);
    }
  }, []);

  // Calcular metros cuadrados cuando cambian los datos del formulario
  const calcularMetrosCuadrados = useCallback(() => {
    if (formData.sector_id && formData.pabellones_limpiados) {
      const sector = sectores.find(s => s.id === parseInt(formData.sector_id));
      if (sector && sector.mt2) {
        const metros = parseInt(formData.pabellones_limpiados) * parseFloat(sector.mt2);
        setCalculado({
          metros_cuadrados: metros,
          sector_info: sector
        });
      }
    } else {
      setCalculado({ metros_cuadrados: 0, sector_info: null });
    }
  }, [formData.sector_id, formData.pabellones_limpiados, sectores]);

  useEffect(() => {
    calcularMetrosCuadrados();
  }, [calcularMetrosCuadrados]);

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'zona_id') {
      setFormData(prev => ({ ...prev, sector_id: '' }));
      cargarSectores(value);
    }
  };

  // Abrir modal para crear/editar
  const handleOpenModal = (registro = null) => {
    if (registro) {
      setEditingId(registro.id);
      setFormData({
        fecha: new Date(registro.fecha),
        zona_id: registro.zona_id,
        sector_id: registro.sector_id,
        pabellones_limpiados: registro.pabellones_limpiados.toString(),
        observacion: registro.observacion || ''
      });
      cargarSectores(registro.zona_id);
    } else {
      setEditingId(null);
      setFormData({
        fecha: new Date(),
        zona_id: '',
        sector_id: '',
        pabellones_limpiados: '',
        observacion: ''
      });
      setSectores([]);
    }
    setOpenModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingId(null);
    setFormData({
      fecha: new Date(),
      zona_id: '',
      sector_id: '',
      pabellones_limpiados: '',
      observacion: ''
    });
    setCalculado({ metros_cuadrados: 0, sector_info: null });
  };

  // Guardar registro
  const handleSave = async () => {
    try {
      // Validar datos antes de enviar
      if (!formData.fecha || !formData.zona_id || !formData.sector_id || !formData.pabellones_limpiados) {
        setSnackbar({
          open: true,
          message: 'Por favor completa todos los campos requeridos',
          severity: 'error'
        });
        return;
      }

      const data = {
        ...formData,
        fecha: formData.fecha.toISOString().split('T')[0],
        zona_id: parseInt(formData.zona_id),
        sector_id: parseInt(formData.sector_id),
        pabellones_limpiados: parseInt(formData.pabellones_limpiados)
      };

      console.log('📤 Enviando datos:', data);

      if (editingId) {
        const response = await axios.put(`/metros-superficie/${editingId}`, data);
        console.log('✅ Respuesta actualización:', response.data);
        setSnackbar({
          open: true,
          message: 'Registro actualizado exitosamente',
          severity: 'success'
        });
      } else {
        const response = await axios.post('/metros-superficie', data);
        console.log('✅ Respuesta creación:', response.data);
        setSnackbar({
          open: true,
          message: 'Registro creado exitosamente',
          severity: 'success'
        });
      }

      handleCloseModal();
      cargarDatosIniciales();

    } catch (err) {
      console.error('❌ Error guardando registro:', err);
      console.error('📋 Detalles del error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.response?.data?.message,
        errores: err.response?.data?.errores
      });

      let errorMessage = 'Error al guardar el registro';
      
      if (err.response?.data?.errores && Array.isArray(err.response.data.errores)) {
        errorMessage = err.response.data.errores.join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  // Eliminar registro
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      return;
    }

    try {
      await axios.delete(`/metros-superficie/${id}`);
      setSnackbar({
        open: true,
        message: 'Registro eliminado exitosamente',
        severity: 'success'
      });
      cargarDatosIniciales();
    } catch (err) {
      console.error('Error eliminando registro:', err);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el registro',
        severity: 'error'
      });
    }
  };

  // Formatear número con separadores de miles
  const formatNumber = (num) => {
    return num?.toLocaleString('es-CL') || '0';
  };

  // Obtener color del chip según tipo de zona
  const getChipColor = (tipo) => {
    return tipo === 'HEMBRA' ? 'primary' : 'secondary';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ background: '#fafbfc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AssessmentIcon color="primary" />
          <Typography variant="h4" fontWeight={700} color="primary">
            Metros Superficie
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          {/* Toggle para cambiar entre vistas */}
          <ToggleButtonGroup
            value={vistaActual}
            exclusive
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setVistaActual(newValue);
              }
            }}
            aria-label="vista"
          >
            <ToggleButton value="registros" aria-label="registros">
              <Tooltip title="Vista de Registros">
                <Box display="flex" alignItems="center" gap={1}>
                  <ViewModuleIcon />
                  <Typography variant="body2">Registros</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="reporte" aria-label="reporte">
              <Tooltip title="Reporte Detallado">
                <Box display="flex" alignItems="center" gap={1}>
                  <AssessmentIcon />
                  <Typography variant="body2">Reporte</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Botón agregar solo en vista de registros */}
          {vistaActual === 'registros' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{ borderRadius: 2 }}
            >
              Agregar Registro
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros Avanzados - Solo mostrar en vista de registros */}
      {vistaActual === 'registros' && (
        <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0', mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                  🔍 Filtros de Búsqueda
                </Typography>
                {/* Indicador de filtros activos */}
                {(filtros.search || filtros.zona_id) && (
                  <Chip
                    label={`${registros.length} registros encontrados`}
                    color="primary"
                    size="small"
                    icon={<SearchIcon />}
                  />
                )}
              </Box>
              <Button
                size="small"
                onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                startIcon={mostrarFiltrosAvanzados ? <CloseIcon /> : <InfoIcon />}
              >
                {mostrarFiltrosAvanzados ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
            </Box>

            {/* Indicador de filtros activos */}
            {(filtros.search || filtros.zona_id) && (
              <Box mb={2} p={1} bgcolor="rgba(25,118,210,0.1)" borderRadius={1}>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  🔍 Filtros Activos:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                  {filtros.search && (
                    <Chip
                      label={`Búsqueda: "${filtros.search}"`}
                      size="small"
                      onDelete={() => handleFiltroChange('search', '')}
                    />
                  )}
                  {filtros.zona_id && (
                    <Chip
                      label={`Zona: ${zonas.find(z => z.id === parseInt(filtros.zona_id))?.nombre || 'N/A'}`}
                      size="small"
                      onDelete={() => handleFiltroChange('zona_id', '')}
                    />
                  )}
                </Box>
              </Box>
            )}

            {mostrarFiltrosAvanzados && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="🔍 Buscar en observaciones"
                    placeholder="Ej: limpieza, mantenimiento..."
                    value={filtros.search}
                    onChange={(e) => handleFiltroChange('search', e.target.value)}
                    size="small"
                    helperText="Busca en las observaciones de los registros"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>🏢 Zona de Trabajo</InputLabel>
                    <Select
                      value={filtros.zona_id}
                      onChange={(e) => handleFiltroChange('zona_id', e.target.value)}
                      label="🏢 Zona de Trabajo"
                    >
                      <MenuItem value="">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationIcon fontSize="small" />
                          <Typography variant="body2">Todas las zonas</Typography>
                        </Box>
                      </MenuItem>
                      {zonas.map(zona => (
                        <MenuItem key={zona.id} value={zona.id}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {zona.nombre}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Tipo: {zona.tipo === 'HEMBRA' ? '♀ Hembra' : '♂ Macho'}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Selecciona una zona específica de trabajo (el tipo se filtra automáticamente)
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Button
                      variant="outlined"
                      onClick={limpiarFiltros}
                      size="small"
                      startIcon={<RefreshIcon />}
                      color="warning"
                      fullWidth
                    >
                      🗑️ Limpiar Filtros
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contenido condicional */}
      {vistaActual === 'registros' ? (
        <>
          {/* Estadísticas */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AssessmentIcon color="primary" />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        Estadísticas Quincena
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {estadisticas ? `${estadisticas.total_registros} registros` : 'Cargando...'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <DateRangeIcon color="secondary" />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="secondary">
                        Mes Anterior
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {mesAnterior ? `${formatNumber(mesAnterior.total_metros)} m²` : 'Cargando...'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AssessmentIcon color="success" />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        Total Registros
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {registros.length} registros
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtros y tabla de registros */}
          <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#222', mb: 3 }}>
                📋 Registros de Metros Superficie
              </Typography>

              {/* Resumen de totales */}
              {registros.length > 0 && (
                <Box mb={2} p={2} bgcolor="#f8f9fa" borderRadius={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    📊 Resumen de Registros Filtrados:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {registros.filter(r => r.tipo_zona === 'HEMBRA').length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Registros Hembra
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="secondary" fontWeight={700}>
                          {registros.filter(r => r.tipo_zona === 'MACHO').length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Registros Macho
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="success.main" fontWeight={700}>
                          {formatNumber(registros.reduce((sum, r) => sum + r.pabellones_limpiados, 0))}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Pabellones
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="info.main" fontWeight={700}>
                          {formatNumber(registros.reduce((sum, r) => sum + parseFloat(r.metros_cuadrados), 0))}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total m²
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="textSecondary">
                    Vista:
                  </Typography>
                  <ToggleButtonGroup
                    value={vistaRegistros}
                    exclusive
                    onChange={(event, newView) => setVistaRegistros(newView)}
                    aria-label="view mode"
                    size="small"
                  >
                    <ToggleButton value="normal" aria-label="normal view">
                      <Tooltip title="Vista de tabla completa">
                        <ViewModuleIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="especifica" aria-label="specific view">
                      <Tooltip title="Vista separada por Hembra/Macho">
                        <ViewListIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {vistaRegistros === 'normal' ? (
                // Vista normal - Tabla completa
                <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Zona</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Sector</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Pabellones</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Metros²</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Observación</TableCell>
                        {usuario?.rol === 'administrador' && (
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {registros.map((registro) => (
                        <TableRow key={registro.id} hover>
                          <TableCell>
                            {new Date(registro.fecha).toLocaleDateString('es-CL')}
                          </TableCell>
                          <TableCell>
                            {registro.Zona?.nombre}
                          </TableCell>
                          <TableCell>
                            {registro.Sector?.nombre}
                          </TableCell>
                          <TableCell align="right">
                            {registro.pabellones_limpiados}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {formatNumber(registro.metros_cuadrados)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={registro.tipo_zona}
                              color={getChipColor(registro.tipo_zona)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {registro.observacion || '-'}
                            </Typography>
                          </TableCell>
                          {usuario?.rol === 'administrador' && (
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center">
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenModal(registro)}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(registro.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                // Vista específica - Resumen por tipo de zona
                <Grid container spacing={3}>
                  {/* Vista Hembra */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 #e0e0e0' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                          🟦 ZONA HEMBRA
                        </Typography>
                        <Box>
                          {registros
                            .filter(registro => registro.tipo_zona === 'HEMBRA')
                            .map((registro, index) => (
                              <Box key={registro.id} p={2} mb={1} bgcolor="rgba(25,118,210,0.05)" borderRadius={2}>
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight={600}>
                                      {registro.Sector?.nombre}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {new Date(registro.fecha).toLocaleDateString('es-CL')}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4} textAlign="center">
                                    <Typography variant="body2" fontWeight={600}>
                                      {registro.pabellones_limpiados} pabellones
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4} textAlign="right">
                                    <Typography variant="body2" fontWeight={700} color="primary.main">
                                      {formatNumber(registro.metros_cuadrados)} m²
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Box>
                            ))}
                          {registros.filter(registro => registro.tipo_zona === 'HEMBRA').length === 0 && (
                            <Box textAlign="center" py={3}>
                              <Typography variant="body2" color="textSecondary">
                                No hay registros para zona Hembra
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Vista Macho */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 #e0e0e0' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          🟪 ZONA MACHO
                        </Typography>
                        <Box>
                          {registros
                            .filter(registro => registro.tipo_zona === 'MACHO')
                            .map((registro, index) => (
                              <Box key={registro.id} p={2} mb={1} bgcolor="rgba(156,39,176,0.05)" borderRadius={2}>
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight={600}>
                                      {registro.Sector?.nombre}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {new Date(registro.fecha).toLocaleDateString('es-CL')}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4} textAlign="center">
                                    <Typography variant="body2" fontWeight={600}>
                                      {registro.pabellones_limpiados} pabellones
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4} textAlign="right">
                                    <Typography variant="body2" fontWeight={700} color="secondary.main">
                                      {formatNumber(registro.metros_cuadrados)} m²
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Box>
                            ))}
                          {registros.filter(registro => registro.tipo_zona === 'MACHO').length === 0 && (
                            <Box textAlign="center" py={3}>
                              <Typography variant="body2" color="textSecondary">
                                No hay registros para zona Macho
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Totales */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 #e0e0e0', bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'success.main' }}>
                          📊 TOTALES
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <Box textAlign="center" p={2} bgcolor="rgba(25,118,210,0.1)" borderRadius={2}>
                              <Typography variant="h5" color="primary" fontWeight={700}>
                                {formatNumber(registros.filter(r => r.tipo_zona === 'HEMBRA').reduce((sum, r) => sum + parseFloat(r.metros_cuadrados), 0))}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Total Hembra (m²)
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {registros.filter(r => r.tipo_zona === 'HEMBRA').length} registros
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box textAlign="center" p={2} bgcolor="rgba(156,39,176,0.1)" borderRadius={2}>
                              <Typography variant="h5" color="secondary" fontWeight={700}>
                                {formatNumber(registros.filter(r => r.tipo_zona === 'MACHO').reduce((sum, r) => sum + parseFloat(r.metros_cuadrados), 0))}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Total Macho (m²)
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {registros.filter(r => r.tipo_zona === 'MACHO').length} registros
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box textAlign="center" p={2} bgcolor="rgba(76,175,80,0.1)" borderRadius={2}>
                              <Typography variant="h5" color="success.main" fontWeight={700}>
                                {formatNumber(registros.reduce((sum, r) => sum + parseFloat(r.metros_cuadrados), 0))}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Total General (m²)
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {registros.length} registros totales
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        {/* Información adicional */}
                        <Box mt={3} p={2} bgcolor="rgba(255,255,255,0.8)" borderRadius={2}>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            📈 Resumen Detallado:
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="info.main" fontWeight={700}>
                                  {formatNumber(registros.reduce((sum, r) => sum + r.pabellones_limpiados, 0))}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Total Pabellones Limpiados
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="warning.main" fontWeight={700}>
                                  {registros.length > 0 ? formatNumber(registros.reduce((sum, r) => sum + parseFloat(r.metros_cuadrados), 0) / registros.length) : '0'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Promedio m² por Registro
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="primary" fontWeight={700}>
                                  {registros.length > 0 ? Math.max(...registros.map(r => parseFloat(r.metros_cuadrados))).toLocaleString('es-CL') : '0'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Máximo m² por Registro
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="secondary" fontWeight={700}>
                                  {registros.length > 0 ? Math.min(...registros.map(r => parseFloat(r.metros_cuadrados))).toLocaleString('es-CL') : '0'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Mínimo m² por Registro
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {registros.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    No hay registros de metros superficie
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Modal para Crear/Editar */}
          <Dialog 
            open={openModal} 
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, color: '#222' }}>
              {editingId ? 'Editar Registro' : 'Agregar Registro'}
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha"
                    value={formData.fecha}
                    onChange={(newValue) => handleFormChange('fecha', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    format="DD/MM/YYYY"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Zona</InputLabel>
                    <Select
                      value={formData.zona_id}
                      onChange={(e) => handleFormChange('zona_id', e.target.value)}
                      label="Zona"
                    >
                      {zonas.map(zona => (
                        <MenuItem key={zona.id} value={zona.id}>
                          {zona.nombre} ({zona.tipo})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sector</InputLabel>
                    <Select
                      value={formData.sector_id}
                      onChange={(e) => handleFormChange('sector_id', e.target.value)}
                      label="Sector"
                      disabled={!formData.zona_id}
                    >
                      {sectores.map(sector => (
                        <MenuItem key={sector.id} value={sector.id}>
                          {sector.nombre} ({sector.mt2} m²)
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {calculado.sector_info && `Total pabellones: ${calculado.sector_info.cantidad_pabellones}`}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pabellones Limpiados"
                    type="number"
                    value={formData.pabellones_limpiados}
                    onChange={(e) => handleFormChange('pabellones_limpiados', e.target.value)}
                    inputProps={{ min: 0, max: calculado.sector_info?.cantidad_pabellones || 999 }}
                    InputProps={{
                      endAdornment: calculado.sector_info && (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="textSecondary">
                            / {calculado.sector_info.cantidad_pabellones}
                          </Typography>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observación"
                    multiline
                    rows={3}
                    value={formData.observacion}
                    onChange={(e) => handleFormChange('observacion', e.target.value)}
                  />
                </Grid>

                {/* Cálculo automático */}
                {calculado.metros_cuadrados > 0 && (
                  <Grid item xs={12}>
                    <Alert 
                      severity="info" 
                      icon={<CalculateIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Cálculo automático: {formData.pabellones_limpiados} pabellones × {calculado.sector_info?.mt2} m² = {formatNumber(calculado.metros_cuadrados)} m²
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseModal} startIcon={<CloseIcon />}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                variant="contained"
                disabled={!formData.fecha || !formData.zona_id || !formData.sector_id || !formData.pabellones_limpiados}
                startIcon={<CheckCircleIcon />}
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar para notificaciones */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      ) : (
        <ReporteDetalladoMetros />
      )}
    </Box>
  );
};

export default MetrosSuperficie;