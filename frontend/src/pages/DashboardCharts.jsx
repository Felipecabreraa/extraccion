import React, { useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent
} from '@mui/material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

export default function DashboardCharts({ metrics }) {
  // Memoizar configuración de gráficos
  const chartConfigs = useMemo(() => {
    if (!metrics) return {};

    const tendenciasData = {
      labels: metrics.charts?.tendenciasMensuales?.map(item => item.mes) || [],
      datasets: [
        {
          label: 'Planillas Completadas',
          data: metrics.charts?.tendenciasMensuales?.map(item => item.planillas) || [],
          borderColor: '#3ed6d6',
          backgroundColor: 'rgba(62, 214, 214, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'm² Procesados',
          data: metrics.charts?.tendenciasMensuales?.map(item => item.mts2) || [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    const rendimientoSectorData = {
      labels: metrics.charts?.rendimientoPorSector?.map(item => item.nombre) || [],
      datasets: [{
        label: 'm² Procesados',
        data: metrics.charts?.rendimientoPorSector?.map(item => item.mts2) || [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
      }]
    };

    const planillasEstadoData = {
      labels: ['Activas', 'Completadas', 'Pendientes', 'Canceladas'],
      datasets: [{
        data: [
          metrics.planillasActivas,
          metrics.planillasCompletadas,
          metrics.planillasPendientes,
          metrics.planillasCanceladas
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    };

    return {
      tendenciasData,
      rendimientoSectorData,
      planillasEstadoData
    };
  }, [metrics]);

  // Opciones comunes para gráficos
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  }), []);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  }), []);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  }), []);

  return (
            <Grid container spacing={3}>
          <Grid xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tendencias Mensuales
            </Typography>
            <Box height={300}>
              <Line 
                data={chartConfigs.tendenciasData}
                options={chartOptions}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

                <Grid xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estado de Planillas
            </Typography>
            <Box height={300}>
              <Doughnut 
                data={chartConfigs.planillasEstadoData}
                options={doughnutOptions}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rendimiento por Sector
            </Typography>
            <Box height={300}>
              <Bar 
                data={chartConfigs.rendimientoSectorData}
                options={barOptions}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
} 