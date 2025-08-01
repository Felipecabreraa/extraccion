const errorHandler = (err, req, res, next) => {
  // Log del error con contexto
  console.error('🔴 Error en la aplicación:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    user: req.usuario?.id || 'no-authenticated',
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });

  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Error de validación de datos',
      code: 'VALIDATION_ERROR',
      errors: err.errors.map(e => ({ 
        field: e.path, 
        message: e.message,
        value: e.value 
      }))
    });
  }

  // Errores de restricción única
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'El registro ya existe',
      code: 'DUPLICATE_ENTRY',
      errors: err.errors.map(e => ({ 
        field: e.path, 
        message: `${e.path} ya está en uso`,
        value: e.value 
      }))
    });
  }

  // Errores de clave foránea
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: 'Referencia inválida',
      code: 'FOREIGN_KEY_ERROR',
      detail: `No se puede eliminar/modificar porque está siendo usado en otra tabla`
    });
  }

  // Errores de conexión a base de datos
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      message: 'Error de conexión a la base de datos',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  // Errores de timeout
  if (err.name === 'SequelizeTimeoutError') {
    return res.status(408).json({
      message: 'Tiempo de espera agotado',
      code: 'TIMEOUT_ERROR'
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expirado',
      code: 'EXPIRED_TOKEN'
    });
  }

  // Errores de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'JSON inválido en el cuerpo de la petición',
      code: 'INVALID_JSON'
    });
  }

  // Errores de límite de tamaño
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'Archivo demasiado grande',
      code: 'FILE_TOO_LARGE'
    });
  }

  // Errores de límite de peticiones
  if (err.code === 'LIMIT_REQUESTS') {
    return res.status(429).json({
      message: 'Demasiadas peticiones',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  // Errores personalizados
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      message: err.message,
      code: err.code || 'OPERATIONAL_ERROR'
    });
  }

  // Error interno del servidor (default)
  const statusCode = err.status || 500;
  const response = {
    message: statusCode === 500 ? 'Error interno del servidor' : err.message,
    code: 'INTERNAL_ERROR'
  };

  // Solo incluir stack trace en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.message;
  }

  res.status(statusCode).json(response);
};

// Función para crear errores operacionales
const createError = (message, statusCode = 400, code = 'OPERATIONAL_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};

module.exports = {
  errorHandler,
  createError
}; 