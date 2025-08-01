const express = require('express');
const router = express.Router();
const operadorController = require('../controllers/operadorController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


// RUTA DE CARGA MASIVA ANTES DE LAS RUTAS CON PARÁMETROS
router.post('/carga-masiva', authenticateToken, requireRole(['administrador']), operadorController.cargaMasiva);

router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), operadorController.listar);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), operadorController.obtener);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), operadorController.crear);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), operadorController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), operadorController.eliminar);

module.exports = router; 