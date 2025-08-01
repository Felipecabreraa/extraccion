const express = require('express');
const router = express.Router();
const bulkUploadController = require('../controllers/bulkUploadController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


// Rutas para carga masiva - solo administradores
router.post('/zonas', authenticateToken, requireRole(['administrador']), bulkUploadController.uploadZonas);
router.post('/sectores', authenticateToken, requireRole(['administrador']), bulkUploadController.uploadSectores);
router.post('/pabellones', authenticateToken, requireRole(['administrador']), bulkUploadController.uploadPabellones);
router.post('/maquinas', authenticateToken, requireRole(['administrador']), bulkUploadController.uploadMaquinas);
router.post('/operadores', authenticateToken, requireRole(['administrador']), bulkUploadController.uploadOperadores);
router.post('/usuarios', authenticateToken, requireRole(['administrador']), bulkUploadController.uploadUsuarios);
router.post('/barredores-catalogo', authenticateToken, requireRole(['administrador']), bulkUploadController.uploadBarredoresCatalogo);

// Ruta para obtener plantillas - accesible para administradores y supervisores
router.get('/templates/:entity', authenticateToken, requireRole(['administrador', 'supervisor']), bulkUploadController.getTemplates);

module.exports = router; 