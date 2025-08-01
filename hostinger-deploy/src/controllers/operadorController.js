const { Operador } = require('../models');
const { Op } = require('sequelize');

exports.listar = async (req, res) => {
  const { nombre, limit, offset } = req.query;
  const where = {};
  if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
  const operadores = await Operador.findAll({
    where,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [['nombre', 'ASC']]
  });
  res.json(operadores);
};

exports.obtener = async (req, res) => {
  const operador = await Operador.findByPk(req.params.id);
  if (!operador) return res.status(404).json({ message: 'No encontrado' });
  res.json(operador);
};

exports.crear = async (req, res) => {
  const nuevo = await Operador.create(req.body);
  res.status(201).json(nuevo);
};

exports.actualizar = async (req, res) => {
  const operador = await Operador.findByPk(req.params.id);
  if (!operador) return res.status(404).json({ message: 'No encontrado' });
  await operador.update(req.body);
  res.json(operador);
};

exports.eliminar = async (req, res) => {
  const operador = await Operador.findByPk(req.params.id);
  if (!operador) return res.status(404).json({ message: 'No encontrado' });
  await operador.destroy();
  res.json({ message: 'Eliminado' });
};

// Carga masiva de operadores
exports.cargaMasiva = async (req, res) => {
  try {
    const { operadores } = req.body;
    
    if (!operadores || !Array.isArray(operadores)) {
      return res.status(400).json({ 
        message: 'Se requiere un array de operadores' 
      });
    }

    if (operadores.length === 0) {
      return res.status(400).json({ 
        message: 'El array de operadores no puede estar vacío' 
      });
    }

    // Validar cada operador
    for (let i = 0; i < operadores.length; i++) {
      const operador = operadores[i];
      
      if (!operador.nombre || !operador.apellido) {
        return res.status(400).json({ 
          message: `Operador ${i + 1}: Los campos nombre y apellido son obligatorios` 
        });
      }
      
      if (typeof operador.nombre !== 'string' || typeof operador.apellido !== 'string') {
        return res.status(400).json({ 
          message: `Operador ${i + 1}: Los campos nombre y apellido deben ser texto` 
        });
      }
      
      if (operador.nombre.trim().length === 0 || operador.apellido.trim().length === 0) {
        return res.status(400).json({ 
          message: `Operador ${i + 1}: Los campos nombre y apellido no pueden estar vacíos` 
        });
      }
      
      if (operador.nombre.length > 50 || operador.apellido.length > 50) {
        return res.status(400).json({ 
          message: `Operador ${i + 1}: Los campos nombre y apellido no pueden exceder 50 caracteres` 
        });
      }
    }

    // Insertar operadores
    const operadoresCreados = await Operador.bulkCreate(operadores, {
      validate: true
    });

    res.status(201).json({
      message: `${operadoresCreados.length} operadores creados exitosamente`,
      operadores: operadoresCreados
    });

  } catch (error) {
    console.error('Error en carga masiva de operadores:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 