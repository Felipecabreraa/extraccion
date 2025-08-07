const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario aún existe en la base de datos
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      message: 'Error interno de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.usuario.rol;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
}; 