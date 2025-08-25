const express = require('express');
const router = express.Router();
const generadorPDFController = require('../controllers/generadorPDFControllerSimple');

// Rutas sin autenticación para pruebas
router.post('/generar', generadorPDFController.generarPDF);
router.get('/listar', generadorPDFController.listarPDFs);
router.get('/estadisticas', generadorPDFController.obtenerEstadisticas);
router.get('/descargar/:fileName', generadorPDFController.descargarPDF);
router.delete('/eliminar/:fileName', generadorPDFController.eliminarPDF);

module.exports = router;
