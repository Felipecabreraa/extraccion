const express = require('express');
const router = express.Router();
const danoHistoricoController = require('../controllers/danoHistoricoController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// GET /api/dashboard/danos/combinadas - Estadísticas combinadas (actuales + históricas)
router.get('/combinadas', authenticateToken, danoHistoricoController.getDanoStatsCombinadas);

// GET /api/dashboard/danos/historicos - Solo datos históricos del 2024
router.get('/historicos', authenticateToken, danoHistoricoController.getDanoStatsHistoricos);

// GET /api/dashboard/danos/comparar - Comparar años
router.get('/comparar', authenticateToken, danoHistoricoController.compararAnios);

// GET /api/dashboard/danos/top-operadores - Top 10 operadores con más daños
router.get('/top-operadores', authenticateToken, danoHistoricoController.getTop10OperadoresDanos);

// GET /api/dashboard/danos/datos-completos - Datos completos con queries específicas
router.get('/datos-completos', authenticateToken, danoHistoricoController.getDatosCompletos);

// RUTA DE PRUEBA SIN AUTENTICACIÓN (solo para desarrollo)
router.get('/test-historicos', danoHistoricoController.getDanoStatsHistoricos);
router.get('/test-top-operadores', danoHistoricoController.getTop10OperadoresDanos);
router.get('/test-datos-completos', danoHistoricoController.getDatosCompletos);

module.exports = router; 