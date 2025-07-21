const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const danoHistoricoController = require('../controllers/danoHistoricoController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// RUTAS DE PRUEBA SIN AUTENTICACIÓN (solo para desarrollo)
router.get('/danos/test-historicos', danoHistoricoController.getDanoStatsHistoricos);
router.get('/danos/test-combinadas', danoHistoricoController.getDanoStatsCombinadas);
router.get('/danos/test-comparar', danoHistoricoController.compararAnios);
router.get('/danos/test-top-operadores', danoHistoricoController.getTop10OperadoresDanos);
router.get('/danos/por-zona', danoHistoricoController.getDatosPorZona);

// Aplicar autenticación al resto de rutas
router.use(authenticateToken);

router.get('/metrics', dashboardController.getDashboardMetrics);
router.get('/charts', dashboardController.getChartData);
router.get('/danos', dashboardController.getDanoStats);
router.post('/clear-cache', dashboardController.clearCache);

// Rutas para datos históricos (delegadas al controlador específico)
router.get('/danos/combinadas', danoHistoricoController.getDanoStatsCombinadas);
router.get('/danos/historicos', danoHistoricoController.getDanoStatsHistoricos);
router.get('/danos/comparar', danoHistoricoController.compararAnios);
router.get('/danos/top-operadores', danoHistoricoController.getTop10OperadoresDanos);

module.exports = router; 