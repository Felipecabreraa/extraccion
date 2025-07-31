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
import { Box, Typography, Card, CardContent } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const palette = [
  '#00bcd4', '#2196f3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#ff5722', '#607d8b', '#ffc107', '#8bc34a', '#f44336', '#3f51b5'
];

export default function BarChartKPI({ data, title, onBarClick, height = 400 }) {
  console.log('🔍 BarChartKPI recibió datos:', data);
  console.log('🔍 BarChartKPI - data.length:', data ? data.length : 'null');
  console.log('🔍 BarChartKPI - data[0]:', data && data.length > 0 ? data[0] : 'no data');
  
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
    // Para datos de máquinas (name/value)
    if (item.name) return item.name;
    // Para datos de meses (nombreMes)
    if (item.nombreMes) return item.nombreMes;
    // Para datos antiguos (label, mes, periodo)
    if (item.label) return item.label;
    if (item.mes) return item.mes;
    if (item.periodo) return item.periodo;
    // Para datos de zonas (zona)
    if (item.zona) return item.zona;
    // Para datos de tipos (tipo)
    if (item.tipo) return item.tipo;
    return 'N/A';
  });
  
  const values = data.map(item => {
    // Para datos de máquinas (name/value)
    if (item.value !== undefined) return item.value;
    // Para datos antiguos (cantidad, total)
    if (item.cantidad !== undefined) return item.cantidad;
    if (item.total !== undefined) return item.total;
    return 0;
  });
  
  console.log('🔍 BarChartKPI - labels:', labels);
  console.log('🔍 BarChartKPI - values:', values);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Daños',
        data: values,
        backgroundColor: palette.slice(0, labels.length),
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: palette.slice(0, labels.length).map(c => c + 'cc'),
        maxBarThickness: 48,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
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
            label: (ctx) => {
              // Detectar el tipo de datos basado en el contexto
              const isKilometros = title && (title.toLowerCase().includes('km') || 
                                           title.toLowerCase().includes('kilómetros') ||
                                           title.toLowerCase().includes('recorridos'));
              
              const isPetroleo = title && (title.toLowerCase().includes('petróleo') || 
                                          title.toLowerCase().includes('consumo')) &&
                                !isKilometros; // Excluir si es kilómetros
              
              // Log para debugging
              console.log('🔍 BarChartKPI Tooltip Debug:', {
                title: title,
                isKilometros: isKilometros,
                isPetroleo: isPetroleo,
                label: ctx.chart.data.labels[ctx.dataIndex],
                value: ctx.parsed.y,
                result: isKilometros ? ` ${ctx.parsed.y.toLocaleString()} km` : 
                       isPetroleo ? ` ${ctx.parsed.y.toLocaleString()} L` : 
                       ` ${ctx.parsed.y} daños`
              });
              
              if (isKilometros) return ` ${ctx.parsed.y.toLocaleString()} km`;
              if (isPetroleo) return ` ${ctx.parsed.y.toLocaleString()} L`;
              return ` ${ctx.parsed.y} daños`;
            },
          },
          backgroundColor: '#222',
        titleColor: '#00bcd4',
        bodyColor: '#fff',
        borderColor: '#00bcd4',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutBounce'
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#222', font: { weight: 'bold' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e0e0e0', borderDash: [4, 4] },
        ticks: { color: '#222', font: { weight: 'bold' } }
      }
    },
    onClick: (evt, elements) => {
      if (elements.length && onBarClick) {
        const idx = elements[0].index;
        onBarClick(data[idx]);
      }
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