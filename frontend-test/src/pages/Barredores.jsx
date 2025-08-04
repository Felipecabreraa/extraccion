import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Tooltip, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from '../api/axios';
import BarredoresCatalogoTable from '../components/BarredoresCatalogoTable';

export default function Barredores() {
  const [barredores, setBarredores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchBarredores = async () => {
    try {
      const res = await axios.get('/barredores-catalogo');
      setBarredores(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Error al cargar barredores', severity: 'error' });
    }
  };

  useEffect(() => { fetchBarredores(); }, []);

  const handleOpenModal = (barredor = null) => {
    if (barredor) {
      setEditId(barredor.id);
      setForm({ nombre: barredor.nombre, apellido: barredor.apellido });
    } else {
      setEditId(null);
      setForm({ nombre: '', apellido: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm({ nombre: '', apellido: '' });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.apellido) {
      setSnackbar({ open: true, message: 'Completa todos los campos', severity: 'error' });
      return;
    }
    try {
      if (editId) {
        await axios.put(`/barredores-catalogo/${editId}`, form);
        setSnackbar({ open: true, message: 'Barredor actualizado', severity: 'success' });
      } else {
        await axios.post('/barredores-catalogo', form);
        setSnackbar({ open: true, message: 'Barredor creado', severity: 'success' });
      }
      fetchBarredores();
      handleCloseModal();
    } catch {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/barredores-catalogo/${id}`);
      setSnackbar({ open: true, message: 'Barredor eliminado', severity: 'success' });
      fetchBarredores();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
    setDeleteId(null);
  };

  return (
    <Box p={3} sx={{ background: '#fafbfc', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222', mb: 3 }}>Gestión de Barredores</Typography>
      
      {/* Pestañas */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Gestión Individual" />
          <Tab label="Catálogo Completo" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <>
          <Box display="flex" gap={2} mb={3}>
            <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 'none', bgcolor: '#fff', borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: '#f6fafd', borderColor: 'primary.main' } }}>
              Agregar Barredor
            </Button>
            <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={() => window.location.href = '/bulk-upload?entidad=barredores'} sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 'none', bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: '#3ed6d6' } }}>
              Carga Masiva
            </Button>
          </Box>
        </>
      )}
              {activeTab === 0 && (
          <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
            <Table>
              <TableHead>
                          <TableRow sx={{ background: '#fff' }}>
            <TableCell sx={{ color: '#888', fontWeight: 700 }}>Nombre</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 700 }}>Apellido</TableCell>
            <TableCell align="right" sx={{ color: '#888', fontWeight: 700 }}>Acciones</TableCell>
          </TableRow>
              </TableHead>
              <TableBody>
                            {barredores.map((b) => (
              <TableRow key={b.id} sx={{ background: '#fff', transition: 'background 0.2s', '&:hover': { background: '#e9f7fa' } }}>
                <TableCell>{b.nombre}</TableCell>
                <TableCell>{b.apellido}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar"><IconButton onClick={() => handleOpenModal(b)}><EditIcon sx={{ color: '#888' }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar"><IconButton sx={{ color: '#b71c1c' }} onClick={() => setDeleteId(b.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <BarredoresCatalogoTable />
        )}
      <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fff', boxShadow: '0 2px 12px 0 #e0e0e0' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#222' }}>{editId ? 'Editar Barredor' : 'Agregar Barredor'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            label="Apellido"
            value={form.apellido}
            onChange={e => setForm({ ...form, apellido: e.target.value })}
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
        <DialogTitle>¿Eliminar barredor?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este barredor?</Typography>
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