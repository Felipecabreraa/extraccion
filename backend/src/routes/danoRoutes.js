const express = require('express');
const router = express.Router();
const danoController = require('../controllers/danoController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), danoController.listar);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), danoController.obtener);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), danoController.crear);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), danoController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), danoController.eliminar);

module.exports = router; 