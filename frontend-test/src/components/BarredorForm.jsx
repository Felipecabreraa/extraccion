import React, { useState } from 'react';
import { Button, MenuItem, TextField, Grid, Box, Typography } from '@mui/material';

export default function BarredorForm({ planillaId, barredoresDisponibles, onAdd }) {
  const [barredorId, setBarredorId] = useState('');
  const [dias, setDias] = useState('');
  const [horas, setHoras] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!barredorId || dias === '' || horas === '') {
      setError('Completa todos los campos');
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
            onChange={e => setDias(e.target.value)}
            fullWidth
            required
            helperText="Seleccione los días trabajados."
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">-- Seleccione Días --</MenuItem>
            {[0,1,2].map(opt => (
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
            helperText="Seleccione las horas extras."
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">-- Seleccione Horas --</MenuItem>
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