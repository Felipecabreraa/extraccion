const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sectorController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


router.get('/', authenticateToken, requireRole(['administrador', 'supervisor']), sectorController.listar);
router.get('/descargar-plantilla', authenticateToken, requireRole(['administrador', 'supervisor']), sectorController.descargarPlantilla);
router.get('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), sectorController.obtener);
router.post('/', authenticateToken, requireRole(['administrador', 'supervisor']), sectorController.crear);
router.post('/carga-masiva', authenticateToken, requireRole(['administrador']), sectorController.cargaMasiva);
router.put('/:id', authenticateToken, requireRole(['administrador', 'supervisor']), sectorController.actualizar);
router.delete('/:id', authenticateToken, requireRole(['administrador']), sectorController.eliminar);

module.exports = router; 