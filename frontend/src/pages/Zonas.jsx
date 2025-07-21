import React, { useEffect, useState } from 'react';
import { 
  Button, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, IconButton, 
  FormControl, InputLabel, Select, MenuItem, Chip, Grid, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from '../api/axios';
import ZonaCargaMasiva from '../components/ZonaCargaMasiva';

export default function Zonas() {
  const [zonas, setZonas] = useState([]);
  const [zonasFiltradas, setZonasFiltradas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('HEMBRA');
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filtroTipo, setFiltroTipo] = useState('');
  const [estadisticas, setEstadisticas] = useState([]);
  const [openCargaMasiva, setOpenCargaMasiva] = useState(false);

  const fetchZonas = async () => {
    try {
      const res = await axios.get('/zonas');
      setZonas(res.data);
      setZonasFiltradas(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al cargar zonas', severity: 'error' });
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const res = await axios.get('/zonas/estadisticas-tipo');
      setEstadisticas(res.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  useEffect(() => { 
    fetchZonas(); 
    fetchEstadisticas();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtradas = zonas;
    if (filtroTipo) {
      filtradas = filtradas.filter(zona => zona.tipo === filtroTipo);
    }
    setZonasFiltradas(filtradas);
  }, [zonas, filtroTipo]);

  const handleOpenModal = (zona = null) => {
    if (zona) {
      setEditId(zona.id);
      setNombre(zona.nombre);
      setTipo(zona.tipo || 'HEMBRA');
    } else {
      setEditId(null);
      setNombre('');
      setTipo('HEMBRA');
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNombre('');
    setTipo('HEMBRA');
    setEditId(null);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await axios.put(`/zonas/${editId}`, { nombre, tipo });
        setSnackbar({ open: true, message: 'Zona actualizada', severity: 'success' });
      } else {
        await axios.post('/zonas', { nombre, tipo });
        setSnackbar({ open: true, message: 'Zona creada', severity: 'success' });
      }
      fetchZonas();
      fetchEstadisticas();
      handleCloseModal();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta zona?')) return;
    try {
      await axios.delete(`/zonas/${id}`);
      setSnackbar({ open: true, message: 'Zona eliminada', severity: 'success' });
      fetchZonas();
      fetchEstadisticas();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'HEMBRA' ? <FemaleIcon /> : <MaleIcon />;
  };

  const getTipoColor = (tipo) => {
    return tipo === 'HEMBRA' ? 'secondary' : 'primary';
  };

  return (
    <Box p={3} sx={{ background: '#fafbfc', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222', mb: 3 }}>
        Gestión de Zonas
      </Typography>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {estadisticas.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.tipo}>
            <Card sx={{ 
              background: stat.tipo === 'HEMBRA' ? 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {getTipoIcon(stat.tipo)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>
                    {stat.tipo}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: stat.tipo === 'HEMBRA' ? '#c2185b' : '#1976d2' }}>
                  {stat.cantidad}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Zonas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filtros */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 'none', bgcolor: '#fff', borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: '#f6fafd', borderColor: 'primary.main' } }}>
          Agregar Zona
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary" 
          startIcon={<CloudUploadIcon />} 
          onClick={() => setOpenCargaMasiva(true)}
          sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 'none', bgcolor: '#fff', borderColor: 'secondary.main', color: 'secondary.main', '&:hover': { bgcolor: '#fdf6fd', borderColor: 'secondary.main' } }}
        >
          Carga Masiva
        </Button>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filtrar por Tipo</InputLabel>
          <Select
            value={filtroTipo}
            label="Filtrar por Tipo"
            onChange={(e) => setFiltroTipo(e.target.value)}
            startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="HEMBRA">Hembra</MenuItem>
            <MenuItem value="MACHO">Macho</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 2px 12px 0 #e0e0e0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff' }}>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 700 }}>Tipo</TableCell>
              <TableCell align="right" sx={{ color: '#888', fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zonasFiltradas.map((zona, idx) => (
              <TableRow key={zona.id} sx={{ background: idx % 2 === 0 ? '#fafbfc' : '#f3f6f9', transition: 'background 0.2s', '&:hover': { background: '#e9f7fa' } }}>
                <TableCell>{zona.id}</TableCell>
                <TableCell>{zona.nombre}</TableCell>
                <TableCell>
                  <Chip
                    icon={getTipoIcon(zona.tipo)}
                    label={zona.tipo}
                    color={getTipoColor(zona.tipo)}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton sx={{ color: '#888' }} onClick={() => handleOpenModal(zona)}><EditIcon /></IconButton>
                  <IconButton sx={{ color: '#b71c1c' }} onClick={() => handleDelete(zona.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fff', boxShadow: '0 2px 12px 0 #e0e0e0' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#222' }}>{editId ? 'Editar Zona' : 'Agregar Zona'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Zona"
            fullWidth
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbfc' }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              label="Tipo"
              onChange={(e) => setTipo(e.target.value)}
            >
              <MenuItem value="HEMBRA">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FemaleIcon sx={{ mr: 1 }} />
                  Hembra
                </Box>
              </MenuItem>
              <MenuItem value="MACHO">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MaleIcon sx={{ mr: 1 }} />
                  Macho
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ borderRadius: 2, color: '#888', bgcolor: '#f6fafd', boxShadow: 'none', '&:hover': { bgcolor: '#ececec' } }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600, bgcolor: 'primary.main', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#3ed6d6' } }}>Guardar</Button>
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
      
      {/* Modal de Carga Masiva */}
      <ZonaCargaMasiva
        open={openCargaMasiva}
        onClose={() => setOpenCargaMasiva(false)}
        onSuccess={() => {
          fetchZonas();
          fetchEstadisticas();
        }}
      />
    </Box>
  );
} 