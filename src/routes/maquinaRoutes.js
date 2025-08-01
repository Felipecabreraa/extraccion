const express = require('express');
const router = express.Router();
const maquinaController = require('../controllers/maquinaController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaController.listar);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaController.crear);
router.post('/carga-masiva', authenticateToken, requireRole(['administrador']), maquinaController.cargaMasiva);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaController.obtener);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), maquinaController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), maquinaController.eliminar);

module.exports = router; 