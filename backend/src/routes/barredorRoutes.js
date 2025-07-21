const express = require('express');
const router = express.Router();
const barredorController = require('../controllers/barredorController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), barredorController.listar);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), barredorController.obtener);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), barredorController.crear);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), barredorController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), barredorController.eliminar);

module.exports = router; 