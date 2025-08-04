import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from '../api/axios';

export default function BarredoresCatalogoTable() {
  const [barredores, setBarredores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, barredor: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, barredor: null });
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar barredores
  const cargarBarredores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/barredores-catalogo');
      setBarredores(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los barredores');
      console.error('Error cargando barredores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBarredores();
  }, []);

  // Filtrar barredores por búsqueda
  const barredoresFiltrados = barredores.filter(barredor =>
    `${barredor.nombre} ${barredor.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir diálogo de edición
  const abrirEditar = (barredor) => {
    setEditDialog({ open: true, barredor: { ...barredor } });
  };

  // Cerrar diálogo de edición
  const cerrarEditar = () => {
    setEditDialog({ open: false, barredor: null });
  };

  // Guardar cambios
  const guardarCambios = async () => {
    try {
      await axios.put(`/barredores-catalogo/${editDialog.barredor.id}`, editDialog.barredor);
      setSuccessMessage('Barredor actualizado correctamente');
      cerrarEditar();
      cargarBarredores();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar el barredor');
      console.error('Error actualizando barredor:', err);
    }
  };

  // Abrir diálogo de eliminación
  const abrirEliminar = (barredor) => {
    setDeleteDialog({ open: true, barredor });
  };

  // Cerrar diálogo de eliminación
  const cerrarEliminar = () => {
    setDeleteDialog({ open: false, barredor: null });
  };

  // Eliminar barredor
  const eliminarBarredor = async () => {
    try {
      await axios.delete(`/barredores-catalogo/${deleteDialog.barredor.id}`);
      setSuccessMessage('Barredor eliminado correctamente');
      cerrarEliminar();
      cargarBarredores();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al eliminar el barredor');
      console.error('Error eliminando barredor:', err);
    }
  };



  if (loading) {
    return (
      <Box p={3}>
        <Typography>Cargando barredores...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Catálogo de Barredores</Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Total de barredores: {barredores.length}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/bulk-upload?entidad=barredores'}
          >
            Agregar Barredores
          </Button>
        </Box>

        {/* Búsqueda */}
        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        {/* Tabla */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {barredoresFiltrados.map((barredor) => (
              <TableRow key={barredor.id}>
                <TableCell>{barredor.id}</TableCell>
                <TableCell>{barredor.nombre}</TableCell>
                <TableCell>{barredor.apellido}</TableCell>
                <TableCell>
                  <Chip 
                    label="Activo" 
                    size="small" 
                    color="success" 
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton 
                      color="primary" 
                      onClick={() => abrirEditar(barredor)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton 
                      color="error" 
                      onClick={() => abrirEliminar(barredor)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {barredoresFiltrados.length === 0 && (
          <Box textAlign="center" py={3}>
            <Typography color="text.secondary">
              {searchTerm ? 'No se encontraron barredores con esa búsqueda' : 'No hay barredores en el catálogo'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Diálogo de edición */}
      <Dialog open={editDialog.open} onClose={cerrarEditar} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Barredor</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Nombre"
              value={editDialog.barredor?.nombre || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                barredor: { ...editDialog.barredor, nombre: e.target.value }
              })}
              fullWidth
              required
            />
            <TextField
              label="Apellido"
              value={editDialog.barredor?.apellido || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                barredor: { ...editDialog.barredor, apellido: e.target.value }
              })}
              fullWidth
              required
            />

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarEditar}>Cancelar</Button>
          <Button 
            onClick={guardarCambios} 
            variant="contained"
            disabled={!editDialog.barredor?.nombre || !editDialog.barredor?.apellido}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={deleteDialog.open} onClose={cerrarEliminar}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar al barredor{' '}
            <strong>{deleteDialog.barredor?.nombre} {deleteDialog.barredor?.apellido}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarEliminar}>Cancelar</Button>
          <Button onClick={eliminarBarredor} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 