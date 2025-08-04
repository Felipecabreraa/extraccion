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
  Business as BusinessIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const TopSectoresTable = ({ year = 2025, limit = 5 }) => {
  const [sectores, setSectores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTopSectores = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await axios.get(`/dashboard/sectores/test-top?year=${year}&limit=${limit}`);
      setSectores(response.data.topSectores);
      setEstadisticas(response.data.estadisticas);
      setError(null);
    } catch (err) {
      console.error('Error fetching top sectores:', err);
      setError('Error al cargar el top de sectores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, limit]);

  useEffect(() => {
    fetchTopSectores();
  }, [fetchTopSectores]);

  const handleRefresh = () => {
    fetchTopSectores(false);
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

  const getEficienciaColor = (eficiencia) => {
    if (eficiencia >= 90) return 'success';
    if (eficiencia >= 75) return 'warning';
    return 'error';
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
            🏆 Top {limit} Sectores por Rendimiento - {year}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Basado en datos de la vista unificada vw_ordenes_2025_actual
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
                🏢 {estadisticas.totalSectores}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sectores Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success">
                🏗️ {estadisticas.totalPabellonesGlobal?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Pabellones
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info">
                📊 {estadisticas.eficienciaGlobal}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Eficiencia Global
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de sectores */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Posición</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sector</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Pabellones</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">m²</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Planillas</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Eficiencia</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">% Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No hay datos disponibles para el año {year}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sectores.map((sector, index) => (
                <TableRow 
                  key={sector.nombre}
                  sx={{ 
                    '&:hover': { backgroundColor: 'action.hover' },
                    backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.05)' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getPositionIcon(sector.posicion)}
                      <Typography variant="body2" fontWeight="bold">
                        #{sector.posicion}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BusinessIcon color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {sector.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={sector.pabellonesFormateado}
                      color={sector.posicion <= 3 ? "success" : "default"}
                      variant={sector.posicion <= 3 ? "filled" : "outlined"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {sector.mts2Formateado}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {sector.totalPlanillas}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={sector.eficienciaFormateada}
                      color={getEficienciaColor(sector.eficiencia)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${sector.porcentajePabellones}%`}
                      color={parseFloat(sector.porcentajePabellones) > 20 ? "warning" : "default"}
                      size="small"
                    />
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
          💡 Los datos se basan en registros del año {year}. 
          Los sectores están ordenados por cantidad total de pabellones procesados.
        </Typography>
      </Box>
    </Box>
  );
};

export default TopSectoresTable; 