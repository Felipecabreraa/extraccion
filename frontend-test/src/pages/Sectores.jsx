import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Tooltip, MenuItem, Select, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axios';
import { validateNumericInput } from '../utils/numericValidation';

export default function Sectores() {
  const [zonas, setZonas] = useState([]);
  const [zonaId, setZonaId] = useState('');
  const [sectores, setSectores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', comuna: '', mt2: '', cantidad_pabellones: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pabellonesCreados, setPabellonesCreados] = useState([]);

  // Cargar zonas
  const fetchZonas = async () => {
    try {
      const res = await axios.get('/zonas');
      setZonas(res.data);
    } catch {}
  };

  // Cargar sectores por zona
  const fetchSectores = async (zona_id) => {
    if (!zona_id) { setSectores([]); return; }
    try {
      const res = await axios.get('/sectores', { params: { zona_id } });
      setSectores(res.data);
    } catch { setSectores([]); }
  };

  useEffect(() => { fetchZonas(); }, []);
  useEffect(() => { fetchSectores(zonaId); }, [zonaId]);

  const handleOpenModal = (sector = null) => {
    if (sector) {
      setEditId(sector.id);
      setForm({
        nombre: sector.nombre,
        comuna: sector.comuna || '',
        mt2: sector.mt2 || '',
        cantidad_pabellones: sector.cantidad_pabellones || ''
      });
    } else {
      setEditId(null);
      setForm({ nombre: '', comuna: '', mt2: '', cantidad_pabellones: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
          setForm({ nombre: '', comuna: '', mt2: '', cantidad_pabellones: '' });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.nombre) {
      setSnackbar({ open: true, message: 'El nombre del sector es requerido', severity: 'error' });
      return;
    }
    try {
      let response;
      if (editId) {
        response = await axios.put(`/sectores/${editId}`, { ...form, zona_id: zonaId });
      } else {
        response = await axios.post('/sectores', { ...form, zona_id: zonaId });
      }
      setSnackbar({ open: true, message: 'Sector guardado correctamente', severity: 'success' });
      setPabellonesCreados(response.data.pabellonesCreados || []);
      fetchSectores(zonaId);
      handleCloseModal();
    } catch {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar sector?')) return;
    try {
      await axios.delete(`/sectores/${id}`);
      setSnackbar({ open: true, message: 'Sector eliminado', severity: 'success' });
      fetchSectores(zonaId);
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  return (
    <Box p={3} sx={{ background: '#fafbfc', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222', mb: 3 }}>Gestión de Sectores</Typography>
      <Box mb={2}>
        <Select
          value={zonaId}
          onChange={e => setZonaId(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ borderRadius: 2, background: '#fff', boxShadow: 'none', color: '#222' }}
        >
          <MenuItem value="">-- Seleccione una zona --</MenuItem>
          {zonas.map(z => (
            <MenuItem key={z.id} value={z.id}>{z.nombre}</MenuItem>
          ))}
        </Select>
      </Box>
      {zonaId && (
        <>
          <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 'none', bgcolor: '#fff', borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: '#f6fafd', borderColor: 'primary.main' } }}>
            Agregar Sector
          </Button>
          <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#fff' }}>
                  <TableCell sx={{ color: '#888', fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 700 }}>Nombre</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 700 }}>Comuna</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 700 }}>MT2</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 700 }}>Cantidad de Pabellones</TableCell>
                  <TableCell align="right" sx={{ color: '#888', fontWeight: 700 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sectores.map((sector, idx) => (
                  <TableRow key={sector.id} sx={{ background: idx % 2 === 0 ? '#fafbfc' : '#f3f6f9', transition: 'background 0.2s', '&:hover': { background: '#e9f7fa' } }}>
                    <TableCell>{sector.id}</TableCell>
                    <TableCell>{sector.nombre}</TableCell>
                    <TableCell>{sector.comuna || '-'}</TableCell>
                    <TableCell>{sector.mt2}</TableCell>
                    <TableCell>{sector.cantidad_pabellones}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar"><IconButton onClick={() => handleOpenModal(sector)}><EditIcon sx={{ color: '#888' }} /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton sx={{ color: '#b71c1c' }} onClick={() => handleDelete(sector.id)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {pabellonesCreados.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Pabellones creados automáticamente: {pabellonesCreados.join(', ')}
        </Alert>
      )}
      <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fff', boxShadow: '0 2px 12px 0 #e0e0e0' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#222' }}>{editId ? 'Editar Sector' : 'Agregar Sector'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre del Sector"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            label="Comuna"
            value={form.comuna}
            onChange={e => setForm({ ...form, comuna: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            label="MT2"
            value={form.mt2}
            onChange={e => setForm({ ...form, mt2: validateNumericInput(e.target.value, 'integer') })}
            fullWidth
            margin="dense"
            type="number"
            placeholder="Ingresa MT2"
            inputProps={{ min: 1 }}
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            label="Cantidad de pabellones"
            value={form.cantidad_pabellones}
            onChange={e => setForm({ ...form, cantidad_pabellones: validateNumericInput(e.target.value, 'integer') })}
            fullWidth
            margin="dense"
            type="number"
            placeholder="Digita cantidad de pabellones"
            inputProps={{ min: 1 }}
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ borderRadius: 2, color: '#888', bgcolor: '#f6fafd', boxShadow: 'none', '&:hover': { bgcolor: '#ececec' } }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 600, bgcolor: 'primary.main', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#3ed6d6' } }}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbar({ ...snackbar, open: false })}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
} 