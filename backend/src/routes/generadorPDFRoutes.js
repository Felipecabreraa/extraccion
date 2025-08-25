const express = require('express');
const router = express.Router();
const generadorPDFController = require('../controllers/generadorPDFController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Generar PDF
router.post('/generar', generadorPDFController.generarPDF);

// Listar PDFs generados
router.get('/listar', generadorPDFController.listarPDFs);

// Obtener estadísticas
router.get('/estadisticas', generadorPDFController.obtenerEstadisticas);

// Descargar PDF específico
router.get('/descargar/:fileName', generadorPDFController.descargarPDF);

// Eliminar PDF específico
router.delete('/eliminar/:fileName', generadorPDFController.eliminarPDF);

module.exports = router;
