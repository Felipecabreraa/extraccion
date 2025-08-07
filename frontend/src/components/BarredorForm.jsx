import React, { useState } from 'react';
import { Button, MenuItem, TextField, Grid, Box, Typography } from '@mui/material';

export default function BarredorForm({ planillaId, barredoresDisponibles, onAdd }) {
  const [barredorId, setBarredorId] = useState('');
  const [dias, setDias] = useState('');
  const [horas, setHoras] = useState('');
  const [error, setError] = useState('');

  const handleDiasChange = (e) => {
    const value = e.target.value;
    setDias(value);
    
    // Si se selecciona 0 días trabajados, limpiar horas extras
    if (value === '0' || value === 0) {
      setHoras('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!barredorId || dias === '' || horas === '') {
      setError('Completa todos los campos');
      return;
    }
    
    // Validar que los días trabajados sean al menos 1
    if (parseInt(dias) < 1) {
      setError('Los días trabajados deben ser al menos 1');
      return;
    }
    
    // Validar que no se puedan guardar horas extras cuando los días trabajados son 0
    if ((dias === '0' || dias === 0) && horas !== '' && horas !== '0') {
      setError('No se pueden registrar horas extras cuando el barredor no trabajó ningún día');
      return;
    }
    
    setError('');
    onAdd({
      barredor_id: barredorId,
      dias: Number(dias),
      horas_extras: Number(horas),
      planilla_id: planillaId
    });
    setBarredorId('');
    setDias('');
    setHoras('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Typography variant="subtitle1" mb={2} fontWeight={600}>
        Agregar Barredor
      </Typography>
      
      {/* Mensaje informativo sobre validaciones */}
      <Box sx={{ 
        mb: 2, 
        p: 2, 
        backgroundColor: '#e3f2fd', 
        borderRadius: 1, 
        border: '1px solid #2196f3' 
      }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Nota:</strong> Los días trabajados deben ser al menos 1 día. Si el barredor no trabajó ningún día (0 días), no se pueden registrar horas extras.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Barredor"
            value={barredorId}
            onChange={e => setBarredorId(e.target.value)}
            fullWidth
            required
            helperText="Seleccione el barredor a agregar."
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">-- Seleccione Barredor --</MenuItem>
            {barredoresDisponibles.map(b => (
              <MenuItem key={b.id} value={b.id}>{b.nombre} {b.apellido}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Días Trabajados"
            value={dias}
            onChange={handleDiasChange}
            fullWidth
            required
            helperText="Seleccione los días trabajados (mínimo 1 día)."
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">-- Seleccione Días --</MenuItem>
            {[1,2].map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Horas Extras"
            value={horas}
            onChange={e => setHoras(e.target.value)}
            fullWidth
            required
            disabled={dias === '0' || dias === 0}
            helperText={
              dias === '0' || dias === 0 
                ? "No se pueden seleccionar horas extras cuando no hay días trabajados"
                : "Seleccione las horas extras."
            }
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">-- Sin Hrs Extras --</MenuItem>
            {[0,1,2,3,4,5].map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      {error && <Box color="error.main" mt={1}>{error}</Box>}
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>Agregar</Button>
    </Box>
  );
} 