import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const TopOperadoresTable = ({ year = 2024, limit = 10 }) => {
  const [operadores, setOperadores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTopOperadores = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await axios.get(`/dashboard/danos/top-operadores?year=${year}&limit=${limit}`);
      setOperadores(response.data.operadores);
      setEstadisticas(response.data.estadisticas);
      setError(null);
    } catch (err) {
      console.error('Error fetching top operadores:', err);
      setError('Error al cargar el top de operadores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, limit]);

  useEffect(() => {
    fetchTopOperadores();
  }, [fetchTopOperadores]);

  const handleRefresh = () => {
    fetchTopOperadores(false);
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return '#FFD700'; // Oro
      case 2: return '#C0C0C0'; // Plata
      case 3: return '#CD7F32'; // Bronce
      default: return '#E0E0E0'; // Gris
    }
  };

  const getPositionIcon = (position) => {
    if (position <= 3) {
      return <TrophyIcon sx={{ color: getPositionColor(position) }} />;
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header con estadísticas */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" gutterBottom>
            🏆 Top {limit} Operadores con Más Daños - {year}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Basado en datos históricos de la tabla migracion_ordenes
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Estadísticas generales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                👷 {estadisticas.total_operadores_activos}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Operadores Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error">
                🔧 {estadisticas.total_danos_anio}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Daños {year}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info">
                📊 {estadisticas.promedio_danos_por_operador}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Promedio por Operador
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de operadores */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Posición</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Operador</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Total Daños</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Órdenes</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Promedio/Orden</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">% del Total</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Período</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No hay datos disponibles para el año {year}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              operadores.map((operador, index) => (
                <TableRow 
                  key={operador.nombre}
                  sx={{ 
                    '&:hover': { backgroundColor: 'action.hover' },
                    backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.05)' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getPositionIcon(operador.posicion)}
                      <Typography variant="body2" fontWeight="bold">
                        #{operador.posicion}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {operador.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={operador.total_danos}
                      color={operador.posicion <= 3 ? "error" : "default"}
                      variant={operador.posicion <= 3 ? "filled" : "outlined"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {operador.total_ordenes}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {operador.promedio_danos_por_orden}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${operador.porcentaje_del_total}%`}
                      color={parseFloat(operador.porcentaje_del_total) > 10 ? "warning" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`Primera: ${new Date(operador.primera_fecha).toLocaleDateString()}\nÚltima: ${new Date(operador.ultima_fecha).toLocaleDateString()}`}>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(operador.primera_fecha).toLocaleDateString()} - {new Date(operador.ultima_fecha).toLocaleDateString()}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Información adicional */}
      <Box mt={2}>
        <Typography variant="caption" color="textSecondary">
          💡 Los datos se basan en registros históricos del año {year}. 
          Los operadores están ordenados por cantidad total de daños registrados.
        </Typography>
      </Box>
    </Box>
  );
};

export default TopOperadoresTable; 