const express = require('express');
const router = express.Router();
const reportePDFController = require('../controllers/reportePDFControllerNuevo');
const reportePDFAcumulativoController = require('../controllers/reportePDFControllerAcumulativo');
const reportePDFCompletoController = require('../controllers/reportePDFControllerCompleto');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Rutas para generación de PDFs
router.get('/informe-diario', authenticateToken, reportePDFController.generarInformeDiario);
router.get('/informe-prueba', authenticateToken, reportePDFController.generarInformePrueba);

// Rutas para informes acumulativos
router.get('/informe-acumulativo', authenticateToken, reportePDFAcumulativoController.generarInformeAcumulativo);
router.get('/informe-acumulativo-prueba', authenticateToken, reportePDFAcumulativoController.generarInformePrueba);

// Rutas para informe completo con todas las secciones
router.get('/informe-completo', authenticateToken, reportePDFCompletoController.generarInformeCompleto);
router.get('/informe-completo-prueba', authenticateToken, reportePDFCompletoController.generarInformePrueba);

module.exports = router;
