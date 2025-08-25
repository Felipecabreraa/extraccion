import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Chip, 
  Alert, 
  AlertTitle, 
  Tabs, 
  Tab, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  Event, 
  TrendingUp, 
  Warning, 
  CheckCircle, 
  Edit,
  Add,
  Upload,
  Delete
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import CargaMasivaDanos from '../components/CargaMasivaDanos';

// TabPanel component for Material-UI Tabs
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const DanosAcumulados = () => {
  const [datos, setDatos] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [showRegistroDialog, setShowRegistroDialog] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState(null);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    valor_real: '',
    valor_ppto: ''
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [showCargaMasiva, setShowCargaMasiva] = useState(false);

  // Colores para los gráficos
  const colors = {
    real: '#ef4444',      // Rojo
    ppto: '#3b82f6',      // Azul
    anioAnterior: '#f59e0b' // Naranja
  };

  // Función para formatear moneda
  const formatCurrency = (value) => {
    if (!value || value === 0) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Función para obtener nombre del mes
  const getMonthName = (month) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[month - 1] || 'Desconocido';
  };

  // Cargar datos principales
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando datos para año:', anioSeleccionado);
      
      const response = await api.get(`/danos-acumulados?anio=${anioSeleccionado}`);
      console.log('✅ Datos recibidos:', response.data);
      setDatos(response.data);
      
      // Cargar resumen ejecutivo
      const resumenResponse = await api.get(`/danos-acumulados/resumen-ejecutivo?anio=${anioSeleccionado}`);
      console.log('✅ Resumen recibido:', resumenResponse.data);
      setResumen(resumenResponse.data);
      
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError('Error al cargar los datos de daños acumulados');
    } finally {
      setLoading(false);
    }
  }, [anioSeleccionado]);

  // Crear/actualizar registro
  const crearRegistro = async () => {
    try {
      const response = await api.post('/danos-acumulados/registro', nuevoRegistro);
      
      if (response.data.success) {
        setShowRegistroDialog(false);
        setNuevoRegistro({
          anio: new Date().getFullYear(),
          mes: new Date().getMonth() + 1,
          valor_real: '',
          valor_ppto: ''
        });
        
        // Recargar datos
        await cargarDatos();
        
        // Mostrar mensaje de éxito
        alert('Registro creado/actualizado exitosamente');
      }
    } catch (err) {
      console.error('Error creando registro:', err);
      alert('Error al crear/actualizar el registro');
    }
  };

  // Editar registro existente
  const editarRegistro = (mes) => {
    setEditingRegistro({
      anio: anioSeleccionado,
      mes: mes.mes,
      valor_real: mes.valor_real || 0,
      valor_ppto: mes.valor_ppto || 0
    });
    setShowRegistroDialog(true);
  };

  // Guardar registro editado
  const guardarRegistroEditado = async () => {
    try {
      const response = await api.post('/danos-acumulados/registro', editingRegistro);
      
      if (response.data.success) {
        setShowRegistroDialog(false);
        setEditingRegistro(null);
        
        // Recargar datos
        await cargarDatos();
        
        // Mostrar mensaje de éxito
        alert('Registro actualizado exitosamente');
      }
    } catch (err) {
      console.error('Error actualizando registro:', err);
      alert('Error al actualizar el registro');
    }
  };

  // Eliminar registro
  const eliminarRegistro = async (mes) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el registro de ${mes.nombreMes}?`)) {
      return;
    }

    try {
      const response = await api.delete('/danos-acumulados/registro', {
        data: {
          anio: anioSeleccionado,
          mes: mes.mes
        }
      });
      
      if (response.data.success) {
        // Recargar datos
        await cargarDatos();
        
        // Mostrar mensaje de éxito
        alert('Registro eliminado exitosamente');
      }
    } catch (err) {
      console.error('Error eliminando registro:', err);
      alert('Error al eliminar el registro');
    }
  };

  // Calcular variación anual
  const calcularVariacion = async () => {
    try {
      const response = await api.post('/danos-acumulados/calcular-variacion', {
        anio_actual: anioSeleccionado,
        anio_anterior: anioSeleccionado - 1
      });
      
      alert(`Variación anual calculada: ${response.data.variacion.porcentual}% (${response.data.variacion.interpretacion})`);
    } catch (err) {
      console.error('Error calculando variación:', err);
      alert('Error al calcular la variación anual');
    }
  };

  // Cargar datos del año anterior
  const cargarAnioAnterior = async () => {
    try {
      const response = await api.post('/danos-acumulados/cargar-anio-anterior', {
        anio_origen: anioSeleccionado - 1,
        anio_destino: anioSeleccionado
      });
      
      if (response.data.success) {
        alert(`Datos del año anterior cargados exitosamente. ${response.data.data.registros_procesados} registros procesados.`);
        await cargarDatos();
      }
    } catch (err) {
      console.error('Error cargando año anterior:', err);
      alert('Error al cargar datos del año anterior');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [anioSeleccionado, cargarDatos]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Cargando datos de daños acumulados...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Box>
    );
  }

  // Preparar datos para gráficos
  const datosGrafico = datos?.datos_grafico || [];
  console.log('📊 Datos gráfico preparados:', datosGrafico);
  console.log('🔄 Ajuste dinámico:', datos?.ajuste_dinamico);
  
  // Filtrar datos para la línea roja (Real Acumulado) solo hasta el mes actual
  const mesLimiteReal = datos?.estado_datos?.mes_limite_real || 12;
  
  const datosLinea = datosGrafico.map((mes, index) => {
    const numeroMes = index + 1; // Enero = 1, Febrero = 2, etc.
    
    return {
      mes: mes.nombreMes,
      real: numeroMes <= mesLimiteReal ? mes.real_acumulado : undefined, // Solo mostrar hasta el mes actual
      ppto: mes.ppto_acumulado,
      anioAnterior: mes.anio_ant_acumulado
    };
  });
  
  console.log('📈 Datos línea preparados:', datosLinea);
  console.log('💰 KPIs actuales:', datos?.kpis);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Reporte de Daños Acumulados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análisis de valores monetarios por año
          </Typography>
          {datos?.estado_datos && (
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={datos.estado_datos.descripcion}
                color="primary"
                variant="outlined"
                size="small"
                icon={<Event />}
              />
            </Box>
          )}

        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl variant="outlined" size="small">
            <InputLabel id="anio-select-label">Año</InputLabel>
            <Select
              labelId="anio-select-label"
              value={anioSeleccionado.toString()}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
              label="Año"
            >
              {[2024, 2025, 2026].map(anio => (
                <MenuItem key={anio} value={anio}>{anio}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
                     <Dialog open={showRegistroDialog} onClose={() => {
             setShowRegistroDialog(false);
             setEditingRegistro(null);
           }} maxWidth="sm" fullWidth>
             <DialogTitle>
               {editingRegistro ? 'Editar Registro Mensual' : 'Crear Nuevo Registro Mensual'}
             </DialogTitle>
             <DialogContent>
               <Grid container spacing={2}>
                 <Grid item xs={6}>
                   <TextField
                     label="Año"
                     type="number"
                     fullWidth
                     value={editingRegistro ? editingRegistro.anio : nuevoRegistro.anio}
                     onChange={(e) => {
                       if (editingRegistro) {
                         setEditingRegistro({...editingRegistro, anio: parseInt(e.target.value)});
                       } else {
                         setNuevoRegistro({...nuevoRegistro, anio: parseInt(e.target.value)});
                       }
                     }}
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <FormControl fullWidth>
                     <InputLabel id="mes-select-label">Mes</InputLabel>
                     <Select
                       labelId="mes-select-label"
                       value={(editingRegistro ? editingRegistro.mes : nuevoRegistro.mes).toString()}
                       label="Mes"
                       onChange={(e) => {
                         if (editingRegistro) {
                           setEditingRegistro({...editingRegistro, mes: parseInt(e.target.value)});
                         } else {
                           setNuevoRegistro({...nuevoRegistro, mes: parseInt(e.target.value)});
                         }
                       }}
                     >
                       {Array.from({length: 12}, (_, i) => i + 1).map(mes => (
                         <MenuItem key={mes} value={mes}>{getMonthName(mes)}</MenuItem>
                       ))}
                     </Select>
                   </FormControl>
                 </Grid>
                 <Grid item xs={6}>
                   <TextField
                     label="Valor Real ($)"
                     type="number"
                     fullWidth
                     value={editingRegistro ? editingRegistro.valor_real : nuevoRegistro.valor_real}
                     onChange={(e) => {
                       if (editingRegistro) {
                         setEditingRegistro({...editingRegistro, valor_real: parseInt(e.target.value) || 0});
                       } else {
                         setNuevoRegistro({...nuevoRegistro, valor_real: e.target.value});
                       }
                     }}
                     helperText="Ingrese el valor en pesos chilenos"
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <TextField
                     label="Valor Presupuesto ($)"
                     type="number"
                     fullWidth
                     value={editingRegistro ? editingRegistro.valor_ppto : nuevoRegistro.valor_ppto}
                     onChange={(e) => {
                       if (editingRegistro) {
                         setEditingRegistro({...editingRegistro, valor_ppto: parseInt(e.target.value) || 0});
                       } else {
                         setNuevoRegistro({...nuevoRegistro, valor_ppto: e.target.value});
                       }
                     }}
                     helperText="Ingrese el valor en pesos chilenos"
                   />
                 </Grid>
               </Grid>
             </DialogContent>
             <DialogActions>
               <Button onClick={() => {
                 setShowRegistroDialog(false);
                 setEditingRegistro(null);
               }}>Cancelar</Button>
               <Button 
                 onClick={editingRegistro ? guardarRegistroEditado : crearRegistro} 
                 variant="contained"
                 color="primary"
               >
                 {editingRegistro ? 'Actualizar' : 'Guardar'}
               </Button>
             </DialogActions>
           </Dialog>
          <Button
            variant="contained"
            startIcon={<Event />}
            onClick={() => setShowRegistroDialog(true)}
          >
            Nuevo Registro
          </Button>
        </Box>
      </Box>

      {/* KPIs Principales */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Total Real Actual
              </Typography>
              <Typography variant="h4" component="p" color="error.main">
                {datos?.kpis?.total_real_actual_formateado || '$0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Año {anioSeleccionado}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Total Presupuesto
              </Typography>
              <Typography variant="h4" component="p" color="info.main">
                {datos?.kpis?.total_ppto_actual_formateado || '$0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Año {anioSeleccionado}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Total Año Anterior
              </Typography>
              <Typography variant="h4" component="p" color="warning.main">
                {datos?.kpis?.total_real_anterior_formateado || '$0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Año {anioSeleccionado - 1}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Variación Anual
              </Typography>
              <Typography variant="h4" component="p" color="success.main">
                {resumen?.variacion?.porcentual ? `${resumen.variacion.porcentual}%` : '0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {resumen?.variacion?.interpretacion || 'Sin datos'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Línea Acumulada" />
          <Tab label="Barras Mensuales" />
          <Tab label="Resumen Ejecutivo" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          <TabPanel value={currentTab} index={0}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Evolución Acumulada Mensual
                </Typography>
                                 {datos?.ajuste_dinamico && (
                   <Chip 
                     label={`Real hasta ${getMonthName(datos.ajuste_dinamico.mes_limite_real)} | Presupuesto completo`}
                     color="info"
                     variant="outlined"
                     size="small"
                   />
                 )}
                            </Box>
              
              {datos?.estado_datos && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>📊 Lógica de Datos:</strong> 
                    <br/>• <strong>Presupuesto:</strong> Fijo de $3M mensual hasta diciembre (total $36M)
                    <br/>• <strong>Real:</strong> Se extiende hasta {datos.estado_datos.nombre_mes_actual} (mes actual del calendario)
                    <br/>• <strong>Comportamiento:</strong> La línea roja se extiende hasta el mes actual, manteniendo el valor acumulado del mes anterior si no hay datos nuevos
                    <br/>• <strong>Actualización automática:</strong> El 1 de cada mes la línea se extiende automáticamente
                  </Typography>
                </Alert>
              )}
              
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={datosLinea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis 
                    tickFormatter={(value) => {
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(0)}M`;
                      } else if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}K`;
                      } else {
                        return `$${value}`;
                      }
                    }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="real" 
                    stroke={colors.real} 
                    strokeWidth={3}
                    name="Real Acumulado"
                    dot={{ fill: colors.real, strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ppto" 
                    stroke={colors.ppto} 
                    strokeWidth={3}
                    name="Presupuesto Acumulado"
                    dot={{ fill: colors.ppto, strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="anioAnterior" 
                    stroke={colors.anioAnterior} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Año Anterior"
                    dot={{ fill: colors.anioAnterior, strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
                  </TabPanel>

          <TabPanel value={currentTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Comparación Mensual
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosLinea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis 
                    tickFormatter={(value) => {
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(0)}M`;
                      } else if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}K`;
                      } else {
                        return `$${value}`;
                      }
                    }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="real" fill={colors.real} name="Real" />
                  <Bar dataKey="ppto" fill={colors.ppto} name="Presupuesto" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
                  </TabPanel>

          <TabPanel value={currentTab} index={2}>
          <Grid container spacing={2}>
            {/* Resumen Ejecutivo */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Resumen Ejecutivo
                  </Typography>
                  {resumen && resumen.resumen && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">Total Real Actual:</Typography>
                        <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                          {resumen.resumen?.total_real_actual_formateado || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">Total Presupuesto:</Typography>
                        <Typography variant="subtitle2" color="info.main" fontWeight="bold">
                          {resumen.resumen?.total_ppto_actual_formateado || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">Total Año Anterior:</Typography>
                        <Typography variant="subtitle2" color="warning.main" fontWeight="bold">
                          {resumen.resumen?.total_real_anterior_formateado || 'N/A'}
                        </Typography>
                      </Box>
                      
                      {resumen.variacion && (
                        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">Variación Anual:</Typography>
                            <Chip label={`${resumen.variacion?.porcentual || 0}%`} variant={resumen.variacion?.tipo === 'incremento' ? 'filled' : 'outlined'} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">{resumen.variacion?.interpretacion || 'No disponible'}</Typography>
                        </Box>
                      )}

                      {resumen.cumplimiento_presupuestario && (
                        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">Cumplimiento Presupuestario:</Typography>
                            <Chip label={`${resumen.cumplimiento_presupuestario?.porcentual || 0}%`} variant={resumen.cumplimiento_presupuestario?.tipo === 'sobre_presupuesto' ? 'filled' : 'outlined'} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">{resumen.cumplimiento_presupuestario?.interpretacion || 'No disponible'}</Typography>
                        </Box>
                      )}

                      {resumen.mes_mayor_dano && (
                        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Warning className="h-4 w-4 text-red-500" />
                            <Typography variant="subtitle2">Mes con Mayor Daño:</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {resumen.mes_mayor_dano.nombre_mes}: {resumen.mes_mayor_dano.valor_real_formateado}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Acciones */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Acciones del Sistema
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button 
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      onClick={calcularVariacion}
                      fullWidth
                    >
                      Calcular Variación Anual
                    </Button>
                    
                                         <Button 
                       variant="outlined"
                       startIcon={<Event />}
                       onClick={cargarAnioAnterior}
                       fullWidth
                     >
                      Cargar Año Anterior
                    </Button>
                  </Box>

                  <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Estado del Sistema</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Typography variant="body2">
                          Datos reales hasta: {datos?.ajuste_dinamico ? getMonthName(datos.ajuste_dinamico.mes_limite_real) : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Typography variant="body2">
                          Ajuste dinámico: {datos?.ajuste_dinamico?.es_anio_actual ? 'Activo' : 'Completo'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Typography variant="body2">Cálculos automáticos: Funcionando</Typography>
                      </Box>
                      {datos?.ajuste_dinamico && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Event className="h-4 w-4 text-blue-500" />
                          <Typography variant="body2" color="text.secondary">
                            {datos.ajuste_dinamico.descripcion}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
                  </TabPanel>
        </Box>
      </Box>

             {/* Tabla de Datos Detallados */}
       <Card>
         <CardContent>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
             <Typography variant="h6" component="h2">
               Datos Detallados por Mes
             </Typography>
             <Box sx={{ display: 'flex', gap: 1 }}>
               <Button
                 variant="outlined"
                 startIcon={<Add />}
                 onClick={() => {
                   setEditingRegistro(null);
                   setShowRegistroDialog(true);
                 }}
                 size="small"
               >
                 Agregar Registro
               </Button>
               <Button
                 variant="outlined"
                 startIcon={<Upload />}
                 onClick={() => setShowCargaMasiva(true)}
                 size="small"
                 color="secondary"
               >
                 Carga Masiva
               </Button>
             </Box>
           </Box>
           <TableContainer component={Paper}>
             <Table>
               <TableHead>
                 <TableRow>
                   <TableCell>Mes</TableCell>
                   <TableCell align="right">Valor Real</TableCell>
                   <TableCell align="right">Valor Presupuesto</TableCell>
                   <TableCell align="right">Real Acumulado</TableCell>
                   <TableCell align="right">Presupuesto Acumulado</TableCell>
                   <TableCell align="right">Año Anterior</TableCell>
                   <TableCell align="center">Acciones</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {datosGrafico.map((mes, index) => (
                   <TableRow key={index} hover>
                     <TableCell>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography variant="body2" fontWeight="medium">
                           {mes.nombreMes}
                         </Typography>
                                                   {datos?.ajuste_dinamico && (
                            <>
                              {mes.mes <= datos.ajuste_dinamico.mes_limite_real && mes.real_acumulado > 0 && (
                                <Chip 
                                  label="Real Cargado" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined"
                                />
                              )}
                              {mes.mes > datos.ajuste_dinamico.mes_limite_real && datos.ajuste_dinamico.es_anio_actual && (
                                <Chip 
                                  label="Real Pendiente" 
                                  size="small" 
                                  color="warning" 
                                  variant="outlined"
                                />
                              )}
                              {mes.ppto_acumulado > 0 && (
                                <Chip 
                                  label="Presupuesto Asignado" 
                                  size="small" 
                                  color="info" 
                                  variant="outlined"
                                />
                              )}
                            </>
                          )}
                       </Box>
                     </TableCell>
                     <TableCell align="right">
                       <Typography 
                         variant="body2" 
                         color="error.main"
                         fontWeight="medium"
                       >
                         {mes.valor_real_formateado}
                       </Typography>
                     </TableCell>
                     <TableCell align="right">
                       <Typography 
                         variant="body2" 
                         color="info.main"
                         fontWeight="medium"
                       >
                         {mes.valor_ppto_formateado}
                       </Typography>
                     </TableCell>
                     <TableCell align="right">
                       <Typography 
                         variant="body2" 
                         color="error.main"
                         fontWeight="bold"
                       >
                         {mes.real_acumulado_formateado}
                       </Typography>
                     </TableCell>
                     <TableCell align="right">
                       <Typography 
                         variant="body2" 
                         color="info.main"
                         fontWeight="bold"
                       >
                         {mes.ppto_acumulado_formateado}
                       </Typography>
                     </TableCell>
                     <TableCell align="right">
                       <Typography 
                         variant="body2" 
                         color="warning.main"
                       >
                         {mes.anio_ant_acumulado_formateado}
                       </Typography>
                     </TableCell>
                                           <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => editarRegistro(mes)}
                            color="primary"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => eliminarRegistro(mes)}
                            color="error"
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
                  </CardContent>
       </Card>

       {/* Componente de Carga Masiva */}
       <CargaMasivaDanos
         open={showCargaMasiva}
         onClose={() => setShowCargaMasiva(false)}
         onSuccess={() => {
           cargarDatos();
           alert('Datos cargados exitosamente');
         }}
       />
     </Box>
   );
 };

export default DanosAcumulados; 