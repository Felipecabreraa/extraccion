import React, { useState } from 'react';
import { Box, Typography, Paper, Select, MenuItem } from '@mui/material';
import CargaMasivaSectoresEditable from '../components/CargaMasivaSectores';
import CargaMasivaBarredores from '../components/CargaMasivaBarredores';
import CargaMasivaOperadores from '../components/CargaMasivaOperadores';
import CargaMasivaMaquinas from '../components/CargaMasivaMaquinas';

const ENTIDADES = [
  { value: 'sectores', label: 'Sectores' },
  { value: 'barredores', label: 'Barredores' },
  { value: 'operadores', label: 'Operadores' },
  { value: 'maquinas', label: 'Máquinas' }
];

export default function BulkUpload() {
  const [entidad, setEntidad] = useState('sectores');

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Carga Masiva</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Selecciona la entidad a cargar:</Typography>
        <Select value={entidad} onChange={e => setEntidad(e.target.value)} sx={{ minWidth: 200, ml: 2 }}>
          {ENTIDADES.map(e => (
            <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
          ))}
        </Select>
      </Paper>
      {entidad === 'sectores' && <CargaMasivaSectoresEditable />}
      {entidad === 'barredores' && <CargaMasivaBarredores />}
      {entidad === 'operadores' && <CargaMasivaOperadores />}
      {entidad === 'maquinas' && <CargaMasivaMaquinas />}
      {!['sectores', 'barredores', 'operadores', 'maquinas'].includes(entidad) && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="body1">Próximamente: Carga masiva para {ENTIDADES.find(e => e.value === entidad)?.label}</Typography>
        </Paper>
      )}
    </Box>
  );
} 