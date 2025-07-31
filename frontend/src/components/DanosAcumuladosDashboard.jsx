import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip, 
  Alert, 
  AlertTitle,
  Box,
  Grid
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  Warning, 
  CheckCircle, 
  Event 
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DanosAcumuladosDashboard = () => {
  const [datos, setDatos] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  // Colores para gráficos
  const colors = {
    real: '#ef4444',
    ppto: '#3b82f6',
    anioAnterior: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
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

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [datosResponse, resumenResponse] = await Promise.all([
        axios.get(`/api/danos-acumulados?anio=${anioSeleccionado}`),
        axios.get(`/api/danos-acumulados/resumen-ejecutivo?anio=${anioSeleccionado}`)
      ]);
      
      setDatos(datosResponse.data);
      setResumen(resumenResponse.data);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos de daños acumulados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [anioSeleccionado]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Warning className="h-4 w-4" />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
    );
  }

  // Preparar datos para gráficos
  const datosGrafico = datos?.datos_grafico || [];
  const datosLinea = datosGrafico.map(mes => ({
    mes: mes.nombreMes,
    real: mes.real_acumulado,
    ppto: mes.ppto_acumulado,
    anioAnterior: mes.anio_ant_acumulado
  }));

  // Datos para gráfico de pie (distribución)
  const datosPie = [
    { name: 'Real', value: datos?.kpis?.total_real_actual || 0, color: colors.real },
    { name: 'Presupuesto', value: datos?.kpis?.total_ppto_actual || 0, color: colors.ppto }
  ];

  // Calcular tendencias
  const calcularTendencia = () => {
    if (!resumen?.variacion?.porcentual) return 'neutral';
    return resumen.variacion.porcentual > 0 ? 'up' : resumen.variacion.porcentual < 0 ? 'down' : 'neutral';
  };

  const tendencia = calcularTendencia();

  return (
    <div className="space-y-6">
      {/* Header con selector de año */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h5" component="h2" className="text-gray-900">Dashboard Daños Acumulados</Typography>
          <Typography variant="body2" className="text-gray-600">Año {anioSeleccionado}</Typography>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setAnioSeleccionado(anioSeleccionado - 1)}
          >
            {anioSeleccionado - 1}
          </Button>
          <Button size="small">
            {anioSeleccionado}
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setAnioSeleccionado(anioSeleccionado + 1)}
          >
            {anioSeleccionado + 1}
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" component="h3" className="text-sm font-medium">Total Real</Typography>
                <AttachMoney className="h-4 w-4 text-red-500" />
              </Box>
              <Typography variant="h4" component="div" className="text-red-600">
                {datos?.kpis?.total_real_actual_formateado || '$0'}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Valor acumulado actual
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" component="h3" className="text-sm font-medium">Presupuesto</Typography>
                <AttachMoney className="h-4 w-4 text-blue-500" />
              </Box>
              <Typography variant="h4" component="div" className="text-blue-600">
                {datos?.kpis?.total_ppto_actual_formateado || '$0'}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Presupuesto asignado
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" component="h3" className="text-sm font-medium">Año Anterior</Typography>
                <AttachMoney className="h-4 w-4 text-orange-500" />
              </Box>
              <Typography variant="h4" component="div" className="text-orange-600">
                {datos?.kpis?.total_real_anterior_formateado || '$0'}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Comparación base
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" component="h3" className="text-sm font-medium">Variación</Typography>
                {tendencia === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : tendencia === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </Box>
              <Typography variant="h4" component="div" className={`text-2xl font-bold ${
                tendencia === 'up' ? 'text-red-600' : 
                tendencia === 'down' ? 'text-green-600' : 
                'text-gray-600'
              }`}>
                {resumen?.variacion?.porcentual ? `${resumen.variacion.porcentual}%` : '0%'}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                {resumen?.variacion?.interpretacion || 'Sin variación'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={2}>
        {/* Gráfico de línea */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3">Evolución Acumulada</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosLinea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
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
                    name="Real"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ppto" 
                    stroke={colors.ppto} 
                    strokeWidth={3}
                    name="Presupuesto"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="anioAnterior" 
                    stroke={colors.anioAnterior} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Año Anterior"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de pie */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3">Distribución Real vs Presupuesto</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosPie}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {datosPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas y Estado */}
      <Grid container spacing={2}>
        {/* Alertas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3">Alertas del Sistema</Typography>
              <Box sx={{ mt: 2 }}>
                {resumen?.variacion?.porcentual > 20 && (
                  <Alert severity="error">
                    <Warning className="h-4 w-4" />
                    <AlertTitle>Variación anual alta: {resumen.variacion.porcentual}% - Requiere atención</AlertTitle>
                  </Alert>
                )}
                
                {resumen?.cumplimiento_presupuestario?.porcentual > 10 && (
                  <Alert severity="error">
                    <Warning className="h-4 w-4" />
                    <AlertTitle>Sobre presupuesto: {resumen.cumplimiento_presupuestario.porcentual}% - Revisar gastos</AlertTitle>
                  </Alert>
                )}

                                 {resumen?.mes_mayor_dano && (
                   <Alert>
                     <Event className="h-4 w-4" />
                     <AlertTitle>
                       Mes con mayor daño: {resumen.mes_mayor_dano.nombre_mes} ({resumen.mes_mayor_dano.valor_real_formateado})
                     </AlertTitle>
                   </Alert>
                 )}

                {(!resumen?.variacion?.porcentual || resumen.variacion.porcentual <= 20) && 
                 (!resumen?.cumplimiento_presupuestario?.porcentual || resumen.cumplimiento_presupuestario.porcentual <= 10) && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>
                      Sistema funcionando normalmente - Sin alertas críticas
                    </AlertTitle>
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado del Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3">Estado del Sistema</Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" className="text-sm font-medium">Datos Cargados:</Typography>
                  <Chip label={datos?.datos_grafico?.filter(d => d.real_acumulado > 0).length || 0} variant="outlined" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" className="text-sm font-medium">Vista Acumulados:</Typography>
                  <Chip label="Activa" variant="outlined" className="bg-green-100 text-green-800" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" className="text-sm font-medium">Cálculos Automáticos:</Typography>
                  <Chip label="Funcionando" variant="outlined" className="bg-green-100 text-green-800" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" className="text-sm font-medium">Última Actualización:</Typography>
                  <Chip label={new Date().toLocaleDateString('es-CL')} variant="outlined" />
                </Box>
              </Box>

              <Box sx={{ mt: 2, borderTop: '1px solid', pt: 2 }}>
                <Typography variant="body2" className="font-medium mb-1">Resumen Rápido</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Real:</Typography>
                  <Typography variant="body2" className="font-medium text-red-600">
                    {datos?.kpis?.total_real_actual_formateado || '$0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Presupuesto:</Typography>
                  <Typography variant="body2" className="font-medium text-blue-600">
                    {datos?.kpis?.total_ppto_actual_formateado || '$0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">Variación Anual:</Typography>
                  <Typography variant="body2" className={`font-medium ${
                    tendencia === 'up' ? 'text-red-600' : 
                    tendencia === 'down' ? 'text-green-600' : 
                    'text-gray-600'
                  }`}>
                    {resumen?.variacion?.porcentual ? `${resumen.variacion.porcentual}%` : '0%'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DanosAcumuladosDashboard; 