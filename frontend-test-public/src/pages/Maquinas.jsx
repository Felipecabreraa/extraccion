import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axios';

export default function Maquinas() {
  const [maquinas, setMaquinas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ numero: '', marca: '', modelo: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);

  const fetchMaquinas = async () => {
    try {
      const res = await axios.get('/maquinas');
      setMaquinas(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Error al cargar máquinas', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchMaquinas();
  }, []);

  const handleOpenModal = (maquina = null) => {
    if (maquina) {
      setEditId(maquina.id);
      setForm({ numero: maquina.numero, marca: maquina.marca, modelo: maquina.modelo });
    } else {
      setEditId(null);
      setForm({ numero: '', marca: '', modelo: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm({ numero: '', marca: '', modelo: '' });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.numero || !form.marca || !form.modelo) {
      setSnackbar({ open: true, message: 'Completa todos los campos', severity: 'error' });
      return;
    }
    try {
      if (editId) {
        await axios.put(`/maquinas/${editId}`, form);
        setSnackbar({ open: true, message: 'Máquina actualizada', severity: 'success' });
      } else {
        await axios.post('/maquinas', form);
        setSnackbar({ open: true, message: 'Máquina creada', severity: 'success' });
      }
      fetchMaquinas();
      handleCloseModal();
    } catch {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/maquinas/${id}`);
      setSnackbar({ open: true, message: 'Máquina eliminada', severity: 'success' });
      fetchMaquinas();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
    setDeleteId(null);
  };

  return (
    <Box p={3} sx={{ background: '#fafbfc', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222', mb: 3 }}>Gestión de Máquinas</Typography>
      <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 'none', bgcolor: '#fff', borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: '#f6fafd', borderColor: 'primary.main' } }}>
        Agregar Máquina
      </Button>
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff' }}>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Número</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Marca</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Modelo</TableCell>
              <TableCell align="right" sx={{ color: '#888', fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maquinas.map((m) => (
              <TableRow key={m.id} sx={{ background: '#fff', transition: 'background 0.2s', '&:hover': { background: '#e9f7fa' } }}>
                <TableCell>{m.numero}</TableCell>
                <TableCell>{m.marca}</TableCell>
                <TableCell>{m.modelo}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar"><IconButton onClick={() => handleOpenModal(m)}><EditIcon sx={{ color: '#888' }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar"><IconButton sx={{ color: '#b71c1c' }} onClick={() => setDeleteId(m.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fff', boxShadow: '0 2px 12px 0 #e0e0e0' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#222' }}>{editId ? 'Editar Máquina' : 'Agregar Máquina'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Número de máquina"
            value={form.numero}
            onChange={e => setForm({ ...form, numero: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            label="Marca"
            value={form.marca}
            onChange={e => setForm({ ...form, marca: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            label="Modelo"
            value={form.modelo}
            onChange={e => setForm({ ...form, modelo: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ borderRadius: 2, color: '#888', bgcolor: '#f6fafd', boxShadow: 'none', '&:hover': { bgcolor: '#ececec' } }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 600, bgcolor: 'primary.main', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#3ed6d6' } }}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>¿Eliminar máquina?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar esta máquina?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button onClick={() => handleDelete(deleteId)} color="error">Eliminar</Button>
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