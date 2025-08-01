const express = require('express');
const router = express.Router();
const zonaController = require('../controllers/zonaController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), zonaController.listar);
router.get('/estadisticas-tipo', authenticateToken, requireRole(['administrador', 'supervisor']), zonaController.estadisticasPorTipo);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), zonaController.obtener);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), zonaController.crear);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), zonaController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), zonaController.eliminar);

module.exports = router; 