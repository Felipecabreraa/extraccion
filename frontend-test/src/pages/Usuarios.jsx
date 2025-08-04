import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Tooltip, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axios';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'supervisor'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get('/usuarios');
      setUsuarios(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Error al cargar usuarios', severity: 'error' });
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUsuario(user.id);
      setFormData({ nombre: user.nombre, email: user.email, rol: user.rol, password: '' });
          } else {
        setEditingUsuario(null);
        setFormData({ nombre: '', email: '', rol: 'supervisor', password: '' });
      }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ nombre: '', email: '', rol: 'supervisor', password: '' });
    setEditingUsuario(null);
  };

  const handleSave = async () => {
    try {
      if (editingUsuario) {
        await axios.put(`/usuarios/${editingUsuario}`, { ...formData, password: formData.password || undefined });
        setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      } else {
        await axios.post('/usuarios', formData);
        setSnackbar({ open: true, message: 'Usuario creado', severity: 'success' });
      }
      fetchUsuarios();
      handleCloseModal();
    } catch {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    try {
      await axios.delete(`/usuarios/${id}`);
      setSnackbar({ open: true, message: 'Usuario eliminado', severity: 'success' });
      fetchUsuarios();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  return (
    <Box p={3} sx={{ background: '#fafbfc', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222', mb: 3 }}>Gestión de Usuarios</Typography>
      <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 'none', bgcolor: '#fff', borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: '#f6fafd', borderColor: 'primary.main' } }}>
        Agregar Usuario
      </Button>
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff' }}>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Rol</TableCell>
              <TableCell align="right" sx={{ color: '#888', fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((user, idx) => (
              <TableRow key={user.id} sx={{ background: idx % 2 === 0 ? '#fafbfc' : '#f3f6f9', transition: 'background 0.2s', '&:hover': { background: '#e9f7fa' } }}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.rol}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar"><IconButton onClick={() => handleOpenModal(user)}><EditIcon sx={{ color: '#888' }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar"><IconButton sx={{ color: '#b71c1c' }} onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fff', boxShadow: '0 2px 12px 0 #e0e0e0' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#222' }}>{editingUsuario ? 'Editar Usuario' : 'Agregar Usuario'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            margin="dense"
            type="email"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <TextField
            select
            label="Rol"
            value={formData.rol}
            onChange={e => setFormData({ ...formData, rol: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          >
            <MenuItem value="administrador">Administrador</MenuItem>
            <MenuItem value="supervisor">Supervisor</MenuItem>
            <MenuItem value="operador">Operador</MenuItem>
          </TextField>
          <TextField
            label="Contraseña"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            fullWidth
            margin="dense"
            type="password"
            helperText={editingUsuario ? 'Dejar en blanco para no cambiar' : ''}
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