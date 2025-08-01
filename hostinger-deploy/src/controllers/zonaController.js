const { Zona } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.listar = async (req, res) => {
  try {
    const zonas = await Zona.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(zonas);
  } catch (error) {
    console.error('Error listando zonas:', error);
    res.status(500).json({ message: 'Error al listar zonas' });
  }
};

exports.obtener = async (req, res) => {
  const zona = await Zona.findByPk(req.params.id);
  if (!zona) return res.status(404).json({ message: 'No encontrada' });
  res.json(zona);
};

exports.crear = async (req, res) => {
  const nueva = await Zona.create(req.body);
  res.status(201).json(nueva);
};

exports.actualizar = async (req, res) => {
  const zona = await Zona.findByPk(req.params.id);
  if (!zona) return res.status(404).json({ message: 'No encontrada' });
  await zona.update(req.body);
  res.json(zona);
};

exports.eliminar = async (req, res) => {
  const zona = await Zona.findByPk(req.params.id);
  if (!zona) return res.status(404).json({ message: 'No encontrada' });
  await zona.destroy();
  res.json({ message: 'Eliminada' });
};

// Obtener estadísticas de zonas por tipo
exports.estadisticasPorTipo = async (req, res) => {
  try {
    const estadisticas = await Zona.findAll({
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['tipo'],
      raw: true
    });

    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas de zonas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 