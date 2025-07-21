const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, requireRole(['administrador']), usuarioController.listar);
router.get('/:id', authenticateToken, requireRole(['administrador']), usuarioController.obtener);
router.post('/', authenticateToken, requireRole(['administrador']), usuarioController.crear);
router.put('/:id', authenticateToken, requireRole(['administrador']), usuarioController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), usuarioController.eliminar);

module.exports = router; 