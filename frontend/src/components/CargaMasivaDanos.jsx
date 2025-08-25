import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  AlertTitle,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Upload as UploadIcon, CheckCircle } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import api from '../api/axios'; // Usar la instancia configurada

const CargaMasivaDanos = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validar estructura del archivo
        const requiredColumns = ['anio', 'mes', 'valor_real', 'valor_ppto'];
        const firstRow = jsonData[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
          setError(`Columnas faltantes: ${missingColumns.join(', ')}. Las columnas requeridas son: anio, mes, valor_real, valor_ppto`);
          return;
        }

        setData(jsonData);
        setPreview(jsonData.slice(0, 5)); // Mostrar solo los primeros 5 registros
      } catch (err) {
        setError('Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const formatCurrency = (value) => {
    if (!value || value === 0) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getMonthName = (month) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[month - 1] || 'Desconocido';
  };

  const handleUpload = async () => {
    if (!data.length) return;

    setLoading(true);
    setError(null);

    try {
      const promises = data.map(row => 
        api.post('/danos-acumulados/registro', {
          anio: parseInt(row.anio),
          mes: parseInt(row.mes),
          valor_real: parseInt(row.valor_real) || 0,
          valor_ppto: parseInt(row.valor_ppto) || 0
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.data.success).length;
      
      if (successCount === data.length) {
        onSuccess();
        onClose();
        setFile(null);
        setData([]);
        setPreview([]);
      } else {
        setError(`Se procesaron ${successCount} de ${data.length} registros. Algunos registros no se pudieron guardar.`);
      }
    } catch (err) {
      setError('Error al cargar los datos. Verifica que los datos sean válidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Carga Masiva de Datos de Daños
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sube un archivo Excel (.xlsx) con las siguientes columnas:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip label="anio" color="primary" size="small" />
            <Chip label="mes" color="primary" size="small" />
            <Chip label="valor_real" color="primary" size="small" />
            <Chip label="valor_ppto" color="primary" size="small" />
          </Box>
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            disabled={loading}
          >
            Seleccionar Archivo Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
          
          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="success.main">
                <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
                Archivo seleccionado: {file.name}
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {preview.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Vista Previa ({preview.length} de {data.length} registros)
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Año</TableCell>
                    <TableCell>Mes</TableCell>
                    <TableCell align="right">Valor Real</TableCell>
                    <TableCell align="right">Valor Presupuesto</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.anio}</TableCell>
                      <TableCell>{getMonthName(row.mes)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.valor_real)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.valor_ppto)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="Válido" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total de registros a procesar: {data.length}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!data.length || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <UploadIcon />}
        >
          {loading ? 'Procesando...' : 'Cargar Datos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CargaMasivaDanos; 