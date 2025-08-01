const { Pabellon } = require('../models');
const { Op, Sequelize } = require('sequelize');

exports.listar = async (req, res) => {
  const { nombre, sector_id, limit, offset } = req.query;
  const where = {};
  if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
  if (sector_id) where.sector_id = sector_id;
  
  const pabellones = await Pabellon.findAll({
    where,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [
      ['sector_id', 'ASC'],
      [Sequelize.literal('CAST(SUBSTRING(nombre, 10) AS UNSIGNED)'), 'ASC']
    ]
  });
  res.json(pabellones);
};

exports.obtener = async (req, res) => {
  const pabellon = await Pabellon.findByPk(req.params.id);
  if (!pabellon) return res.status(404).json({ message: 'No encontrado' });
  res.json(pabellon);
};

exports.crear = async (req, res) => {
  const nuevo = await Pabellon.create(req.body);
  res.status(201).json(nuevo);
};

exports.actualizar = async (req, res) => {
  const pabellon = await Pabellon.findByPk(req.params.id);
  if (!pabellon) return res.status(404).json({ message: 'No encontrado' });
  await pabellon.update(req.body);
  res.json(pabellon);
};

exports.eliminar = async (req, res) => {
  const pabellon = await Pabellon.findByPk(req.params.id);
  if (!pabellon) return res.status(404).json({ message: 'No encontrado' });
  await pabellon.destroy();
  res.json({ message: 'Eliminado' });
}; 