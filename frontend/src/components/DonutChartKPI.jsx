import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import SectorDetailsModal from './SectorDetailsModal';

ChartJS.register(ArcElement, Tooltip, Legend);

// Paleta de colores mejorada y profesional para petróleo
const palette = [
  '#3B82F6', // Azul primario
  '#F59E0B', // Naranja
  '#10B981', // Verde
  '#EC4899', // Rosa
  '#8B5CF6', // Púrpura
  '#EF4444', // Rojo
  '#6B7280', // Gris
  '#FCD34D', // Amarillo
  '#8BC34A', // Verde claro
  '#F44336', // Rojo
  '#3F51B5', // Índigo
  '#00BCD4', // Cian
  '#795548', // Marrón
  '#9E9E9E', // Gris
  '#FFEB3B', // Amarillo claro
  '#673AB7', // Púrpura oscuro
  '#009688', // Verde azulado
  '#FF4081', // Rosa claro
  '#CDDC39', // Verde lima
  '#FF5722'  // Rojo oscuro
];

export default function DonutChartKPI({ data, title, height = 450, width = '100%' }) {
  const [modalOpen, setModalOpen] = useState(false);
  
  console.log('🔍 DonutChartKPI recibió datos:', data);
  console.log('🔍 DonutChartKPI - data.length:', data ? data.length : 'null');
  console.log('🔍 DonutChartKPI - data[0]:', data && data.length > 0 ? data[0] : 'no data');
  
  if (!data || data.length === 0) {
    return (
      <Card sx={{ 
        boxShadow: 3, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '1px solid #e0e0e0'
      }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              color: '#2c3e50',
              textAlign: 'center',
              mb: 2
            }}
          >
            {title}
          </Typography>
          <Box height={height} display="flex" alignItems="center" justifyContent="center">
            <Typography 
              color="textSecondary"
              sx={{ 
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: '#7f8c8d'
              }}
            >
              No hay datos disponibles
            </Typography>
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
    // Para datos de sectores (sector)
    if (item.sector) return item.sector;
    return 'Sin datos';
  });
  
  const values = data.map(item => {
    // Para datos de tipos (name/value)
    if (item.value !== undefined) return item.value;
    // Para datos antiguos (cantidad, total)
    if (item.cantidad !== undefined) return item.cantidad;
    if (item.total !== undefined) return item.total;
    // Para datos de litros (litros)
    if (item.litros !== undefined) return item.litros;
    return 0;
  });
  
  // Obtener colores de los datos si están disponibles
  const colors = data.map((item, index) => {
    // Si el item tiene color definido, usarlo
    if (item.color) return item.color;
    // Si no, usar la paleta por defecto
    return palette[index % palette.length];
  });
  
  console.log('🔍 DonutChartKPI - labels:', labels);
  console.log('🔍 DonutChartKPI - values:', values);
  console.log('🔍 DonutChartKPI - colors:', colors);

  // Función para truncar texto inteligentemente
  const truncateLabel = (label, maxLength = 15) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 3) + '...';
  };

  // Función para obtener el nombre completo en tooltip
  const getFullLabel = (label) => {
    return label;
  };

  // Determinar si es datos de petróleo basado en el título
  const isPetroleoData = title && (
    title.toLowerCase().includes('petróleo') || 
    title.toLowerCase().includes('petroleo') || 
    title.toLowerCase().includes('combustible') ||
    title.toLowerCase().includes('consumo')
  );

  const chartData = {
    labels: labels.map(label => truncateLabel(label)),
    datasets: [
      {
        label: isPetroleoData ? 'Litros' : 'Valores',
        data: values,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 20,
        hoverBorderWidth: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right', 
        align: 'center',
        labels: { 
          font: { 
            size: 16,
            weight: '500',
            family: "'Segoe UI', 'Roboto', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${getFullLabel(label)}: ${value.toLocaleString()}${isPetroleoData ? ' L' : ''} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.backgroundColor[i],
                  lineWidth: 0,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: { 
          size: 20, 
          weight: 'bold',
          family: "'Segoe UI', 'Roboto', sans-serif"
        },
        color: '#2c3e50',
        padding: { top: 20, bottom: 30 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return getFullLabel(labels[index]);
          },
          label: (ctx) => {
            const value = ctx.parsed;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const average = (total / ctx.dataset.data.length).toFixed(1);
            const difference = (value - average).toFixed(1);
            const status = value > average ? '↑' : value < average ? '↓' : '=';
            const unit = isPetroleoData ? ' L' : '';
            
            return [
              ` ${value.toLocaleString()}${unit} (${percentage}%)`,
              ` Promedio: ${average}${unit}`,
              ` Diferencia: ${difference}${unit} ${status}`
            ];
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      duration: 1500,
      easing: 'easeOutQuart'
    },
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: '#ffffff'
      }
    }
  };

  // Calcular estadísticas
  const total = values.reduce((sum, value) => sum + value, 0);
  const maxValue = Math.max(...values);
  const topSector = labels[values.indexOf(maxValue)];

  return (
    <>
      <Card sx={{ 
        boxShadow: 3, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '1px solid #e0e0e0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 3 }}>
          {/* Información del total en esquina superior izquierda */}
          <Box 
            position="absolute" 
            top={16} 
            left={16} 
            zIndex={10}
            sx={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(33, 150, 243, 0.2)',
              backdropFilter: 'blur(10px)',
              minWidth: '120px'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: '#2196F3',
                mb: 0.5,
                fontSize: '1.8rem',
                textAlign: 'center'
              }}
            >
              {total.toLocaleString()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#1976D2',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textAlign: 'center',
                mb: 0.5
              }}
            >
              {isPetroleoData ? 'Total Litros' : 'Total'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64B5F6',
                fontSize: '0.7rem',
                fontWeight: 500,
                textAlign: 'center',
                display: 'block'
              }}
            >
              {data.length} {isPetroleoData ? 'sectores' : 'elementos'}
            </Typography>
          </Box>

          <Box height={height} position="relative" display="flex" alignItems="center">
            <Box flex={1} position="relative">
              <Doughnut data={chartData} options={options} height={height} />
            </Box>
          </Box>
          
          {/* Información adicional mejorada */}
          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" flexDirection="column" alignItems="center" flex={1}>
              <Chip 
                label={isPetroleoData ? "Sector mayor consumo" : "Elemento más alto"}
                color="primary"
                variant="outlined"
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  borderColor: '#2196F3',
                  color: '#2196F3',
                  mb: 1,
                  fontSize: '0.9rem'
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: '#2c3e50',
                  textAlign: 'center',
                  maxWidth: '200px'
                }}
              >
                {topSector}
              </Typography>
            </Box>
            
            <Box display="flex" flexDirection="column" alignItems="center" flex={1}>
              <Chip 
                label={isPetroleoData ? "Consumo del sector" : "Valor máximo"}
                color="secondary"
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: '#FF5722',
                  color: 'white',
                  mb: 1,
                  fontSize: '0.9rem'
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#FF5722',
                  textAlign: 'center'
                }}
              >
                {maxValue.toLocaleString()}{isPetroleoData ? ' L' : ''}
              </Typography>
            </Box>
            
            <Box display="flex" flexDirection="column" alignItems="center" flex={1}>
              <Chip 
                label="Porcentaje"
                color="success"
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  mb: 1,
                  fontSize: '0.9rem'
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  textAlign: 'center'
                }}
              >
                {((maxValue / total) * 100).toFixed(1)}%
              </Typography>
            </Box>
            
            <Box display="flex" flexDirection="column" alignItems="center" flex={1}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#7f8c8d',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase'
                }}
              >
                Diferencia
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#f39c12',
                  textAlign: 'center'
                }}
              >
                {(maxValue - Math.min(...values)).toLocaleString()}{isPetroleoData ? ' L' : ''}
              </Typography>
            </Box>
          </Box>
          
          {/* Botón de información */}
          <Box mt={2} display="flex" justifyContent="center">
            <MuiTooltip title="Ver detalles completos">
              <IconButton
                onClick={() => setModalOpen(true)}
                sx={{
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3',
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  }
                }}
              >
                <Visibility />
              </IconButton>
            </MuiTooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <SectorDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
        title={title}
      />
    </>
  );
} 