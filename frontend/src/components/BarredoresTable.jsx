import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField, MenuItem, Box, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function BarredoresTable({ barredores, onDelete, onEdit }) {
  const [editIdx, setEditIdx] = useState(-1);
  const [editData, setEditData] = useState({});
  const [deleteIdx, setDeleteIdx] = useState(-1);

  // Contar registros con datos inválidos para mostrar en el mensaje
  const registrosInvalidos = barredores.filter(b => {
    const diasTrabajadosInvalidos = b.dias < 1;
    const horasExtrasInvalidas = b.dias === 0 && b.horas_extras > 0;
    return horasExtrasInvalidas || diasTrabajadosInvalidos;
  }).length;

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditData(barredores[idx]);
  };

  const handleEditChange = (field, value) => {
    // Si se está cambiando los días trabajados y se selecciona 0, limpiar horas extras
    if (field === 'dias' && (value === '0' || value === 0)) {
      setEditData({ ...editData, [field]: value, horas_extras: '' });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleEditSave = () => {
    // Validar que los días trabajados sean al menos 1
    if (parseInt(editData.dias) < 1) {
      alert('Los días trabajados deben ser al menos 1');
      return;
    }
    
    // Validar que no se puedan guardar horas extras cuando los días trabajados son 0
    if ((editData.dias === '0' || editData.dias === 0) && editData.horas_extras !== '' && editData.horas_extras !== '0') {
      alert('No se pueden registrar horas extras cuando el barredor no trabajó ningún día');
      return;
    }
    
    onEdit(editData.id, editData);
    setEditIdx(-1);
  };

  return (
    <>
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
            <strong>Nota:</strong> {registrosInvalidos} registro(s) marcado(s) en amarillo tienen datos invalidos (dias trabajados menor a 1 o horas extras con 0 dias trabajados).
          </Typography>
        </Box>
      )}
      <TableContainer>
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre Barredor</TableCell>
            <TableCell>Días Trabajados</TableCell>
            <TableCell>Horas Extras</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {barredores.map((b, idx) => {
            const diasTrabajadosInvalidos = b.dias < 1;
            const horasExtrasInvalidas = b.dias === 0 && b.horas_extras > 0;
            
            return (
              <TableRow 
                key={b.id}
                sx={{
                  backgroundColor: horasExtrasInvalidas || diasTrabajadosInvalidos ? '#fff3cd' : 'inherit',
                  '&:hover': {
                    backgroundColor: horasExtrasInvalidas || diasTrabajadosInvalidos ? '#ffeaa7' : '#f5f5f5'
                  }
                }}
              >
              <TableCell>
                {b.BarredorCatalogo ? `${b.BarredorCatalogo.nombre} ${b.BarredorCatalogo.apellido}` : ''}
              </TableCell>
              <TableCell>
                {editIdx === idx ? (
                  <TextField
                    select
                    value={editData.dias}
                    onChange={e => handleEditChange('dias', e.target.value)}
                    size="small"
                    inputProps={{ min: 1 }}
                    error={parseInt(editData.dias) < 1}
                    helperText={
                      parseInt(editData.dias) < 1 
                        ? "Mínimo 1 día"
                        : ""
                    }
                  >
                    <MenuItem value="">-- Seleccione --</MenuItem>
                    {[1,2].map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                ) : b.dias}
              </TableCell>
              <TableCell>
                {editIdx === idx ? (
                  <TextField
                    type="number"
                    value={editData.horas_extras}
                    onChange={e => handleEditChange('horas_extras', e.target.value)}
                    size="small"
                    disabled={editData.dias === '0' || editData.dias === 0}
                    helperText={
                      editData.dias === '0' || editData.dias === 0 
                        ? "No disponible"
                        : ""
                    }
                  />
                ) : b.horas_extras}
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
                    <IconButton onClick={() => setDeleteIdx(idx)}><DeleteIcon /></IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          );
        })}
        </TableBody>
      </Table>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteIdx !== -1} onClose={() => setDeleteIdx(-1)}>
        <DialogTitle>¿Eliminar barredor?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este barredor de la planilla?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIdx(-1)}>Cancelar</Button>
          <Button
            onClick={() => {
              onDelete(barredores[deleteIdx].id);
              setDeleteIdx(-1);
            }}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      </TableContainer>
    </>
  );
} 