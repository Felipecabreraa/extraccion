const express = require('express');
const router = express.Router();
const generadorPDFSimpleController = require('../controllers/generadorPDFSimpleController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Rutas para generador de PDF simple
router.post('/generar', authenticateToken, generadorPDFSimpleController.generar);
router.post('/generar-personalizado', authenticateToken, generadorPDFSimpleController.generarPersonalizado);
router.get('/probar', authenticateToken, generadorPDFSimpleController.probar);

module.exports = router;
