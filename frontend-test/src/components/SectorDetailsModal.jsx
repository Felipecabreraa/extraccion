import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { Circle, LocalGasStation } from '@mui/icons-material';

export default function SectorDetailsModal({ open, onClose, data, title }) {
  if (!data || data.length === 0) return null;

  // Determinar si es datos de petróleo basado en el título
  const isPetroleoData = title && (
    title.toLowerCase().includes('petróleo') || 
    title.toLowerCase().includes('petroleo') || 
    title.toLowerCase().includes('combustible') ||
    title.toLowerCase().includes('consumo')
  );

  // Calcular total y porcentajes
  const total = data.reduce((sum, item) => {
    const value = item.value !== undefined ? item.value : 
                  item.cantidad !== undefined ? item.cantidad : 
                  item.total !== undefined ? item.total :
                  item.litros !== undefined ? item.litros : 0;
    return sum + value;
  }, 0);

  const sortedData = data
    .map(item => {
      const label = item.name || item.zona || item.label || item.tipo || item.sector || 'Sin datos';
      const value = item.value !== undefined ? item.value : 
                    item.cantidad !== undefined ? item.cantidad : 
                    item.total !== undefined ? item.total :
                    item.litros !== undefined ? item.litros : 0;
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      
      return { label, value, percentage };
    })
    .sort((a, b) => b.value - a.value); // Ordenar por valor descendente

  const palette = [
    '#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', 
    '#6B7280', '#FCD34D', '#8BC34A', '#F44336', '#3F51B5', '#00BCD4'
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <LocalGasStation sx={{ fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title} - Detalles Completos
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Resumen general */}
        <Box mb={3} p={2} sx={{ 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)',
          borderRadius: 2,
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E40AF', mb: 1 }}>
            Resumen General
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3B82F6' }}>
                {total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isPetroleoData ? 'Total Litros' : 'Total'}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {data.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isPetroleoData ? 'Sectores' : 'Elementos'}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {(total / data.length).toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isPetroleoData ? 'Promedio L' : 'Promedio'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Lista detallada */}
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
          {isPetroleoData ? 'Consumo por Sector' : 'Detalle por Elemento'}
        </Typography>
        
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {sortedData.map((item, index) => (
            <ListItem 
              key={index}
              sx={{ 
                mb: 1,
                borderRadius: 2,
                background: index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.1)',
                  transform: 'translateX(4px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <ListItemIcon>
                <Circle sx={{ color: palette[index % palette.length], fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                      {item.label}
                    </Typography>
                    <Chip 
                      label={`${item.value.toLocaleString()}${isPetroleoData ? ' L' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: palette[index % palette.length],
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box mt={1}>
                    <Box 
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: '#e0e0e0',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          backgroundColor: palette[index % palette.length],
                          borderRadius: 4,
                          transition: 'width 1s ease-in-out'
                        }}
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Typography variant="caption" color="textSecondary">
                        {item.percentage}% del total
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {isPetroleoData ? 'Litros consumidos' : 'Valor'}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Estadísticas adicionales */}
        <Box mt={3} p={2} sx={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
          borderRadius: 2,
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#065F46', mb: 2 }}>
            Estadísticas Adicionales
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Mayor {isPetroleoData ? 'Consumo' : 'Valor'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {sortedData[0]?.label}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {sortedData[0]?.value.toLocaleString()}{isPetroleoData ? ' L' : ''}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Menor {isPetroleoData ? 'Consumo' : 'Valor'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                {sortedData[sortedData.length - 1]?.label}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {sortedData[sortedData.length - 1]?.value.toLocaleString()}{isPetroleoData ? ' L' : ''}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Diferencia
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {(sortedData[0]?.value - sortedData[sortedData.length - 1]?.value).toLocaleString()}{isPetroleoData ? ' L' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{ 
            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)'
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
} 