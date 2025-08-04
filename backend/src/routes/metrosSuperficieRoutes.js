const express = require('express');
const router = express.Router();
const metrosSuperficieController = require('../controllers/metrosSuperficieController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas principales CRUD (deben ir PRIMERO)
router.get('/', metrosSuperficieController.listar);

// Rutas especializadas (deben ir ANTES de las rutas con parámetros dinámicos)
router.get('/estadisticas/quincena', metrosSuperficieController.obtenerEstadisticasQuincena);
router.get('/estadisticas/mes-anterior', metrosSuperficieController.obtenerMesAnterior);
router.get('/estadisticas', metrosSuperficieController.obtenerEstadisticas);
router.get('/mes-anterior', metrosSuperficieController.obtenerMesAnterior);
router.get('/reporte-detallado', metrosSuperficieController.obtenerReporteDetallado);
router.get('/sectores/:zona_id', metrosSuperficieController.obtenerSectoresPorZona);

// Rutas con parámetros dinámicos (deben ir AL FINAL)
router.get('/:id', metrosSuperficieController.obtener);
router.post('/', requireRole(['administrador']), metrosSuperficieController.crear);
router.put('/:id', requireRole(['administrador']), metrosSuperficieController.actualizar);
router.delete('/:id', requireRole(['administrador']), metrosSuperficieController.eliminar);

module.exports = router;