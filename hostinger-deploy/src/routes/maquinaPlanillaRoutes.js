const express = require('express');
const router = express.Router();
const maquinaPlanillaController = require('../controllers/maquinaPlanillaController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaPlanillaController.listar);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaPlanillaController.obtener);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaPlanillaController.crear);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaPlanillaController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), maquinaPlanillaController.eliminar);

module.exports = router; 