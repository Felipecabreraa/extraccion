import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, Box, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StackedBarChartKPI({ data, title, height = 400 }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box height={height} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No hay datos disponibles</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // data: [{ mes, infraestructura, equipo }]
  const labels = data.map(item => item.nombreMes || item.mes || 'N/A');
  const infraestructura = data.map(item => item.infraestructura || 0);
  const equipo = data.map(item => item.equipo || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Infraestructura',
        data: infraestructura,
        backgroundColor: '#00bcd4',
        stack: 'Stack 0',
        borderRadius: 8,
      },
      {
        label: 'Equipo',
        data: equipo,
        backgroundColor: '#ff9800',
        stack: 'Stack 0',
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: title,
        font: { size: 20, weight: 'bold' },
        color: '#222',
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} daños`,
        }
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutBounce'
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, grid: { color: '#e0e0e0', borderDash: [4, 4] } }
    }
  };

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 4, p: 2 }}>
      <CardContent>
        <Box height={height}>
          <Bar data={chartData} options={options} height={height} />
        </Box>
      </CardContent>
    </Card>
  );
} 