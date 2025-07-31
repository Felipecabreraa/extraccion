const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    console.log('🔍 Validando datos con esquema:', schema.describe().keys);
    console.log('📝 Datos a validar:', req.body);
    
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      console.log('❌ Error de validación:', error.details);
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }))
      });
    }
    
    console.log('✅ Validación exitosa');
    next();
  };
};

// Esquemas de validación mejorados
const planillaSchema = Joi.object({
  supervisor_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().allow('').optional()
  ).required().messages({ 'any.required': 'El supervisor es obligatorio' }),
  sector_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().allow('').optional()
  ).required().messages({ 'any.required': 'El sector es obligatorio' }),
  zona_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().allow('').optional()
  ).optional(),
  pabellones: Joi.alternatives().try(
    Joi.number().integer().min(1),
    Joi.string().allow('').optional()
  ).optional(),
  mt2: Joi.number().positive().optional(),
  pabellones_total: Joi.number().integer().min(1).optional(),
  pabellones_limpiados: Joi.number().integer().min(0).optional(),
  fecha_inicio: Joi.alternatives().try(
    Joi.date(),
    Joi.string().allow('').optional()
  ).required().messages({ 'any.required': 'La fecha de inicio es obligatoria' }),
  fecha_termino: Joi.alternatives().try(
    Joi.date().min(Joi.ref('fecha_inicio')),
    Joi.string().allow('').optional()
  ).optional(),
  ticket: Joi.string().max(100).allow('').optional(),
  estado: Joi.string().valid('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA').allow('').optional(),
  observacion: Joi.string().max(500).allow('').optional()
});

const usuarioSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required()
    .messages({ 'any.required': 'El nombre es obligatorio' }),
  email: Joi.string().email().required()
    .messages({ 'any.required': 'El email es obligatorio', 'string.email': 'Email inválido' }),
  password: Joi.string().min(6).required()
    .messages({ 'any.required': 'La contraseña es obligatoria', 'string.min': 'La contraseña debe tener al menos 6 caracteres' }),
  rol: Joi.string().valid('administrador', 'operador', 'supervisor').required()
    .messages({ 'any.required': 'El rol es obligatorio' }),
  estado: Joi.string().valid('activo', 'inactivo').optional()
});

const operadorSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).required()
    .messages({ 'any.required': 'El nombre es obligatorio' }),
  apellido: Joi.string().min(2).max(50).required()
    .messages({ 'any.required': 'El apellido es obligatorio' }),
  rut: Joi.string().pattern(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/).optional()
    .messages({ 'string.pattern.base': 'RUT inválido' }),
  telefono: Joi.string().max(20).optional(),
  email: Joi.string().email().optional()
    .messages({ 'string.email': 'Email inválido' })
});

const maquinaSchema = Joi.object({
  numero: Joi.string().min(1).max(50).required()
    .messages({ 'any.required': 'El número de máquina es obligatorio' }),
  tipo: Joi.string().max(100).optional(),
  estado: Joi.string().valid('activa', 'inactiva', 'mantenimiento').optional(),
  modelo: Joi.string().max(100).optional(),
  año: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional()
});

const barredorSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).required()
    .messages({ 'any.required': 'El nombre es obligatorio' }),
  apellido: Joi.string().min(2).max(50).required()
    .messages({ 'any.required': 'El apellido es obligatorio' }),
  telefono: Joi.string().max(20).optional(),
  email: Joi.string().email().optional()
    .messages({ 'string.email': 'Email inválido' })
});

const sectorSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required()
    .messages({ 'any.required': 'El nombre del sector es obligatorio' }),
  zona_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'La zona es obligatoria' }),
  descripcion: Joi.string().max(500).optional(),
  cantidad_pabellones: Joi.number().integer().min(0).optional()
});

const zonaSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required()
    .messages({ 'any.required': 'El nombre de la zona es obligatorio' }),
  descripcion: Joi.string().max(500).optional()
});

const pabellonSchema = Joi.object({
  numero: Joi.string().min(1).max(50).required()
    .messages({ 'any.required': 'El número de pabellón es obligatorio' }),
  sector_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'El sector es obligatorio' }),
  descripcion: Joi.string().max(500).optional(),
  estado: Joi.string().valid('activo', 'inactivo', 'mantenimiento').optional()
});

const danoSchema = Joi.object({
  planilla_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'La planilla es obligatoria' }),
  descripcion: Joi.string().min(5).max(500).required()
    .messages({ 'any.required': 'La descripción del daño es obligatoria' }),
  tipo: Joi.string().valid('mecanico', 'electrico', 'estructural', 'otro').required()
    .messages({ 'any.required': 'El tipo de daño es obligatorio' }),
  severidad: Joi.string().valid('leve', 'moderado', 'grave', 'critico').required()
    .messages({ 'any.required': 'La severidad es obligatoria' }),
  fecha_reporte: Joi.date().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({ 'any.required': 'El email es obligatorio', 'string.email': 'Email inválido' }),
  password: Joi.string().required()
    .messages({ 'any.required': 'La contraseña es obligatoria' })
});

// Middleware para validar roles
const validateRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          message: 'Token de acceso requerido',
          code: 'UNAUTHORIZED'
        });
      }

      // Verificar que el usuario tenga uno de los roles permitidos
      if (!allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({
          message: 'Acceso denegado. Rol insuficiente',
          code: 'FORBIDDEN',
          requiredRoles: allowedRoles,
          userRole: req.user.rol
        });
      }

      next();
    } catch (error) {
      console.error('Error en validateRole:', error);
      return res.status(500).json({
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

module.exports = {
  validate,
  validateRole,
  schemas: {
    planilla: planillaSchema,
    usuario: usuarioSchema,
    operador: operadorSchema,
    maquina: maquinaSchema,
    barredor: barredorSchema,
    sector: sectorSchema,
    zona: zonaSchema,
    pabellon: pabellonSchema,
    dano: danoSchema,
    login: loginSchema
  }
}; 