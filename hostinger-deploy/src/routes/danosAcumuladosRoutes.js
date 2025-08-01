const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// ============================================================================
// RUTAS PARA REPORTE DE DAÑOS ACUMULADOS POR VALORES MONETARIOS
// ============================================================================

// Middleware de autenticación para todas las rutas
// router.use(authMiddleware); // Comentado temporalmente para pruebas

// 1. Obtener datos de daños acumulados desde la vista
// GET /api/danos-acumulados
// Query params: anio (opcional, por defecto año actual)
router.get('/', dashboardController.getDanosAcumulados);

// 2. Crear o actualizar registro mensual de daños
// POST /api/danos-acumulados/registro
// Body: { anio, mes, valor_real, valor_ppto }
router.post('/registro', dashboardController.crearActualizarDanosMensual);

// 3. Cargar datos del año anterior como base para el año actual
// POST /api/danos-acumulados/cargar-anio-anterior
// Body: { anio_origen, anio_destino }
router.post('/cargar-anio-anterior', dashboardController.cargarDatosAnioAnterior);

// 4. Calcular variación anual (se ejecuta el 1 de enero del año siguiente)
// POST /api/danos-acumulados/calcular-variacion
// Body: { anio_actual, anio_anterior }
router.post('/calcular-variacion', dashboardController.calcularVariacionAnual);

// 5. Obtener resumen ejecutivo de daños acumulados
// GET /api/danos-acumulados/resumen-ejecutivo
// Query params: anio (opcional, por defecto año actual)
router.get('/resumen-ejecutivo', dashboardController.getResumenEjecutivoDanos);

// 6. Eliminar registro mensual de daños
// DELETE /api/danos-acumulados/registro
// Body: { anio, mes }
router.delete('/registro', dashboardController.eliminarRegistroDanos);

// ============================================================================
// RUTAS PARA GESTIÓN DE MIGRACIÓN DE DAÑOS
// ============================================================================

// 7. Verificar estado de migración
// GET /api/danos-acumulados/verificar-migracion
router.get('/verificar-migracion', dashboardController.verificarMigracion);

// 8. Obtener estado detallado de migración
// GET /api/danos-acumulados/estado-migracion
router.get('/estado-migracion', dashboardController.estadoMigracion);

// 9. Limpiar duplicados de migración
// POST /api/danos-acumulados/limpiar-duplicados
router.post('/limpiar-duplicados', dashboardController.limpiarDuplicados);

// 10. Eliminar registros inválidos de migración
// POST /api/danos-acumulados/eliminar-invalidos
router.post('/eliminar-invalidos', dashboardController.eliminarInvalidos);

// 11. Recalcular totales de migración
// POST /api/danos-acumulados/recalcular-totales
router.post('/recalcular-totales', dashboardController.recalcularTotales);

// 12. Actualizar reporte desde migración
// POST /api/danos-acumulados/actualizar-desde-migracion
// Body: { anio }
router.post('/actualizar-desde-migracion', dashboardController.actualizarDesdeMigracion);

module.exports = router; 