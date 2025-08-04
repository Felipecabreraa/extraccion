import React, { useEffect, useState } from 'react';
import BarredorForm from '../components/BarredorForm';
import BarredoresTable from '../components/BarredoresTable';
import { getBarredores, addBarredor, updateBarredor, deleteBarredor } from '../api/barredoresApi';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import axios from '../api/axios';

export default function PlanillaBarredores({ planillaId, onClose }) {
  const [barredores, setBarredores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBarredores, setSelectedBarredores] = useState([]);

  useEffect(() => {
    setLoading(true);
    getBarredores(planillaId)
      .then(res => setBarredores(res.data))
      .catch(() => setError('Error al cargar barredores'))
      .finally(() => setLoading(false));
    
    // Obtener barredores creados en el panel de control (catálogo)
    axios.get('/barredores-catalogo')
      .then(res => setSelectedBarredores(res.data))
      .catch(() => setSelectedBarredores([]));
  }, [planillaId]);

  const handleAdd = (nuevo) => {
    addBarredor(nuevo)
      .then(() => getBarredores(planillaId).then(res => setBarredores(res.data)))
      .catch(() => setError('Error al agregar barredor'));
  };

  const handleEdit = (id, editado) => {
    updateBarredor(id, editado)
      .then(() => getBarredores(planillaId).then(res => setBarredores(res.data)))
      .catch(() => setError('Error al editar barredor'));
  };

  const handleDelete = (id) => {
    deleteBarredor(id)
      .then(() => getBarredores(planillaId).then(res => setBarredores(res.data)))
      .catch(() => setError('Error al eliminar barredor'));
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>Agregar Barredores a Planilla #{planillaId}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <BarredorForm planillaId={planillaId} barredoresDisponibles={selectedBarredores} onAdd={handleAdd} />
      {loading ? <CircularProgress /> :
        <BarredoresTable barredores={barredores} onDelete={handleDelete} onEdit={handleEdit} />
      }
    </Box>
  );
} 