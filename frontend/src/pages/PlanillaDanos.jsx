import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import axios from '../api/axios';

const tiposDano = [
  { value: 'INFRAESTRUCTURA', label: 'INFRAESTRUCTURA', descripciones: [
    'OTROS (ESPECIFICAR)',
    'PLATO DE COMEDERO ROTO',
    '50 CM DE SOLERA DE CONCRETO ROTA',
    'PILAR DE PORTÓN DELANTERO Y TRASERO MOVIDO',
    'DIAGONAL ROTO',
    '1 METRO DE SOLERA DE CONCRETO TOTA',
  ] },
  { value: 'EQUIPO', label: 'EQUIPO', descripciones: [
    'OTROS (ESPECIFICAR)',
    '2 TETILLAS DE BEBEDERO NIPLE ROTAS',
  ] }
];

export default function PlanillaDanos({ planillaId }) {
  const [pabellones, setPabellones] = useState([]);
  const [pabellonesFiltrados, setPabellonesFiltrados] = useState([]);
  const [maquinasFiltradas, setMaquinasFiltradas] = useState([]);
  const [todasLasMaquinas, setTodasLasMaquinas] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [pabellonMaquina, setPabellonMaquina] = useState([]);
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token && token.length > 0;
  };
  
  // Contar registros con cantidades inválidas para mostrar en el mensaje
  const registrosInvalidos = registros.filter(r => {
    const cantidadInvalida = parseInt(r.cantidad) < 0 || parseInt(r.cantidad) > 999;
    return cantidadInvalida;
  }).length;
  const [form, setForm] = useState({
    pabellon_id: '',
    maquina_id: '',
    tipo: '',
    descripcion: '',
    cantidad: '',
    observacion: ''
  });
  const [error, setError] = useState('');
  const [deleteIdx, setDeleteIdx] = useState(-1);
  const [editIdx, setEditIdx] = useState(-1);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    axios.get('/pabellones', { params: { planilla_id: planillaId } })
      .then(res => setPabellones(res.data))
      .catch(() => setPabellones([]));
    
    // Obtener todas las máquinas para mostrar correctamente en la tabla
    axios.get('/maquinas')
      .then(res => setTodasLasMaquinas(res.data))
      .catch(() => setTodasLasMaquinas([]));
      
    fetchRegistros();
    // eslint-disable-next-line
  }, [planillaId]);

  useEffect(() => {
    axios.get(`/pabellon_maquina?planilla_id=${planillaId}`)
      .then(res => setPabellonMaquina(res.data))
      .catch(() => setPabellonMaquina([]));
    fetchRegistros();
    // eslint-disable-next-line
  }, [planillaId]);

  useEffect(() => {
    // Obtener todos los pabellones que tienen máquinas asignadas en esta planilla
    const pabellonesConMaquinas = [...new Set(pabellonMaquina.map(pm => pm.pabellon_id))];
    
    // Filtrar solo los pabellones que tienen al menos una máquina sin daño registrado
    const pabellonesDisponibles = pabellonesConMaquinas.filter(pabellonId => {
      const maquinasEnPabellon = pabellonMaquina.filter(pm => pm.pabellon_id === pabellonId);
      // Verificar si al menos una máquina no tiene daño registrado
      return maquinasEnPabellon.some(pm => 
        !registros.some(r => r.pabellon_id === pm.pabellon_id && r.maquina_id === pm.maquina_id)
      );
    });
    
    axios.get('/pabellones')
      .then(res => setPabellonesFiltrados(res.data.filter(p => pabellonesDisponibles.includes(p.id))))
      .catch(() => setPabellonesFiltrados([]));
  }, [pabellonMaquina, registros]);

  useEffect(() => {
    if (form.pabellon_id) {
      // Obtener todas las máquinas que trabajaron en este pabellón
      const maquinasIds = pabellonMaquina.filter(pm => pm.pabellon_id === form.pabellon_id).map(pm => pm.maquina_id);
      axios.get('/maquinas')
        .then(res => {
          const todasLasMaquinas = res.data.filter(m => maquinasIds.includes(m.id));
          // Filtrar solo las que no tienen daños registrados
          const maquinasDisponibles = todasLasMaquinas.filter(m => 
            !registros.some(r => r.pabellon_id === form.pabellon_id && r.maquina_id === m.id)
          );
          setMaquinasFiltradas(maquinasDisponibles);
        })
        .catch(() => setMaquinasFiltradas([]));
    } else {
      setMaquinasFiltradas([]);
    }
  }, [form.pabellon_id, pabellonMaquina, registros]);

  const fetchRegistros = () => {
    axios.get(`/danos?planilla_id=${planillaId}`)
      .then(res => setRegistros(res.data))
      .catch(() => setRegistros([]));
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'tipo') {
      setForm(f => ({ ...f, descripcion: '' }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    // Verificar autenticación
    if (!isAuthenticated()) {
      setError('No está autenticado. Por favor, inicie sesión.');
      return;
    }
    
    if (!form.pabellon_id || !form.maquina_id || !form.tipo || !form.descripcion || !form.cantidad) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    
    // Validar que la cantidad sea >= 0 y <= 999
    const cantidad = parseInt(form.cantidad);
    if (cantidad < 0) {
      setError('La cantidad no puede ser negativa');
      return;
    }
    if (cantidad > 999) {
      setError('La cantidad no puede exceder 999 (máximo 3 dígitos)');
      return;
    }
    
    if (registros.some(r => r.pabellon_id === form.pabellon_id && r.maquina_id === form.maquina_id)) {
      setError('Ya existe un daño registrado para esa máquina en ese pabellón.');
      return;
    }
    setError('');
    axios.post('/danos', { ...form, planilla_id: planillaId })
      .then((response) => { 
        fetchRegistros(); 
        setForm({ pabellon_id: '', maquina_id: '', tipo: '', descripcion: '', cantidad: '', observacion: '' }); 
        
        // Notificar al dashboard que se actualice
        window.dispatchEvent(new CustomEvent('danosUpdated', { 
          detail: { action: 'create', id: response.data.id } 
        }));
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          setError('Error de autorización. Por favor, inicie sesión nuevamente.');
        } else if (error.response?.status === 401) {
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        } else {
          setError('Error al agregar daño. Verifique su conexión.');
        }
      });
  };

  const handleDelete = idx => {
    setDeleteIdx(idx);
  };

  const confirmDelete = () => {
    const id = registros[deleteIdx].id;
    axios.delete(`/danos/${id}`)
      .then(() => { 
        fetchRegistros(); 
        setDeleteIdx(-1); 
        
        // Notificar al dashboard que se actualice
        // Esto se puede hacer mediante un evento personalizado
        window.dispatchEvent(new CustomEvent('danosUpdated', { 
          detail: { action: 'delete', id } 
        }));
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          setError('Error de autorización. Por favor, inicie sesión nuevamente.');
        } else if (error.response?.status === 401) {
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        } else {
          setError('Error al eliminar daño. Verifique su conexión.');
        }
      });
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditData(registros[idx]);
    setForm({
      pabellon_id: registros[idx].pabellon_id,
      maquina_id: registros[idx].maquina_id,
      tipo: registros[idx].tipo,
      descripcion: registros[idx].descripcion,
      cantidad: registros[idx].cantidad,
      observacion: registros[idx].observacion || ''
    });
  };

  const handleEditSave = async e => {
    e.preventDefault();
    
    // Verificar autenticación
    if (!isAuthenticated()) {
      setError('No está autenticado. Por favor, inicie sesión.');
      return;
    }
    
    if (!form.pabellon_id || !form.maquina_id || !form.tipo || !form.descripcion || !form.cantidad) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    
    // Validar que la cantidad sea >= 0 y <= 999
    const cantidad = parseInt(form.cantidad);
    if (cantidad < 0) {
      setError('La cantidad no puede ser negativa');
      return;
    }
    if (cantidad > 999) {
      setError('La cantidad no puede exceder 999 (máximo 3 dígitos)');
      return;
    }
    setError('');
    try {
      await axios.put(`/danos/${editData.id}`, { ...form, planilla_id: planillaId });
      fetchRegistros();
      setEditIdx(-1);
      setEditData(null);
      setForm({ pabellon_id: '', maquina_id: '', tipo: '', descripcion: '', cantidad: '', observacion: '' });
      
      // Notificar al dashboard que se actualice
      window.dispatchEvent(new CustomEvent('danosUpdated', { 
        detail: { action: 'update', id: editData.id } 
      }));
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Error de autorización. Por favor, inicie sesión nuevamente.');
      } else if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else {
        setError('Error al editar daño. Verifique su conexión.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditIdx(-1);
    setEditData(null);
    setForm({ pabellon_id: '', maquina_id: '', tipo: '', descripcion: '', cantidad: '', observacion: '' });
  };

  const descripciones = tiposDano.find(t => t.value === form.tipo)?.descripciones || [];

  return (
    <Box>
      <Typography variant="h6" mb={2}>Agregar Daños a Planilla #{planillaId}</Typography>
      
             {/* Mensaje informativo sobre validaciones */}
       <Box sx={{ 
         mb: 2, 
         p: 2, 
         backgroundColor: '#e3f2fd', 
         borderRadius: 1, 
         border: '1px solid #2196f3' 
       }}>
         <Typography variant="body2" color="text.secondary">
           <strong>Nota:</strong> La cantidad de daños debe ser mayor o igual a 0 y no puede exceder 999 (máximo 3 dígitos).
         </Typography>
       </Box>
       
       {/* Mensaje de estado de autenticación */}
       {!isAuthenticated() && (
         <Box sx={{ 
           mb: 2, 
           p: 2, 
           backgroundColor: '#ffebee', 
           borderRadius: 1, 
           border: '1px solid #f44336' 
         }}>
           <Typography variant="body2" color="error">
             <strong>Advertencia:</strong> No está autenticado. Es posible que no pueda guardar datos.
           </Typography>
         </Box>
       )}
      <Box component="form" onSubmit={editIdx === -1 ? handleSubmit : handleEditSave} sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Pabellón"
              name="pabellon_id"
              value={form.pabellon_id}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione el pabellón."
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">-- Seleccione Pabellón --</MenuItem>
              {pabellonesFiltrados.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Máquina"
              name="maquina_id"
              value={form.maquina_id}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione la máquina asociada."
              InputLabelProps={{ shrink: true }}
              disabled={!form.pabellon_id}
            >
              <MenuItem value="">-- Seleccione Máquina --</MenuItem>
              {maquinasFiltradas.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.numero}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Tipo de Daño"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione el tipo de daño."
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">-- Seleccione Tipo Daño --</MenuItem>
              {tiposDano.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Descripción Daño"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              fullWidth
              required
              helperText="Seleccione la descripción del daño."
              InputLabelProps={{ shrink: true }}
              disabled={!form.tipo}
            >
              <MenuItem value="">-- Seleccione Descripción Daño --</MenuItem>
              {descripciones.map(desc => (
                <MenuItem key={desc} value={desc}>{desc}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Cantidad de Daños"
              name="cantidad"
              value={form.cantidad}
              onChange={handleChange}
              fullWidth
              required
              helperText="Ingrese la cantidad de daños (máximo 999 - 3 dígitos)."
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: 0, 
                max: 999,
                maxLength: 3
              }}
              error={parseInt(form.cantidad) > 999 || parseInt(form.cantidad) < 0}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Observación"
              name="observacion"
              value={form.observacion}
              onChange={handleChange}
              fullWidth
              helperText="Ingrese una observación (opcional)."
              InputLabelProps={{ shrink: true }}
              multiline
              minRows={1}
            />
          </Grid>
        </Grid>
        {error && <Box color="error.main" mt={1}>{error}</Box>}
        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={editIdx !== -1}>
          {editIdx === -1 ? 'Guardar' : 'Guardar Cambios'}
        </Button>
        {editIdx !== -1 && (
          <Button variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={handleCancelEdit}>Cancelar</Button>
        )}
      </Box>
      
      {/* Mensaje de registros inválidos */}
      {registrosInvalidos > 0 && (
        <Box sx={{ 
          mb: 2, 
          p: 1, 
          backgroundColor: '#fff3cd', 
          borderRadius: 1, 
          border: '1px solid #ffc107',
          fontSize: '0.875rem'
        }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Nota:</strong> {registrosInvalidos} registro(s) marcado(s) en amarillo tienen cantidades invalidas (menor a 0 o mayor a 999).
          </Typography>
        </Box>
      )}
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nro. Pabellón</TableCell>
              <TableCell>Nro. Máquina</TableCell>
              <TableCell>Tipo Daño</TableCell>
              <TableCell>Descripción Daño</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((r, idx) => {
              const cantidadInvalida = parseInt(r.cantidad) < 0 || parseInt(r.cantidad) > 999;
              
              return (
                <TableRow 
                  key={r.id}
                  sx={{
                    backgroundColor: cantidadInvalida ? '#fff3cd' : 'inherit',
                    '&:hover': {
                      backgroundColor: cantidadInvalida ? '#ffeaa7' : '#f5f5f5'
                    }
                  }}
                >
                <TableCell>{pabellones.find(p => p.id === r.pabellon_id)?.nombre || `Pabellón ${r.pabellon_id}`}</TableCell>
                <TableCell>{todasLasMaquinas.find(m => m.id === r.maquina_id)?.numero || r.maquina_id}</TableCell>
                <TableCell>{r.tipo}</TableCell>
                <TableCell>{r.descripcion}</TableCell>
                <TableCell>{r.cantidad}</TableCell>
                <TableCell>{r.observacion}</TableCell>
                                  <TableCell>
                    <IconButton onClick={() => handleEdit(idx)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(idx)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            </TableBody>
        </Table>
      </TableContainer>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteIdx !== -1} onClose={() => setDeleteIdx(-1)}>
        <DialogTitle>¿Eliminar daño?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este daño?
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