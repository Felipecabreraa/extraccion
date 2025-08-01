const express = require('express');
const router = express.Router();
const pabellonMaquinaController = require('../controllers/pabellonMaquinaController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), pabellonMaquinaController.listar);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), pabellonMaquinaController.crear);
router.delete('/:id', authenticateToken, requireRole(['administrador']), pabellonMaquinaController.eliminar);

module.exports = router; 