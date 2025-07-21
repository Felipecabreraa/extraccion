import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';

export default function PlanillaMaquinas({ planillaId }) {
  const [maquinas, setMaquinas] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState({
    maquina_id: '',
    operador_id: '',
    dias_trabajados: '',
    horas_extras: '',
    odometro_inicio: '',
    odometro_fin: '',
    petroleo: ''
  });
  const [error, setError] = useState('');
  const [editIdx, setEditIdx] = useState(-1);
  const [editData, setEditData] = useState({});
  const [deleteIdx, setDeleteIdx] = useState(-1);

  useEffect(() => {
    axios.get('/maquinas').then(res => setMaquinas(res.data)).catch(() => setMaquinas([]));
    axios.get('/operadores').then(res => setOperadores(res.data)).catch(() => setOperadores([]));
    fetchRegistros();
    // eslint-disable-next-line
  }, [planillaId]);

  const fetchRegistros = () => {
    axios.get(`/maquina_planilla?planilla_id=${planillaId}`)
      .then(res => setRegistros(res.data))
      .catch(() => setRegistros([]));
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.maquina_id || !form.operador_id || form.dias_trabajados === '' || form.horas_extras === '' || form.odometro_inicio === '' || form.odometro_fin === '' || form.petroleo === '') {
      setError('Completa todos los campos');
      return;
    }
    setError('');
    axios.post('/maquina_planilla', { ...form, planilla_id: planillaId })
      .then(() => { fetchRegistros(); setForm({ maquina_id: '', operador_id: '', dias_trabajados: '', horas_extras: '', odometro_inicio: '', odometro_fin: '', petroleo: '' }); })
      .catch(() => setError('Error al agregar'));
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditData(registros[idx]);
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleEditSave = () => {
    axios.put(`/maquina_planilla/${editData.id}`, editData)
      .then(() => { fetchRegistros(); setEditIdx(-1); })
      .catch(() => setError('Error al editar'));
  };

  const handleDelete = idx => {
    setDeleteIdx(idx);
  };

  const confirmDelete = () => {
    const id = registros[deleteIdx].id;
    axios.delete(`/maquina_planilla/${id}`)
      .then(() => { fetchRegistros(); setDeleteIdx(-1); })
      .catch(() => setError('Error al eliminar'));
  };

  // Eliminar duplicados de máquinas por id
  const maquinasUnicas = maquinas.filter((m, idx, arr) => arr.findIndex(x => x.id === m.id) === idx);

  return (
    <Box>
      <Typography variant="h6" mb={2}>Agregar Máquinas a Planilla #{planillaId}</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Máquina"
              name="maquina_id"
              value={form.maquina_id}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione la máquina."
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">-- Seleccione Máquina --</MenuItem>
              {maquinasUnicas.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.numero}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Operador"
              name="operador_id"
              value={form.operador_id}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione el operador."
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">-- Seleccione Operador --</MenuItem>
              {operadores.map(o => (
                <MenuItem key={o.id} value={o.id}>
                  <span style={{ fontWeight: 'bold' }}>{o.nombre} {o.apellido}</span>
                  {o.rut && (
                    <span style={{ display: 'block', fontSize: '0.85em', color: '#888' }}>{o.rut}</span>
                  )}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Días Trabajados Operador"
              name="dias_trabajados"
              value={form.dias_trabajados}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione los días trabajados."
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">-- No Trabajó --</MenuItem>
              {[0,1,2].map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Horas Extras Operador"
              name="horas_extras"
              value={form.horas_extras}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione las horas extras."
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">-- Sin Hrs Extras --</MenuItem>
              {[0,1,2,3,4,5].map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type="number"
              label="Odómetro Inicio"
              name="odometro_inicio"
              value={form.odometro_inicio}
              onChange={handleChange}
              fullWidth
              required
              helperText="Ingrese el odómetro de inicio."
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type="number"
              label="Odómetro Fin"
              name="odometro_fin"
              value={form.odometro_fin}
              onChange={handleChange}
              fullWidth
              required
              helperText="Ingrese el odómetro de fin."
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type="number"
              label="Litros Petróleo"
              name="petroleo"
              value={form.petroleo}
              onChange={handleChange}
              fullWidth
              required
              helperText="Ingrese los litros de petróleo consumidos."
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0, step: 'any' }}
            />
          </Grid>
        </Grid>
        {error && <Box color="error.main" mt={1}>{error}</Box>}
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Agregar</Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Máquina</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell>Días Trabajados</TableCell>
              <TableCell>Hrs. Extras</TableCell>
              <TableCell>Odómetro Inicio</TableCell>
              <TableCell>Odómetro Fin</TableCell>
              <TableCell>Litros Petróleo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((r, idx) => (
              <TableRow key={r.id}>
                <TableCell>{r.Maquina ? r.Maquina.numero : ''}</TableCell>
                <TableCell>{r.Operador ? `${r.Operador.nombre} ${r.Operador.apellido}` : ''}</TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      type="number"
                      value={editData.dias_trabajados}
                      onChange={e => handleEditChange('dias_trabajados', e.target.value)}
                      size="small"
                    />
                  ) : r.dias_trabajados}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      type="number"
                      value={editData.horas_extras}
                      onChange={e => handleEditChange('horas_extras', e.target.value)}
                      size="small"
                    />
                  ) : r.horas_extras}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      value={editData.odometro_inicio}
                      onChange={e => handleEditChange('odometro_inicio', e.target.value)}
                      size="small"
                    />
                  ) : r.odometro_inicio}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      value={editData.odometro_fin}
                      onChange={e => handleEditChange('odometro_fin', e.target.value)}
                      size="small"
                    />
                  ) : r.odometro_fin}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      value={editData.petroleo}
                      onChange={e => handleEditChange('petroleo', e.target.value)}
                      size="small"
                    />
                  ) : r.petroleo}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <>
                      <Button onClick={handleEditSave} size="small">Guardar</Button>
                      <Button onClick={() => setEditIdx(-1)} size="small">Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => handleEdit(idx)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteIdx !== -1} onClose={() => setDeleteIdx(-1)}>
        <DialogTitle>¿Eliminar máquina?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta máquina de la planilla?
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