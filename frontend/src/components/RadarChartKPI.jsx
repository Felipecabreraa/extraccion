import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, Box, Typography } from '@mui/material';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChartKPI({ data, title, height = 350 }) {
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

  // data: [{ label, cantidad }]
  const labels = data.map(item => item.zona || item.tipo || item.label || 'N/A');
  const values = data.map(item => item.cantidad || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Daños',
        data: values,
        backgroundColor: 'rgba(0,188,212,0.2)',
        borderColor: '#00bcd4',
        pointBackgroundColor: '#00bcd4',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00bcd4',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 20, weight: 'bold' },
        color: '#222',
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed.r} daños`
        }
      }
    },
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        pointLabels: { font: { size: 16 } },
        grid: { color: '#e0e0e0' }
      }
    }
  };

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 4, p: 2 }}>
      <CardContent>
        <Box height={height}>
          <Radar data={chartData} options={options} height={height} />
        </Box>
      </CardContent>
    </Card>
  );
} 