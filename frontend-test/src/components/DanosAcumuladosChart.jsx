import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Card, CardContent } from '@mui/material';

const DanosAcumuladosChart = ({ data }) => {
  // Preparar datos para el gráfico
  const chartData = data?.datosMensuales?.map((mes, index) => {
    const mesData = {
      mes: mes.nombreMes,
      mesCorto: mes.nombreMes.substring(0, 3).toUpperCase() + '-25',
      danosPptoAc: mes.acumuladoMeta,
      danosRealAc: mes.tieneDatos ? mes.acumuladoReal : null,
      danosAnioAnt: mes.acumuladoAnioAnterior
    };
    return mesData;
  }) || [];

  // Configurar colores y estilos
  const colors = {
    ppto: '#1976d2', // Azul para presupuesto
    real: '#d32f2f', // Rojo para real
    anterior: '#f57c00' // Naranja para año anterior
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 600 }}>
          N° Daños Acumulados 2025 ( Real / Ppto )
        </Typography>
        
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mesCorto" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 'dataMax + 100']}
              />
              <Tooltip 
                formatter={(value, name) => {
                  const labels = {
                    danosPptoAc: 'Daños Ppto Ac',
                    danosRealAc: 'Daños Real Ac',
                    danosAnioAnt: 'Daños Año Ant.'
                  };
                  return [value, labels[name]];
                }}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => {
                  const labels = {
                    danosPptoAc: 'Daños Ppto Ac',
                    danosRealAc: 'Daños Real Ac',
                    danosAnioAnt: 'Daños Año Ant.'
                  };
                  return labels[value];
                }}
              />
              
              {/* Línea de Presupuesto Acumulado (Azul sólido) */}
              <Line
                type="monotone"
                dataKey="danosPptoAc"
                stroke={colors.ppto}
                strokeWidth={3}
                dot={{ fill: colors.ppto, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="danosPptoAc"
              />
              
              {/* Línea de Real Acumulado (Rojo sólido) */}
              <Line
                type="monotone"
                dataKey="danosRealAc"
                stroke={colors.real}
                strokeWidth={3}
                dot={{ fill: colors.real, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="danosRealAc"
                connectNulls={false}
              />
              
              {/* Línea de Año Anterior (Naranja punteado) */}
              <Line
                type="monotone"
                dataKey="danosAnioAnt"
                stroke={colors.anterior}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: colors.anterior, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="danosAnioAnt"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Información adicional */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Leyenda:</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: colors.ppto }} />
              <Typography variant="caption">Daños Ppto Ac (Meta)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: colors.real }} />
              <Typography variant="caption">Daños Real Ac (Actual)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 3, bgcolor: colors.anterior, borderTop: `2px dashed ${colors.anterior}` }} />
              <Typography variant="caption">Daños Año Ant. (2024)</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DanosAcumuladosChart; 