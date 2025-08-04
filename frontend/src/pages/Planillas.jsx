import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TablePagination, MenuItem, Grid, Chip, FormControl, InputLabel, Select, Alert, FormHelperText, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import PlanillaBarredores from './PlanillaBarredores';
import PlanillaMaquinas from './PlanillaMaquinas';
import PlanillaPabellones from './PlanillaPabellones';
import PlanillaDanos from './PlanillaDanos';
import { validateNumericInput } from '../utils/numericValidation';
import { useAutoRefresh, useEmitUpdate } from '../hooks/useAutoRefresh';

export default function Planillas() {
  const [planillas, setPlanillas] = useState([]);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingPlanilla, setEditingPlanilla] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [formData, setFormData] = useState({
    supervisor: '',
    zona_id: '',
    sector_id: '',
    fecha_inicio: '',
    fecha_termino: '',
    nro_ticket: '',
    pabellones_total: '',
    pabellones_limpiados: '',
    estado: 'PENDIENTE',
    observacion: ''
  });
  const [filtroSupervisor, setFiltroSupervisor] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroSupervisorSelect, setFiltroSupervisorSelect] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selects dependientes
  const [supervisores, setSupervisores] = useState([]);

  // Estados para modales de datos complementarios
  const [planillaBarredoresOpen, setPlanillaBarredoresOpen] = useState(false);
  const [planillaIdSeleccionada, setPlanillaIdSeleccionada] = useState(null);
  const [planillaMaquinasOpen, setPlanillaMaquinasOpen] = useState(false);
  const [planillaIdMaquinas, setPlanillaIdMaquinas] = useState(null);
  const [planillaPabellonesOpen, setPlanillaPabellonesOpen] = useState(false);
  const [planillaIdPabellones, setPlanillaIdPabellones] = useState(null);
  const [planillaDanosOpen, setPlanillaDanosOpen] = useState(false);
  const [planillaIdDanos, setPlanillaIdDanos] = useState(null);

  // Hook para emitir eventos de actualización
  const { emitUpdate } = useEmitUpdate();

  // Cargar planillas con filtros
  const fetchPlanillas = useCallback(async (showLoading = false, signal = null) => {
    try {
      const res = await axios.get('/planillas', { signal });
      setPlanillas(res.data);
      setError('');
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelado');
        return;
      }
      console.error('Error cargando planillas:', error);
      setError('Error al cargar planillas');
    }
  }, []);

  // Cargar supervisores
  const fetchSupervisores = useCallback(async () => {
    try {
      const res = await axios.get('/usuarios', { params: { rol: 'supervisor' } });
      setSupervisores(res.data);
    } catch (error) {
      console.error('Error cargando supervisores:', error);
    }
  }, []);

  // Cargar todas las zonas (datos fijos)
  const fetchZonas = useCallback(async () => {
    try {
      const res = await axios.get('/zonas');
      setZonas(res.data);
    } catch (error) {
      console.error('Error cargando zonas:', error);
      setZonas([]);
    }
  }, []);

  // Cargar sectores por zona (datos fijos)
  const fetchSectores = useCallback(async (zona_id) => {
    if (!zona_id) { setSectores([]); return; }
    try {
      const res = await axios.get('/sectores', { params: { zona_id } });
      setSectores(res.data);
    } catch (error) {
      console.error('Error cargando sectores:', error);
      setSectores([]);
    }
  }, []);

  // Usar el hook de auto-refresh para planillas
  const {
    isRefreshing,
    lastUpdate,
    autoRefreshEnabled,
    manualRefresh,
    toggleAutoRefresh
  } = useAutoRefresh(fetchPlanillas, 30000, true);

  // Cargar datos iniciales
  useEffect(() => {
    fetchPlanillas(true);
    fetchSupervisores();
    fetchZonas();
  }, [fetchPlanillas, fetchSupervisores, fetchZonas]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setPage(0);
  }, [filtroSupervisor, filtroSupervisorSelect, filtroEstado]);

  // Limpiar campos cuando cambie el supervisor (solo para nueva planilla)
  useEffect(() => {
    if (formData.supervisor && !editingPlanilla) {
      setFormData(f => ({ 
        ...f, 
        zona_id: '', 
        sector_id: '', 
        fecha_inicio: '', 
        fecha_termino: '', 
        nro_ticket: '',
        pabellones_total: '',
        pabellones_limpiados: '',
        estado: 'PENDIENTE',
        observacion: ''
      }));
    }
  }, [formData.supervisor, editingPlanilla]);

  // Select dependiente: sectores por zona
  useEffect(() => {
    if (formData.zona_id && !editingPlanilla) {
      // Solo limpiar si no estamos editando
      setFormData(f => ({ 
        ...f, 
        sector_id: '', 
        fecha_inicio: '', 
        fecha_termino: '', 
        nro_ticket: '',
        pabellones_total: '',
        pabellones_limpiados: '',
        estado: 'PENDIENTE',
        observacion: ''
      }));
    }
    if (formData.zona_id) {
      fetchSectores(formData.zona_id);
    }
  }, [formData.zona_id, fetchSectores, editingPlanilla]);

  // useEffect para actualizar cantidad de pabellones si cambia el sector seleccionado
  useEffect(() => {
    if (formData.sector_id && sectores.length > 0) {
      const sector = sectores.find(s => s.id === Number(formData.sector_id));
      if (sector && !editingPlanilla) {
        // Solo actualizar automáticamente si no estamos editando
        setFormData(f => ({ 
          ...f, 
          fecha_inicio: sector.fecha_inicio, 
          fecha_termino: sector.fecha_termino, 
          nro_ticket: sector.ticket, 
          zona_id: sector.zona_id,
          pabellones_total: sector.cantidad_pabellones || 0,
          pabellones_limpiados: '',
          estado: 'PENDIENTE',
          observacion: ''
        }));
      }
    }
  }, [formData.sector_id, sectores, editingPlanilla]);

  // Abrir modal
  const handleOpenModal = (planilla = null) => {
    setError('');
    console.log('Abriendo modal con planilla:', planilla);
    
    if (planilla) {
      // Cargar sectores de la zona si existe
      const loadSectores = async () => {
        try {
          if (planilla.zona_id) {
            console.log('Cargando sectores para zona:', planilla.zona_id);
            const sectoresRes = await axios.get('/sectores', { params: { zona_id: planilla.zona_id } });
            setSectores(sectoresRes.data);
            console.log('Sectores cargados:', sectoresRes.data);
          }
          
          // Establecer el formulario con los datos de la planilla
          const formDataToSet = {
            supervisor: planilla.supervisor_id || '',
            zona_id: planilla.zona_id || '',
            sector_id: planilla.sector_id && planilla.sector_id > 0 ? planilla.sector_id : '',
            fecha_inicio: planilla.fecha_inicio?.slice(0, 10) || '',
            fecha_termino: planilla.fecha_termino?.slice(0, 10) || '',
            nro_ticket: planilla.ticket || '',
            pabellones_total: planilla.pabellones_total || '',
            pabellones_limpiados: planilla.pabellones_limpiados || '',
            estado: planilla.estado || 'PENDIENTE',
            observacion: planilla.observacion || ''
          };
          
          console.log('Estableciendo formData:', formDataToSet);
          setFormData(formDataToSet);
          setEditingPlanilla(planilla.id);
          setOpenModal(true);
        } catch (error) {
          console.error('Error cargando sectores:', error);
          setError('Error al cargar datos de la planilla');
        }
      };
      
      loadSectores();
    } else {
      // Limpiar datos dependientes para nueva planilla
      setSectores([]);
      setFormData({
        supervisor: '',
        zona_id: '',
        sector_id: '',
        fecha_inicio: '',
        fecha_termino: '',
        nro_ticket: '',
        pabellones_total: '',
        pabellones_limpiados: '',
        estado: 'PENDIENTE',
        observacion: ''
      });
      setEditingPlanilla(null);
      setOpenModal(true);
    }
  };

  // Guardar planilla
  const handleSave = async () => {
    try {
      // Validar campos requeridos
      if (!formData.supervisor || !formData.sector_id || !formData.fecha_inicio) {
        setError('Los campos Supervisor, Sector y Fecha de Inicio son obligatorios');
        return;
      }

      // Validar que pabellones_total tenga un valor válido
      if (!formData.pabellones_total || parseInt(formData.pabellones_total) <= 0) {
        setError('Debe seleccionar un sector válido con pabellones');
        return;
      }

      // Preparar datos para enviar
      const planillaData = {
        supervisor_id: parseInt(formData.supervisor),
        zona_id: formData.zona_id ? parseInt(formData.zona_id) : null,
        sector_id: parseInt(formData.sector_id),
        fecha_inicio: formData.fecha_inicio,
        fecha_termino: formData.fecha_termino || null,
        ticket: formData.nro_ticket || null,
        pabellones_total: formData.pabellones_total ? parseInt(formData.pabellones_total) : 0,
        pabellones_limpiados: formData.pabellones_limpiados ? parseInt(formData.pabellones_limpiados) : null,
        estado: formData.estado || 'PENDIENTE',
        observacion: formData.observacion || null
      };

      // Validar que los IDs sean válidos
      if (!planillaData.supervisor_id || !planillaData.sector_id) {
        setError('Supervisor y Sector son obligatorios');
        return;
      }

      // Validar que pabellones_limpiados no exceda pabellones_total
      if (planillaData.pabellones_limpiados && planillaData.pabellones_limpiados > planillaData.pabellones_total) {
        setError('Los pabellones trabajados no pueden exceder la cantidad total de pabellones');
        return;
      }

      console.log('📤 Enviando datos al backend:', planillaData);

      if (editingPlanilla) {
        await axios.put(`/planillas/${editingPlanilla}`, planillaData);
        setError('Planilla actualizada exitosamente');
      } else {
        await axios.post('/planillas', planillaData);
        setError('Planilla creada exitosamente');
      }
      setOpenModal(false);
      
      // Emitir evento de actualización para otras páginas
      emitUpdate({ 
        type: 'planilla', 
        action: editingPlanilla ? 'updated' : 'created',
        id: editingPlanilla || 'new'
      });
      
      // Actualizar lista local
      manualRefresh();
    } catch (error) {
      console.error('Error guardando planilla:', error);
      setError(error.response?.data?.message || 'Error al guardar la planilla');
    }
  };

  // Eliminar planilla
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta planilla?')) {
      try {
        await axios.delete(`/planillas/${id}`);
        setError('Planilla eliminada exitosamente');
        
        // Emitir evento de actualización para otras páginas
        emitUpdate({ 
          type: 'planilla', 
          action: 'deleted',
          id: id
        });
        
        // Actualizar lista local
        manualRefresh();
      } catch (error) {
        console.error('Error eliminando planilla:', error);
        setError('Error al eliminar la planilla');
      }
    }
  };

  // Marcar como activa
  const handleMarcarActiva = async (planilla) => {
    try {
      await axios.put(`/planillas/${planilla.id}`, { ...planilla, estado: 'ACTIVA' });
      setError('Planilla marcada como activa');
      
      // Emitir evento de actualización para otras páginas
      emitUpdate({ 
        type: 'planilla', 
        action: 'status_changed',
        id: planilla.id,
        newStatus: 'ACTIVA'
      });
      
      // Actualizar lista local
      manualRefresh();
    } catch (error) {
      console.error('Error marcando planilla como activa:', error);
      setError('Error al marcar como activa');
    }
  };

  // Paginación
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(+event.target.value); setPage(0); };

  // Funciones para abrir modales de datos complementarios
  const handleOpenBarredores = (planillaId) => {
    setPlanillaIdSeleccionada(planillaId);
    setPlanillaBarredoresOpen(true);
  };

  const handleCloseBarredores = () => {
    setPlanillaBarredoresOpen(false);
    setPlanillaIdSeleccionada(null);
  };

  const handleOpenMaquinas = (planillaId) => {
    setPlanillaIdMaquinas(planillaId);
    setPlanillaMaquinasOpen(true);
  };

  const handleCloseMaquinas = () => {
    setPlanillaMaquinasOpen(false);
    setPlanillaIdMaquinas(null);
  };

  const handleOpenPabellones = (planillaId) => {
    setPlanillaIdPabellones(planillaId);
    setPlanillaPabellonesOpen(true);
  };

  const handleClosePabellones = () => {
    setPlanillaPabellonesOpen(false);
    setPlanillaIdPabellones(null);
  };

  const handleOpenDanos = (planillaId) => {
    setPlanillaIdDanos(planillaId);
    setPlanillaDanosOpen(true);
  };

  const handleCloseDanos = () => {
    setPlanillaDanosOpen(false);
    setPlanillaIdDanos(null);
  };

  // Funciones de utilidad
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'ACTIVA': return 'info';
      case 'COMPLETADA': return 'success';
      case 'CANCELADA': return 'error';
      default: return 'default';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'ACTIVA': return 'Activa';
      case 'COMPLETADA': return 'Completada';
      case 'CANCELADA': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  // Filtrar planillas
  const planillasFiltradas = planillas.filter(planilla => {
    // Filtro por texto de supervisor
    const matchesFiltroSupervisor = !filtroSupervisor || 
      planilla.supervisor_nombre?.toLowerCase().includes(filtroSupervisor.toLowerCase());
    
    // Filtro por select de supervisor
    const matchesSupervisorSelect = !filtroSupervisorSelect || 
      planilla.supervisor_id === parseInt(filtroSupervisorSelect);
    
    // Filtro por estado
    const matchesEstado = !filtroEstado || 
      planilla.estado === filtroEstado;
    
    return matchesFiltroSupervisor && matchesSupervisorSelect && matchesEstado;
  });

  // Paginar planillas
  const planillasPaginadas = planillasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#333' }}>
            Listado de Planillas de Producción
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          {/* Controles de actualización */}
          <Tooltip title="Actualizar datos">
            <IconButton onClick={manualRefresh} disabled={isRefreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={autoRefreshEnabled ? 'Desactivar auto-refresh' : 'Activar auto-refresh'}>
            <IconButton onClick={toggleAutoRefresh} color={autoRefreshEnabled ? 'success' : 'default'}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ 
              bgcolor: '#20B2AA',
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              padding: '12px 24px',
              border: '2px solid #20B2AA',
              boxShadow: '0 2px 8px rgba(32, 178, 170, 0.3)',
              '&:hover': { 
                bgcolor: '#1a9a94',
                borderColor: '#1a9a94',
                boxShadow: '0 4px 12px rgba(32, 178, 170, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            ➕ Agregar Planilla
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar por supervisor..."
              value={filtroSupervisor}
              onChange={(e) => setFiltroSupervisor(e.target.value)}
              label="🔍 Buscar Supervisor"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f8f9fa',
                  minHeight: '64px',
                  fontSize: '1.1rem',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                    borderWidth: '3px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#20B2AA',
                    borderWidth: '3px'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#20B2AA',
                    borderWidth: '3px'
                  },
                  '& input': {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: '#333',
                    padding: '16px 14px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#333'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
                👥 Filtrar por Supervisor
              </InputLabel>
              <Select
                value={filtroSupervisorSelect}
                onChange={(e) => setFiltroSupervisorSelect(e.target.value)}
                label="👥 Filtrar por Supervisor"
                sx={{
                  borderRadius: '10px',
                  backgroundColor: '#f8f9fa',
                  minHeight: '64px',
                  fontSize: '1.1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                    borderWidth: '3px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20B2AA',
                    borderWidth: '3px'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20B2AA',
                    borderWidth: '3px'
                  },
                  '& .MuiSelect-select': {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: '#333',
                    padding: '16px 14px'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  👥 Todos los supervisores
                </MenuItem>
                {supervisores.map(supervisor => (
                  <MenuItem key={supervisor.id} value={supervisor.id} sx={{ fontSize: '1rem' }}>
                    👤 {supervisor.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
                📋 Filtrar por Estado
              </InputLabel>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                label="📋 Filtrar por Estado"
                sx={{
                  borderRadius: '10px',
                  backgroundColor: '#f8f9fa',
                  minHeight: '64px',
                  fontSize: '1.1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                    borderWidth: '3px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20B2AA',
                    borderWidth: '3px'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#20B2AA',
                    borderWidth: '3px'
                  },
                  '& .MuiSelect-select': {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: '#333',
                    padding: '16px 14px'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  📋 Todos los estados
                </MenuItem>
                <MenuItem value="PENDIENTE" sx={{ fontSize: '1rem' }}>
                  ⏳ Pendiente
                </MenuItem>
                <MenuItem value="ACTIVA" sx={{ fontSize: '1rem' }}>
                  ▶️ Activa
                </MenuItem>
                <MenuItem value="COMPLETADA" sx={{ fontSize: '1rem' }}>
                  ✅ Completada
                </MenuItem>
                <MenuItem value="CANCELADA" sx={{ fontSize: '1rem' }}>
                  ❌ Cancelada
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setFiltroSupervisor('');
                setFiltroSupervisorSelect('');
                setFiltroEstado('');
                setPage(0);
              }}
              fullWidth
              sx={{
                borderRadius: '10px',
                borderColor: '#e0e0e0',
                borderWidth: '3px',
                color: '#666',
                minHeight: '64px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#20B2AA',
                  backgroundColor: '#f0f9f8',
                  color: '#20B2AA',
                  transform: 'scale(1.02)'
                }
              }}
            >
              🗑️ Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
        
        {/* Contador de resultados */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Mostrando {planillasPaginadas.length} de {planillasFiltradas.length} planillas
            {planillasFiltradas.length !== planillas.length && (
              <span> (filtradas de {planillas.length} total)</span>
            )}
          </Typography>
          
          {(filtroSupervisor || filtroSupervisorSelect || filtroEstado) && (
            <Chip
              label="Filtros activos"
              color="primary"
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
      </Box>

      {/* Tabla */}
      <Paper sx={{ overflow: 'hidden', borderRadius: '8px' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Supervisor</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Sector</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>MT2 Sector</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Cant. Pabellones</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Pabellones Limpiados</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Fecha Inicio</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Fecha Fin</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Nro. Ticket</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planillasPaginadas.map(planilla => (
                <TableRow key={planilla.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{planilla.id}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{planilla.supervisor_nombre || 'Sin asignar'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{planilla.sector_nombre || 'Sin sector'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {planilla.mt2_sector ? `${parseFloat(planilla.mt2_sector).toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {planilla.pabellones_total || planilla.cantidad_pabellones || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {planilla.pabellones_limpiados || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {planilla.fecha_inicio?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {planilla.fecha_termino?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {planilla.ticket || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    <Chip 
                      label={getEstadoText(planilla.estado)} 
                      color={getEstadoColor(planilla.estado)} 
                      size="small"
                      sx={{ 
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
                      <IconButton 
                        size="medium" 
                        onClick={() => handleOpenModal(planilla)}
                        sx={{ 
                          color: '#20B2AA',
                          backgroundColor: '#f0f9f8',
                          border: '2px solid #e0f2f1',
                          width: '40px',
                          height: '40px',
                          '&:hover': { 
                            backgroundColor: '#e0f2f1',
                            borderColor: '#20B2AA',
                            transform: 'scale(1.05)'
                          }
                        }}
                        title="Editar planilla"
                      >
                        <EditIcon fontSize="medium" />
                      </IconButton>
                      <IconButton 
                        size="medium" 
                        onClick={() => handleDelete(planilla.id)}
                        sx={{ 
                          color: '#d32f2f',
                          backgroundColor: '#ffebee',
                          border: '2px solid #ffcdd2',
                          width: '40px',
                          height: '40px',
                          '&:hover': { 
                            backgroundColor: '#ffcdd2',
                            borderColor: '#d32f2f',
                            transform: 'scale(1.05)'
                          }
                        }}
                        title="Eliminar planilla"
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                      
                      {planilla.estado === 'PENDIENTE' && (
                        <IconButton 
                          size="medium" 
                          onClick={() => handleMarcarActiva(planilla)}
                          sx={{ 
                            color: '#4caf50',
                            backgroundColor: '#e8f5e8',
                            border: '2px solid #c8e6c9',
                            width: '40px',
                            height: '40px',
                            '&:hover': { 
                              backgroundColor: '#c8e6c9',
                              borderColor: '#4caf50',
                              transform: 'scale(1.05)'
                            }
                          }}
                          title="Marcar como activa"
                        >
                          <CheckCircleIcon fontSize="medium" />
                        </IconButton>
                      )}
                      
                      <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        <Button
                          size="medium"
                          variant="contained"
                          onClick={() => handleOpenBarredores(planilla.id)}
                          sx={{ 
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '8px',
                            textTransform: 'none',
                            minWidth: '90px',
                            height: '36px',
                            border: '2px solid #20B2AA',
                            '&:hover': { 
                              bgcolor: '#1a9a94',
                              borderColor: '#1a9a94',
                              transform: 'scale(1.02)'
                            }
                          }}
                          title="Gestionar barredores"
                        >
                          👥 Barredores
                        </Button>
                        <Button
                          size="medium"
                          variant="contained"
                          onClick={() => handleOpenMaquinas(planilla.id)}
                          sx={{ 
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '8px',
                            textTransform: 'none',
                            minWidth: '90px',
                            height: '36px',
                            border: '2px solid #20B2AA',
                            '&:hover': { 
                              bgcolor: '#1a9a94',
                              borderColor: '#1a9a94',
                              transform: 'scale(1.02)'
                            }
                          }}
                          title="Gestionar máquinas"
                        >
                          🚜 Máquinas
                        </Button>
                        <Button
                          size="medium"
                          variant="contained"
                          onClick={() => handleOpenPabellones(planilla.id)}
                          sx={{ 
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '8px',
                            textTransform: 'none',
                            minWidth: '90px',
                            height: '36px',
                            border: '2px solid #20B2AA',
                            '&:hover': { 
                              bgcolor: '#1a9a94',
                              borderColor: '#1a9a94',
                              transform: 'scale(1.02)'
                            }
                          }}
                          title="Gestionar pabellones"
                        >
                          🏢 Pabellones
                        </Button>
                        <Button
                          size="medium"
                          variant="contained"
                          onClick={() => handleOpenDanos(planilla.id)}
                          sx={{ 
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '8px',
                            textTransform: 'none',
                            minWidth: '90px',
                            height: '36px',
                            border: '2px solid #20B2AA',
                            '&:hover': { 
                              bgcolor: '#1a9a94',
                              borderColor: '#1a9a94',
                              transform: 'scale(1.02)'
                            }
                          }}
                          title="Gestionar daños"
                        >
                          ⚠️ Daños
                        </Button>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={planillasFiltradas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          sx={{
            borderTop: '1px solid #e0e0e0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem'
            }
          }}
        />
      </Paper>

      {/* Modal de planilla */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          pb: 2,
          mb: 0
        }}>
          {editingPlanilla ? 'Editar Planilla' : 'Agregar Planilla'}
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3, 
          overflow: 'auto',
          maxHeight: 'calc(90vh - 140px)'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Supervisor</InputLabel>
                <Select
                  value={formData.supervisor}
                  onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                  label="Supervisor"
                >
                  {supervisores.map(supervisor => (
                    <MenuItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.nombre}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Seleccione el supervisor responsable de la planilla.</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Zona</InputLabel>
                <Select
                  value={formData.zona_id}
                  onChange={(e) => setFormData({...formData, zona_id: e.target.value})}
                  label="Zona"
                  disabled={!formData.supervisor}
                >
                  {zonas.map(zona => (
                    <MenuItem key={zona.id} value={zona.id}>
                      {zona.nombre}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Seleccione la zona correspondiente.</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select
                  value={formData.sector_id}
                  onChange={async (e) => {
                    const sectorId = e.target.value;
                    setFormData(prev => ({
                      ...prev, 
                      sector_id: sectorId, 
                      pabellones_total: '', 
                      pabellones_limpiados: ''
                    }));
                    
                    // Cargar la cantidad de pabellones predeterminada del sector
                    if (sectorId) {
                      try {
                        const sectorRes = await axios.get(`/sectores/${sectorId}`);
                        const cantidadPabellones = sectorRes.data.cantidad_pabellones || 0;
                        setFormData(prev => ({
                          ...prev, 
                          sector_id: sectorId, 
                          pabellones_total: cantidadPabellones.toString()
                        }));
                      } catch (error) {
                        console.error('Error cargando datos del sector:', error);
                        // En caso de error, establecer un valor por defecto
                        setFormData(prev => ({
                          ...prev, 
                          sector_id: sectorId, 
                          pabellones_total: '0'
                        }));
                      }
                    }
                  }}
                  label="Sector"
                  disabled={!formData.zona_id}
                >
                  {sectores.map(sector => (
                    <MenuItem key={sector.id} value={sector.id}>
                      {sector.nombre}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Seleccione el sector dentro de la zona.</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cantidad de Pabellones"
                type="number"
                value={formData.pabellones_total || ''}
                InputLabelProps={{ shrink: true }}
                helperText="Cantidad de pabellones predeterminada del sector (no editable)."
                disabled={true}
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: '#f5f5f5',
                    color: '#666'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pabellones Trabajados"
                type="number"
                value={formData.pabellones_limpiados || ''}
                onChange={(e) => {
                  const value = validateNumericInput(e.target.value, 'integer');
                  const maxPabellones = parseInt(formData.pabellones_total) || 0;
                  
                  // Validar que no exceda la cantidad de pabellones del sector
                  if (value > maxPabellones) {
                    setError(`No puede exceder la cantidad de pabellones del sector (${maxPabellones})`);
                    return;
                  }
                  
                  // Validar que no sea menor a 1
                  if (value < 1 && value !== '') {
                    setError('Debe ser al menos 1');
                    return;
                  }
                  
                  setError('');
                  setFormData(prev => ({...prev, pabellones_limpiados: value}));
                }}
                InputLabelProps={{ shrink: true }}
                helperText={`Cantidad de pabellones en los que se trabajó (máximo: ${formData.pabellones_total || 0})`}
                disabled={!formData.pabellones_total || parseInt(formData.pabellones_total) === 0}
                inputProps={{
                  min: 1,
                  max: formData.pabellones_total || 999
                }}
                error={!!error && error.includes('pabellones')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nro. Ticket"
                value={formData.nro_ticket || ''}
                onChange={(e) => setFormData(prev => ({...prev, nro_ticket: e.target.value}))}
                helperText="Número de ticket asociado a la planilla."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                type="date"
                value={formData.fecha_inicio || ''}
                onChange={(e) => setFormData(prev => ({...prev, fecha_inicio: e.target.value}))}
                InputLabelProps={{ shrink: true }}
                helperText="Seleccione la fecha de inicio de la planilla."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha Término"
                type="date"
                value={formData.fecha_termino || ''}
                onChange={(e) => setFormData(prev => ({...prev, fecha_termino: e.target.value}))}
                InputLabelProps={{ shrink: true }}
                helperText="Seleccione la fecha de término de la planilla."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || 'PENDIENTE'}
                  onChange={(e) => setFormData(prev => ({...prev, estado: e.target.value}))}
                  label="Estado"
                >
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="ACTIVA">Activa</MenuItem>
                  <MenuItem value="COMPLETADA">Completada</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                </Select>
                <FormHelperText>Seleccione el estado de la planilla.</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observación"
                multiline
                rows={4}
                value={formData.observacion || ''}
                onChange={(e) => setFormData(prev => ({...prev, observacion: e.target.value}))}
                helperText="Ingrese cualquier observación adicional."
              />
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => setOpenModal(false)}
            variant="outlined"
            sx={{ 
              color: '#666', 
              borderColor: '#ccc',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 500,
              padding: '10px 20px',
              borderWidth: '2px',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5',
                color: '#333'
              }
            }}
          >
            ❌ Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{ 
              bgcolor: '#20B2AA',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              padding: '10px 24px',
              border: '2px solid #20B2AA',
              boxShadow: '0 2px 8px rgba(32, 178, 170, 0.3)',
              '&:hover': { 
                bgcolor: '#1a9a94',
                borderColor: '#1a9a94',
                boxShadow: '0 4px 12px rgba(32, 178, 170, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            💾 Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modales de datos complementarios */}
      {planillaBarredoresOpen && (
        <Dialog 
          open={planillaBarredoresOpen} 
          onClose={handleCloseBarredores}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Datos de Barredores - Planilla #{planillaIdSeleccionada}</DialogTitle>
          <DialogContent>
            <PlanillaBarredores planillaId={planillaIdSeleccionada} />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseBarredores}
              variant="contained"
              sx={{ 
                bgcolor: '#20B2AA',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 500,
                padding: '10px 20px',
                border: '2px solid #20B2AA',
                '&:hover': { 
                  bgcolor: '#1a9a94',
                  borderColor: '#1a9a94'
                }
              }}
            >
              🔒 Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {planillaMaquinasOpen && (
        <Dialog 
          open={planillaMaquinasOpen} 
          onClose={handleCloseMaquinas}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Datos de Máquinas - Planilla #{planillaIdMaquinas}</DialogTitle>
          <DialogContent>
            <PlanillaMaquinas planillaId={planillaIdMaquinas} />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseMaquinas}
              variant="contained"
              sx={{ 
                bgcolor: '#20B2AA',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 500,
                padding: '10px 20px',
                border: '2px solid #20B2AA',
                '&:hover': { 
                  bgcolor: '#1a9a94',
                  borderColor: '#1a9a94'
                }
              }}
            >
              🔒 Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {planillaPabellonesOpen && (
        <Dialog 
          open={planillaPabellonesOpen} 
          onClose={handleClosePabellones}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Datos de Pabellones - Planilla #{planillaIdPabellones}</DialogTitle>
          <DialogContent>
            <PlanillaPabellones planillaId={planillaIdPabellones} />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleClosePabellones}
              variant="contained"
              sx={{ 
                bgcolor: '#20B2AA',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 500,
                padding: '10px 20px',
                border: '2px solid #20B2AA',
                '&:hover': { 
                  bgcolor: '#1a9a94',
                  borderColor: '#1a9a94'
                }
              }}
            >
              🔒 Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {planillaDanosOpen && (
        <Dialog 
          open={planillaDanosOpen} 
          onClose={handleCloseDanos}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Datos de Daños - Planilla #{planillaIdDanos}</DialogTitle>
          <DialogContent>
            <PlanillaDanos planillaId={planillaIdDanos} />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDanos}
              variant="contained"
              sx={{ 
                bgcolor: '#20B2AA',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 500,
                padding: '10px 20px',
                border: '2px solid #20B2AA',
                '&:hover': { 
                  bgcolor: '#1a9a94',
                  borderColor: '#1a9a94'
                }
              }}
            >
              🔒 Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
} 