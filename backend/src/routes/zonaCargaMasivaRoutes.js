const express = require('express');
const router = express.Router();
const multer = require('multer');
const zonaCargaMasivaController = require('../controllers/zonaCargaMasivaController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');


// Configuración de multer para archivos CSV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'zonas-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Rutas de carga masiva
router.get('/descargar-plantilla', authenticateToken, requireRole(['administrador']), zonaCargaMasivaController.descargarPlantilla);
router.post('/cargar', authenticateToken, requireRole(['administrador']), upload.single('archivo'), zonaCargaMasivaController.cargarMasiva);
router.get('/estadisticas', authenticateToken, requireRole(['administrador', 'supervisor']), zonaCargaMasivaController.obtenerEstadisticasCarga);

module.exports = router; 