const express = require('express');
const router = express.Router();
const planillaController = require('../controllers/planillaController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validationMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas con validación
router.get('/', planillaController.listar);
router.get('/:id', planillaController.obtener);
router.post('/', validate(schemas.planilla), requireRole(['administrador', 'supervisor']), planillaController.crear);
router.put('/:id', validate(schemas.planilla), requireRole(['administrador', 'supervisor']), planillaController.actualizar);
router.delete('/:id', requireRole(['administrador']), planillaController.eliminar);

// Nueva ruta para validar planillas (solo administradores)
router.post('/:id/validar', requireRole(['administrador']), planillaController.validar);

// Ruta para marcar planilla como activa (cuando está completa de datos)
router.post('/:id/marcar-activa', requireRole(['supervisor']), planillaController.marcarActiva);

// Ruta para actualizar automáticamente valores de pabellones limpiados y mt2
router.post('/:id/actualizar-valores', requireRole(['administrador', 'supervisor']), planillaController.actualizarValores);

// Ruta para forzar actualización de campos calculados (pabellones_limpiados y mt2)
router.post('/:id/actualizar-campos-calculados', requireRole(['administrador', 'supervisor']), planillaController.actualizarCamposCalculados);

module.exports = router; 