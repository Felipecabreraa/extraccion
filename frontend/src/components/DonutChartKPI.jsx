import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const palette = [
  '#00bcd4', '#ff9800', '#4caf50', '#e91e63', '#9c27b0', '#ff5722', '#607d8b', '#ffc107', '#8bc34a', '#f44336', '#3f51b5'
];

export default function DonutChartKPI({ data, title, height = 350 }) {
  console.log('🔍 DonutChartKPI recibió datos:', data);
  console.log('🔍 DonutChartKPI - data.length:', data ? data.length : 'null');
  console.log('🔍 DonutChartKPI - data[0]:', data && data.length > 0 ? data[0] : 'no data');
  
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

  // Manejar diferentes estructuras de datos
  const labels = data.map(item => {
    // Para datos de tipos (name/value)
    if (item.name) return item.name;
    // Para datos de zonas (zona)
    if (item.zona) return item.zona;
    // Para datos antiguos (label)
    if (item.label) return item.label;
    // Para datos de tipos (tipo)
    if (item.tipo) return item.tipo;
    return 'Sin datos';
  });
  
  const values = data.map(item => {
    // Para datos de tipos (name/value)
    if (item.value !== undefined) return item.value;
    // Para datos antiguos (cantidad, total)
    if (item.cantidad !== undefined) return item.cantidad;
    if (item.total !== undefined) return item.total;
    return 0;
  });
  
  console.log('🔍 DonutChartKPI - labels:', labels);
  console.log('🔍 DonutChartKPI - values:', values);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Daños',
        data: values,
        backgroundColor: palette.slice(0, labels.length),
        borderWidth: 2,
        hoverOffset: 16,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 16 } } },
      title: {
        display: true,
        text: title,
        font: { size: 20, weight: 'bold' },
        color: '#222',
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed} daños`
        }
      }
    },
    cutout: '70%',
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: 'easeOutBounce'
    }
  };

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 4, p: 2 }}>
      <CardContent>
        <Box height={height}>
          <Doughnut data={chartData} options={options} height={height} />
        </Box>
      </CardContent>
    </Card>
  );
} 