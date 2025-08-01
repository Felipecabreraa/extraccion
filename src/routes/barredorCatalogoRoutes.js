const express = require('express');
const router = express.Router();
const barredorCatalogoController = require('../controllers/barredorCatalogoController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/', barredorCatalogoController.listar);
router.get('/:id', barredorCatalogoController.obtener);
router.post('/', barredorCatalogoController.crear);
router.post('/carga-masiva', barredorCatalogoController.cargaMasiva);
router.put('/:id', barredorCatalogoController.actualizar);
router.delete('/:id', barredorCatalogoController.eliminar);

module.exports = router; 