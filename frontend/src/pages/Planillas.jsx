import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TablePagination, MenuItem, Grid, Chip, FormControl, InputLabel, Select, Alert, FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import PlanillaBarredores from './PlanillaBarredores';
import PlanillaMaquinas from './PlanillaMaquinas';
import PlanillaPabellones from './PlanillaPabellones';
import PlanillaDanos from './PlanillaDanos';

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
    nro_ticket: ''
  });
  const [filtroSupervisor, setFiltroSupervisor] = useState('');
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

  // Cargar planillas con filtros
  const fetchPlanillas = useCallback(async () => {
    try {
      const res = await axios.get('/planillas');
      setPlanillas(res.data);
    } catch (error) {
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

  useEffect(() => {
    fetchPlanillas();
    fetchSupervisores();
  }, [fetchPlanillas, fetchSupervisores]);

  // Cargar zonas al iniciar
  useEffect(() => {
    fetchZonas();
  }, [fetchZonas]);

  // Limpiar campos cuando cambie el supervisor (solo para nueva planilla)
  useEffect(() => {
    if (formData.supervisor && !editingPlanilla) {
      setFormData(f => ({ ...f, zona_id: '', sector_id: '', fecha_inicio: '', fecha_termino: '', nro_ticket: '' }));
    }
  }, [formData.supervisor, editingPlanilla]);

  // Select dependiente: sectores por zona
  useEffect(() => {
    if (formData.zona_id && !editingPlanilla) {
      // Solo limpiar si no estamos editando
      setFormData(f => ({ ...f, sector_id: '', fecha_inicio: '', fecha_termino: '', nro_ticket: '' }));
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
        setFormData(f => ({ ...f, fecha_inicio: sector.fecha_inicio, fecha_termino: sector.fecha_termino, nro_ticket: sector.ticket, zona_id: sector.zona_id }));
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
      setZonas([]);
      setSectores([]);
      setFormData({
        supervisor: '',
        zona_id: '',
        sector_id: '',
        fecha_inicio: '',
        fecha_termino: '',
        nro_ticket: '',
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

      // Preparar datos para enviar
      const planillaData = {
        supervisor_id: parseInt(formData.supervisor) || null,
        zona_id: formData.zona_id ? parseInt(formData.zona_id) : null,
        sector_id: parseInt(formData.sector_id) || null,
        fecha_inicio: formData.fecha_inicio,
        fecha_termino: formData.fecha_termino || null,
        ticket: formData.nro_ticket || null,
        estado: formData.estado || 'PENDIENTE',
        observacion: formData.observacion || null
      };

      // Validar que los IDs sean válidos
      if (!planillaData.supervisor_id || !planillaData.sector_id) {
        setError('Supervisor y Sector son obligatorios');
        return;
      }

      if (editingPlanilla) {
        await axios.put(`/planillas/${editingPlanilla}`, planillaData);
        setError('Planilla actualizada exitosamente');
      } else {
        await axios.post('/planillas', planillaData);
        setError('Planilla creada exitosamente');
      }
      setOpenModal(false);
      fetchPlanillas();
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
        fetchPlanillas();
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
      fetchPlanillas();
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
    const matchesFiltro = !filtroSupervisor || 
      planilla.supervisor_nombre?.toLowerCase().includes(filtroSupervisor.toLowerCase());
    
    return matchesFiltro;
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#333' }}>
          Listado de Planillas de Producción
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ 
            bgcolor: '#20B2AA',
            color: 'white',
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { bgcolor: '#1a9a94' }
          }}
        >
          + Agregar Planilla
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por supervisor, se..."
          value={filtroSupervisor}
          onChange={(e) => setFiltroSupervisor(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#e0e0e0'
              },
              '&:hover fieldset': {
                borderColor: '#ccc'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#20B2AA'
              }
            }
          }}
        />
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
                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenModal(planilla)}
                        sx={{ 
                          color: '#666',
                          '&:hover': { backgroundColor: '#f0f0f0' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(planilla.id)}
                        sx={{ 
                          color: '#d32f2f',
                          '&:hover': { backgroundColor: '#ffebee' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      
                      {planilla.estado === 'PENDIENTE' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleMarcarActiva(planilla)}
                          sx={{ 
                            color: '#4caf50',
                            '&:hover': { backgroundColor: '#e8f5e8' }
                          }}
                          title="Marcar como activa"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenBarredores(planilla.id)}
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '4px',
                            textTransform: 'none',
                            minWidth: '80px',
                            height: '28px',
                            '&:hover': { bgcolor: '#1a9a94' }
                          }}
                        >
                          Barredores
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenMaquinas(planilla.id)}
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '4px',
                            textTransform: 'none',
                            minWidth: '80px',
                            height: '28px',
                            '&:hover': { bgcolor: '#1a9a94' }
                          }}
                        >
                          Máquinas
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenPabellones(planilla.id)}
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '4px',
                            textTransform: 'none',
                            minWidth: '80px',
                            height: '28px',
                            '&:hover': { bgcolor: '#1a9a94' }
                          }}
                        >
                          Pabellones
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenDanos(planilla.id)}
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: '#20B2AA',
                            color: 'white',
                            borderRadius: '4px',
                            textTransform: 'none',
                            minWidth: '80px',
                            height: '28px',
                            '&:hover': { bgcolor: '#1a9a94' }
                          }}
                        >
                          Daños
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
                  onChange={(e) => setFormData({...formData, sector_id: e.target.value})}
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
                label="Fecha Inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                InputLabelProps={{ shrink: true }}
                helperText="Seleccione la fecha de inicio de la planilla."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha Término"
                type="date"
                value={formData.fecha_termino}
                onChange={(e) => setFormData({...formData, fecha_termino: e.target.value})}
                InputLabelProps={{ shrink: true }}
                helperText="Seleccione la fecha de término de la planilla."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
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
                value={formData.observacion}
                onChange={(e) => setFormData({...formData, observacion: e.target.value})}
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
            sx={{ color: '#666', borderColor: '#ccc' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{ 
              bgcolor: '#20B2AA',
              '&:hover': { bgcolor: '#1a9a94' }
            }}
          >
            Guardar
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
            <Button onClick={handleCloseBarredores}>Cerrar</Button>
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
            <Button onClick={handleCloseMaquinas}>Cerrar</Button>
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
            <Button onClick={handleClosePabellones}>Cerrar</Button>
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
            <Button onClick={handleCloseDanos}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
} 