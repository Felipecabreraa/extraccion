import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, FormControlLabel, FormGroup, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';

export default function PlanillaPabellones({ planillaId }) {
  const [maquinas, setMaquinas] = useState([]);
  const [pabellones, setPabellones] = useState([]); // [{id, nombre}]
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState('');
  const [deleteIdx, setDeleteIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ maquina_id: '', pabellones: [] });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(`/planillas/${planillaId}`)
      .then(res => {
        const sectorId = res.data.sector_id;
        axios.get(`/pabellones?sector_id=${sectorId}`)
          .then(pabRes => {
            setPabellones(pabRes.data);
            setLoading(false);
          });
      });
    axios.get(`/maquina_planilla?planilla_id=${planillaId}`)
      .then(res => {
        const maquinasPlanilla = res.data.map(r => r.Maquina);
        setMaquinas(maquinasPlanilla);
      })
      .catch(() => setMaquinas([]));
    fetchRegistros();
    // eslint-disable-next-line
  }, [planillaId]);

  const fetchRegistros = () => {
    axios.get(`/pabellon_maquina?planilla_id=${planillaId}`)
      .then(res => setRegistros(res.data))
      .catch(() => setRegistros([]));
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handlePabellonCheckbox = pabellon_id => {
    setForm(f => ({
      ...f,
      pabellones: f.pabellones.includes(pabellon_id)
        ? f.pabellones.filter(p => p !== pabellon_id)
        : [...f.pabellones, pabellon_id]
    }));
  };

  const handleAgregar = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    if (!form.maquina_id || form.pabellones.length === 0) {
      setError('Seleccione una máquina y al menos un pabellón');
      setLoading(false);
      return;
    }
    setError('');
    // Validar que no se dupliquen asignaciones
    const yaAsignados = registros.filter(r => r.maquina_id === form.maquina_id && form.pabellones.includes(r.pabellon_id)).map(r => r.pabellon_id);
    const nuevosPabellones = form.pabellones.filter(pid => !yaAsignados.includes(pid));
    if (nuevosPabellones.length === 0) {
      setError('Ya existen esas asignaciones para esta máquina.');
      setLoading(false);
      return;
    }
    try {
      await Promise.all(nuevosPabellones.map(pabellon_id =>
        axios.post('/pabellon_maquina', { planilla_id: planillaId, maquina_id: form.maquina_id, pabellon_id })
      ));
      fetchRegistros();
      setForm({ maquina_id: '', pabellones: [] });
      setSuccess('Asignación guardada correctamente.');
    } catch (err) {
      setError('Error al agregar. Verifique los datos.');
    }
    setLoading(false);
  };

  const handleDelete = idx => {
    setDeleteIdx(idx);
  };

  const confirmDelete = () => {
    const id = registros[deleteIdx].id;
    axios.delete(`/pabellon_maquina/${id}`)
      .then(() => { fetchRegistros(); setDeleteIdx(-1); })
      .catch(() => setError('Error al eliminar'));
  };

  // Obtener los pabellones ya asignados a la máquina seleccionada
  const yaAsignados = form.maquina_id
    ? registros.filter(r => r.maquina_id === form.maquina_id).map(r => r.pabellon_id)
    : [];

  return (
    <Box>
      <Typography variant="h6" mb={2}>Asignar Pabellones a Máquinas de la Planilla #{planillaId}</Typography>
      <Box component="form" onSubmit={handleAgregar} sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Máquina"
              name="maquina_id"
              value={form.maquina_id}
              onChange={handleFormChange}
              fullWidth
              required
              helperText="Seleccione la máquina."
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            >
              <MenuItem value="">-- Seleccione Máquina --</MenuItem>
              {maquinas.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.numero}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" mb={1}>Seleccione los pabellones en los que trabajó la máquina:</Typography>
            <FormGroup row>
              {pabellones.map(pabellon => (
                <FormControlLabel
                  key={pabellon.id}
                  control={
                    <Checkbox
                      checked={form.pabellones.includes(pabellon.id) || yaAsignados.includes(pabellon.id)}
                      onChange={() => handlePabellonCheckbox(pabellon.id)}
                      disabled={loading || !form.maquina_id || yaAsignados.includes(pabellon.id)}
                    />
                  }
                  label={pabellon.nombre}
                />
              ))}
            </FormGroup>
          </Grid>
        </Grid>
        {error && <Box color="error.main" mt={1}>{error}</Box>}
        {success && <Box color="success.main" mt={1}>{success}</Box>}
        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>{loading ? 'Agregando...' : 'Agregar'}</Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Máquina</TableCell>
              <TableCell>Pabellón</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((r, idx) => (
              <TableRow key={r.id}>
                <TableCell>{maquinas.find(m => m.id === r.maquina_id)?.numero || r.maquina_id}</TableCell>
                <TableCell>{pabellones.find(p => p.id === r.pabellon_id)?.nombre || r.pabellon_id}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteIdx !== -1} onClose={() => setDeleteIdx(-1)}>
        <DialogTitle>¿Eliminar pabellón?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este pabellón de la máquina?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIdx(-1)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 