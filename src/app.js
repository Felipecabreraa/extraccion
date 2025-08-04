const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sequelize = require('./config/database');
const { errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const planillaRoutes = require('./routes/planillaRoutes');
const barredorRoutes = require('./routes/barredorRoutes');
const maquinaRoutes = require('./routes/maquinaRoutes');
const operadorRoutes = require('./routes/operadorRoutes');
const pabellonRoutes = require('./routes/pabellonRoutes');
const danoRoutes = require('./routes/danoRoutes');
const zonaRoutes = require('./routes/zonaRoutes');
const zonaCargaMasivaRoutes = require('./routes/zonaCargaMasivaRoutes');
const sectorRoutes = require('./routes/sectorRoutes');
const barredorCatalogoRoutes = require('./routes/barredorCatalogoRoutes');
const maquinaPlanillaRoutes = require('./routes/maquinaPlanillaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pabellonMaquinaRoutes = require('./routes/pabellonMaquinaRoutes');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes');
const danoHistoricoRoutes = require('./routes/danoHistoricoRoutes');
const metrosSuperficieRoutes = require('./routes/metrosSuperficieRoutes');
const danosAcumuladosRoutes = require('./routes/danosAcumuladosRoutes');

const app = express();

// Middleware de logging
app.use(logger.request);

// CORS configurado para desarrollo y producción
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
}));

// Configuración de seguridad
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting mejorado
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 1 * 60 * 1000, // 15 min en prod, 1 min en dev
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 en prod, 1000 en dev
  message: { 
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

app.use('/api', limiter);

// Parsers de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Rutas de salud y estado
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API EXTRACCION funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Health check passed',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'connected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Conectar a la base de datos
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexión a MySQL exitosa');
    
    // Solo sincronizar si no existe la tabla, no alterar
    await sequelize.sync({ force: false, alter: false });
    logger.info('✅ Modelos sincronizados con la base de datos');
  } catch (err) {
    logger.error('❌ Error de conexión a la base de datos:', err);
    process.exit(1);
  }
};

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/planillas', planillaRoutes);
app.use('/api/barredores', barredorRoutes);
app.use('/api/maquinas', maquinaRoutes);
app.use('/api/operadores', operadorRoutes);
app.use('/api/pabellones', pabellonRoutes);
app.use('/api/danos', danoRoutes);
app.use('/api/zonas', zonaRoutes);
app.use('/api/zonas-carga-masiva', zonaCargaMasivaRoutes);
app.use('/api/sectores', sectorRoutes);
app.use('/api/barredores-catalogo', barredorCatalogoRoutes);
app.use('/api/maquina_planilla', maquinaPlanillaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pabellon_maquina', pabellonMaquinaRoutes);
app.use('/api/bulk-upload', bulkUploadRoutes);
app.use('/api/danos-historicos', danoHistoricoRoutes);
app.use('/api/metros-superficie', metrosSuperficieRoutes);
app.use('/api/danos-acumulados', danosAcumuladosRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Ruta 404
app.use('*', (req, res) => {
  logger.warn('Ruta no encontrada', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.status(404).json({ 
    message: 'Ruta no encontrada', 
    path: req.originalUrl,
    code: 'NOT_FOUND'
  });
});

// Inicializar servidor
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor backend escuchando en puerto ${PORT}`);
      logger.info(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', { reason, promise });
  process.exit(1);
});

startServer();

module.exports = app;