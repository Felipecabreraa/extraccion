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

// NUEVAS RUTAS DE PRUEBA PARA VISTA UNIFICADA (sin autenticación)
router.get('/unified/test-stats', dashboardController.getUnifiedStats);
router.get('/unified/test-metrics', dashboardController.getDashboardMetrics);
router.get('/unified/test-charts', dashboardController.getChartData);

// NUEVAS RUTAS DE PRUEBA PARA ANÁLISIS PREDICTIVO (sin autenticación)
router.get('/danos/test-predictive', dashboardController.getDanoPredictiveAnalysis);

// NUEVA RUTA DE PRUEBA PARA DAÑOS POR OPERADOR (sin autenticación)
router.get('/danos/test-por-operador', dashboardController.getDanoStatsPorOperador);

// NUEVAS RUTAS DE PRUEBA PARA DESGLOSES ESPECÍFICOS (sin autenticación)
router.get('/danos/test-por-operador-consolidado', dashboardController.getDanoStatsPorOperadorConsolidado);
router.get('/danos/test-por-operador-hembra', dashboardController.getDanoStatsPorOperadorHembra);
router.get('/danos/test-por-operador-macho', dashboardController.getDanoStatsPorOperadorMacho);

// NUEVA RUTA DE PRUEBA PARA ANÁLISIS PETRÓLEO (sin autenticación)
router.get('/petroleo/test-metrics', dashboardController.getPetroleoMetrics);

// NUEVA RUTA DE PRUEBA PARA INVESTIGAR SECTORES SIN CLASIFICAR (sin autenticación)
router.get('/danos/test-sectores-sin-clasificar', dashboardController.investigarSectoresSinClasificar);

// RUTAS DE PRUEBA PARA DAÑOS ACUMULADOS (sin autenticación)
router.get('/danos-acumulados', dashboardController.getDanosAcumulados);
router.get('/danos-acumulados/vista-raw', dashboardController.getVistaRaw);
router.get('/danos-acumulados/tabla-raw', dashboardController.getTablaRaw);
router.post('/danos-acumulados/registro', dashboardController.crearActualizarDanosMensual);

// Aplicar autenticación al resto de rutas
router.use(authenticateToken);

router.get('/metrics', dashboardController.getDashboardMetrics);
router.get('/charts', dashboardController.getChartData);
router.get('/danos', dashboardController.getDanoStats);
router.get('/danos/predictive', dashboardController.getDanoPredictiveAnalysis);
router.get('/danos/por-operador', dashboardController.getDanoStatsPorOperador);
router.get('/danos/por-operador-consolidado', dashboardController.getDanoStatsPorOperadorConsolidado);
router.get('/danos/por-operador-hembra', dashboardController.getDanoStatsPorOperadorHembra);
router.get('/danos/por-operador-macho', dashboardController.getDanoStatsPorOperadorMacho);
router.post('/clear-cache', dashboardController.clearCache);

// NUEVAS RUTAS UNIFICADAS (con autenticación)
router.get('/unified/stats', dashboardController.getUnifiedStats);

// NUEVA RUTA PARA ANÁLISIS PETRÓLEO (con autenticación)
router.get('/petroleo/metrics', dashboardController.getPetroleoMetrics);

// Rutas para datos históricos (delegadas al controlador específico)
router.get('/danos/combinadas', danoHistoricoController.getDanoStatsCombinadas);
router.get('/danos/historicos', danoHistoricoController.getDanoStatsHistoricos);
router.get('/danos/comparar', danoHistoricoController.compararAnios);
router.get('/danos/top-operadores', danoHistoricoController.getTop10OperadoresDanos);

module.exports = router; 