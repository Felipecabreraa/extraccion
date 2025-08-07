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
    const { name, value } = e.target;
    
    // Si se está cambiando los días trabajados y se selecciona 0, limpiar horas extras
    if (name === 'dias_trabajados' && value === '0') {
      setForm({ ...form, [name]: value, horas_extras: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.maquina_id || !form.operador_id || form.dias_trabajados === '' || form.horas_extras === '' || form.odometro_inicio === '' || form.odometro_fin === '' || form.petroleo === '') {
      setError('Completa todos los campos');
      return;
    }
    
    // Validar que los días trabajados sean al menos 1
    if (parseInt(form.dias_trabajados) < 1) {
      setError('Los días trabajados deben ser al menos 1');
      return;
    }
    
    // Validar que no se puedan guardar horas extras cuando los días trabajados son 0
    if ((form.dias_trabajados === '0' || form.dias_trabajados === 0) && form.horas_extras !== '' && form.horas_extras !== '0') {
      setError('No se pueden registrar horas extras cuando el operador no trabajó ningún día');
      return;
    }
    
    // Validar odómetros
    const odometroInicio = parseInt(form.odometro_inicio);
    const odometroFin = parseInt(form.odometro_fin);
    const petroleo = parseFloat(form.petroleo);
    
    // Validar que los odómetros no excedan 9999 (4 dígitos)
    if (odometroInicio > 9999 || odometroFin > 9999) {
      setError('Los valores de odómetro no pueden exceder 9999 (máximo 4 dígitos)');
      return;
    }
    
    // Validar que el odómetro fin sea superior al odómetro inicio
    if (odometroFin <= odometroInicio) {
      setError('El odómetro de fin debe ser superior al odómetro de inicio');
      return;
    }
    
    // Validar que el petróleo no exceda 999 (3 dígitos)
    if (petroleo > 999) {
      setError('Los litros de petróleo no pueden exceder 999 (máximo 3 dígitos)');
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
    // Si se está cambiando los días trabajados y se selecciona 0, limpiar horas extras
    if (field === 'dias_trabajados' && value === '0') {
      setEditData({ ...editData, [field]: value, horas_extras: '' });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleEditSave = () => {
    // Validar que los días trabajados sean al menos 1
    if (parseInt(editData.dias_trabajados) < 1) {
      setError('Los días trabajados deben ser al menos 1');
      return;
    }
    
    // Validar que no se puedan guardar horas extras cuando los días trabajados son 0
    if ((editData.dias_trabajados === '0' || editData.dias_trabajados === 0) && editData.horas_extras !== '' && editData.horas_extras !== '0') {
      setError('No se pueden registrar horas extras cuando el operador no trabajó ningún día');
      return;
    }
    
    // Validar odómetros
    const odometroInicio = parseInt(editData.odometro_inicio);
    const odometroFin = parseInt(editData.odometro_fin);
    const petroleo = parseFloat(editData.petroleo);
    
    // Validar que los odómetros no excedan 9999 (4 dígitos)
    if (odometroInicio > 9999 || odometroFin > 9999) {
      setError('Los valores de odómetro no pueden exceder 9999 (máximo 4 dígitos)');
      return;
    }
    
    // Validar que el odómetro fin sea superior al odómetro inicio
    if (odometroFin <= odometroInicio) {
      setError('El odómetro de fin debe ser superior al odómetro de inicio');
      return;
    }
    
    // Validar que el petróleo no exceda 999 (3 dígitos)
    if (petroleo > 999) {
      setError('Los litros de petróleo no pueden exceder 999 (máximo 3 dígitos)');
      return;
    }
    
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
      
      {/* Mensaje informativo sobre validaciones */}
      <Box sx={{ 
        mb: 2, 
        p: 2, 
        backgroundColor: '#e3f2fd', 
        borderRadius: 1, 
        border: '1px solid #2196f3' 
      }}>
                 <Typography variant="body2" color="text.secondary">
           <strong>Nota:</strong> Los días trabajados deben ser al menos 1 día. Si el operador no trabajó ningún día (0 días), no se pueden registrar horas extras.
           Los registros con días trabajados 0 pero con horas extras se mostrarán en amarillo.
           <br />
           <strong>Valores numéricos:</strong> Los odómetros no pueden exceder 9999 (máximo 4 dígitos). Los litros de petróleo no pueden exceder 999 (máximo 3 dígitos).
           El odómetro de fin debe ser superior al de inicio.
         </Typography>
      </Box>
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
              label="Horas Extras Operador"
              name="horas_extras"
              value={form.horas_extras}
              onChange={handleChange}
              fullWidth
              required
              disabled={form.dias_trabajados === '0' || form.dias_trabajados === 0}
              helperText={
                form.dias_trabajados === '0' || form.dias_trabajados === 0 
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
                     <Grid item xs={12} sm={4}>
             <TextField
               type="number"
               label="Odómetro Inicio"
               name="odometro_inicio"
               value={form.odometro_inicio}
               onChange={handleChange}
               fullWidth
               required
               helperText="Ingrese el odómetro de inicio (máximo 9999 - 4 dígitos)."
               InputLabelProps={{ shrink: true }}
               inputProps={{ 
                 min: 0, 
                 max: 9999,
                 maxLength: 4
               }}
               error={parseInt(form.odometro_inicio) > 9999}
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
               helperText={
                 parseInt(form.odometro_fin) <= parseInt(form.odometro_inicio) && form.odometro_fin !== '' && form.odometro_inicio !== ''
                   ? "El odómetro de fin debe ser superior al de inicio"
                   : "Ingrese el odómetro de fin (máximo 9999 - 4 dígitos)."
               }
               InputLabelProps={{ shrink: true }}
               inputProps={{ 
                 min: parseInt(form.odometro_inicio) || 0, 
                 max: 9999,
                 maxLength: 4
               }}
               error={
                 parseInt(form.odometro_fin) > 9999 || 
                 (parseInt(form.odometro_fin) <= parseInt(form.odometro_inicio) && form.odometro_fin !== '' && form.odometro_inicio !== '')
               }
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
               helperText="Ingrese los litros de petróleo consumidos (máximo 999 - 3 dígitos)."
               InputLabelProps={{ shrink: true }}
               inputProps={{ 
                 min: 0, 
                 max: 999,
                 step: 'any',
                 maxLength: 3
               }}
               error={parseFloat(form.petroleo) > 999}
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
                         {registros.map((r, idx) => {
               const odometroInicio = parseInt(r.odometro_inicio) || 0;
               const odometroFin = parseInt(r.odometro_fin) || 0;
               const petroleo = parseFloat(r.petroleo) || 0;
               const odometrosInvalidos = odometroFin <= odometroInicio || odometroInicio > 9999 || odometroFin > 9999;
               const petroleoInvalido = petroleo > 999;
               const diasTrabajadosInvalidos = r.dias_trabajados < 1;
               const horasExtrasInvalidas = r.dias_trabajados === 0 && r.horas_extras > 0;
              
              return (
                <TableRow 
                  key={r.id}
                  sx={{
                    backgroundColor: horasExtrasInvalidas || odometrosInvalidos || petroleoInvalido || diasTrabajadosInvalidos ? '#fff3cd' : 'inherit',
                    '&:hover': {
                      backgroundColor: horasExtrasInvalidas || odometrosInvalidos || petroleoInvalido || diasTrabajadosInvalidos ? '#ffeaa7' : '#f5f5f5'
                    }
                  }}
                >
                <TableCell>{r.Maquina ? r.Maquina.numero : ''}</TableCell>
                <TableCell>{r.Operador ? `${r.Operador.nombre} ${r.Operador.apellido}` : ''}</TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      select
                      value={editData.dias_trabajados}
                      onChange={e => handleEditChange('dias_trabajados', e.target.value)}
                      size="small"
                      inputProps={{ min: 1 }}
                      error={parseInt(editData.dias_trabajados) < 1}
                      helperText={
                        parseInt(editData.dias_trabajados) < 1 
                          ? "Mínimo 1 día"
                          : ""
                      }
                    >
                      <MenuItem value="">-- Seleccione --</MenuItem>
                      {[1,2].map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  ) : r.dias_trabajados}
                </TableCell>
                <TableCell>
                  {editIdx === idx ? (
                    <TextField
                      type="number"
                      value={editData.horas_extras}
                      onChange={e => handleEditChange('horas_extras', e.target.value)}
                      size="small"
                      disabled={editData.dias_trabajados === '0' || editData.dias_trabajados === 0}
                      helperText={
                        editData.dias_trabajados === '0' || editData.dias_trabajados === 0 
                          ? "No disponible"
                          : ""
                      }
                    />
                  ) : r.horas_extras}
                </TableCell>
                                 <TableCell>
                   {editIdx === idx ? (
                     <TextField
                       type="number"
                       value={editData.odometro_inicio}
                       onChange={e => handleEditChange('odometro_inicio', e.target.value)}
                       size="small"
                       inputProps={{ 
                         min: 0, 
                         max: 9999,
                         maxLength: 4
                       }}
                       error={parseInt(editData.odometro_inicio) > 9999}
                       helperText={
                         parseInt(editData.odometro_inicio) > 9999 
                           ? "Máximo 9999 (4 dígitos)"
                           : ""
                       }
                     />
                   ) : r.odometro_inicio}
                 </TableCell>
                                 <TableCell>
                   {editIdx === idx ? (
                     <TextField
                       type="number"
                       value={editData.odometro_fin}
                       onChange={e => handleEditChange('odometro_fin', e.target.value)}
                       size="small"
                       inputProps={{ 
                         min: parseInt(editData.odometro_inicio) || 0, 
                         max: 9999,
                         maxLength: 4
                       }}
                       error={
                         parseInt(editData.odometro_fin) > 9999 || 
                         (parseInt(editData.odometro_fin) <= parseInt(editData.odometro_inicio) && editData.odometro_fin !== '' && editData.odometro_inicio !== '')
                       }
                       helperText={
                         parseInt(editData.odometro_fin) <= parseInt(editData.odometro_inicio) && editData.odometro_fin !== '' && editData.odometro_inicio !== ''
                           ? "Debe ser mayor"
                           : parseInt(editData.odometro_fin) > 9999
                           ? "Máximo 9999 (4 dígitos)"
                           : ""
                       }
                     />
                   ) : r.odometro_fin}
                 </TableCell>
                                 <TableCell>
                   {editIdx === idx ? (
                     <TextField
                       type="number"
                       value={editData.petroleo}
                       onChange={e => handleEditChange('petroleo', e.target.value)}
                       size="small"
                       inputProps={{ 
                         min: 0, 
                         max: 999,
                         step: 'any',
                         maxLength: 3
                       }}
                       error={parseFloat(editData.petroleo) > 999}
                       helperText={
                         parseFloat(editData.petroleo) > 999 
                           ? "Máximo 999 (3 dígitos)"
                           : ""
                       }
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
            );
            })}
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