import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function BarredoresTable({ barredores, onDelete, onEdit }) {
  const [editIdx, setEditIdx] = useState(-1);
  const [editData, setEditData] = useState({});
  const [deleteIdx, setDeleteIdx] = useState(-1);

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditData(barredores[idx]);
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleEditSave = () => {
    onEdit(editData.id, editData);
    setEditIdx(-1);
  };

  return (
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
          {barredores.map((b, idx) => (
            <TableRow key={b.id}>
              <TableCell>
                {b.BarredorCatalogo ? `${b.BarredorCatalogo.nombre} ${b.BarredorCatalogo.apellido}` : ''}
              </TableCell>
              <TableCell>
                {editIdx === idx ? (
                  <TextField
                    type="number"
                    value={editData.dias}
                    onChange={e => handleEditChange('dias', e.target.value)}
                    size="small"
                  />
                ) : b.dias}
              </TableCell>
              <TableCell>
                {editIdx === idx ? (
                  <TextField
                    type="number"
                    value={editData.horas_extras}
                    onChange={e => handleEditChange('horas_extras', e.target.value)}
                    size="small"
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
          ))}
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
  );
} 