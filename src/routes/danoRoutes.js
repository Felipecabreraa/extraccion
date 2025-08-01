const express = require('express');
const router = express.Router();
const danoController = require('../controllers/danoController');
const danoStatsController = require('../controllers/danoStatsController');
const danoMetaController = require('../controllers/danoMetaController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Rutas para CRUD de daños
router.post('/', authenticateToken, requireRole(['admin', 'supervisor']), danoController.crear);
router.get('/', authenticateToken, danoController.listar);
router.get('/:id', authenticateToken, danoController.obtener);
router.put('/:id', authenticateToken, requireRole(['admin', 'supervisor']), danoController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['admin']), danoController.eliminar);

// Rutas para estadísticas de daños
router.get('/stats', authenticateToken, danoStatsController.getDanoStats);
router.get('/stats/test', danoStatsController.getDanoStats); // Ruta de prueba sin autenticación

// Rutas para estadísticas por zona
router.get('/stats/por-zona', authenticateToken, danoStatsController.getDanoStatsPorZona);
router.get('/stats/por-zona/test', danoStatsController.getDanoStatsPorZona); // Ruta de prueba sin autenticación

// Rutas para zonas
router.get('/zonas', authenticateToken, danoStatsController.getZonasDisponibles);
router.get('/zonas/test', danoStatsController.getZonasDisponibles); // Ruta de prueba sin autenticación

// Rutas para metas y proyecciones de daños
router.get('/meta/stats', authenticateToken, danoMetaController.getDanoMetaStats);
router.get('/meta/stats/test', danoMetaController.getDanoMetaStats); // Ruta de prueba sin autenticación
router.get('/meta/resumen', authenticateToken, danoMetaController.getDanoMetaResumen);
router.get('/meta/resumen/test', danoMetaController.getDanoMetaResumen); // Ruta de prueba sin autenticación

module.exports = router; 