import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import {
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import TopSectoresTable from '../components/TopSectoresTable';

const TopSectores = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedLimit, setSelectedLimit] = useState(5);

  const years = [2024, 2025];
  const limits = [5, 10, 15];

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Top Sectores por Rendimiento
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Análisis detallado de los sectores con mejor rendimiento operacional
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Año</InputLabel>
                <Select
                  value={selectedYear}
                  label="Año"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Límite</InputLabel>
                <Select
                  value={selectedLimit}
                  label="Límite"
                  onChange={(e) => setSelectedLimit(e.target.value)}
                >
                  {limits.map((limit) => (
                    <MenuItem key={limit} value={limit}>
                      Top {limit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Información adicional */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" color="primary">
                      Rendimiento Operacional
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Análisis basado en pabellones procesados, eficiencia y planillas completadas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AssessmentIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" color="success">
                      Métricas Clave
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pabellones, m², planillas, eficiencia y porcentaje del total
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <BusinessIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" color="info">
                      Datos Actualizados
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Información en tiempo real desde la vista unificada
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de sectores */}
        <TopSectoresTable year={selectedYear} limit={selectedLimit} />
      </Box>
    </Container>
  );
};

export default TopSectores; 