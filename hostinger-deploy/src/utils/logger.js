const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Función para formatear fecha
const formatDate = (date) => {
  return date.toISOString().replace('T', ' ').substr(0, 19);
};

// Función para escribir en archivo
const writeToFile = (level, message, data = {}) => {
  const timestamp = formatDate(new Date());
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };

  const logFile = path.join(logsDir, `${level}.log`);
  const logLine = JSON.stringify(logEntry) + '\n';

  fs.appendFileSync(logFile, logLine);
};

// Función para escribir en consola
const writeToConsole = (level, message, data = {}) => {
  const timestamp = formatDate(new Date());
  const emoji = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '🔴',
    debug: '🐛'
  };

  console.log(`${emoji[level]} [${timestamp}] ${level.toUpperCase()}: ${message}`);
  
  if (Object.keys(data).length > 0) {
    console.log('   📋 Detalles:', JSON.stringify(data, null, 2));
  }
};

// Logger principal
const logger = {
  info: (message, data = {}) => {
    writeToConsole('info', message, data);
    writeToFile('info', message, data);
  },

  warn: (message, data = {}) => {
    writeToConsole('warn', message, data);
    writeToFile('warn', message, data);
  },

  error: (message, data = {}) => {
    writeToConsole('error', message, data);
    writeToFile('error', message, data);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      writeToConsole('debug', message, data);
      writeToFile('debug', message, data);
    }
  },

  // Logger específico para requests HTTP
  request: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        user: req.usuario?.id || 'anonymous'
      };

      if (res.statusCode >= 400) {
        logger.warn(`HTTP ${req.method} ${req.originalUrl}`, logData);
      } else {
        logger.info(`HTTP ${req.method} ${req.originalUrl}`, logData);
      }
    });

    next();
  },

  // Logger para errores de base de datos
  database: (operation, table, data = {}) => {
    logger.info(`DB ${operation} on ${table}`, data);
  },

  // Logger para autenticación
  auth: (action, userId, success, details = {}) => {
    const logData = {
      action,
      userId,
      success,
      ...details
    };

    if (success) {
      logger.info(`Auth ${action}`, logData);
    } else {
      logger.warn(`Auth ${action} failed`, logData);
    }
  }
};

module.exports = logger; 