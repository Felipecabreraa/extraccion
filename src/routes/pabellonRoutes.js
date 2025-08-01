const express = require('express');
const router = express.Router();
const pabellonController = require('../controllers/pabellonController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), pabellonController.listar);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), pabellonController.obtener);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), pabellonController.crear);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), pabellonController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), pabellonController.eliminar);

module.exports = router; 