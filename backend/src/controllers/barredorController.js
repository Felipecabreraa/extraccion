const { Barredor, BarredorCatalogo } = require('../models');
const { Op } = require('sequelize');

exports.listar = async (req, res) => {
  const { planilla_id, limit, offset } = req.query;
  const where = {};
  if (planilla_id) where.planilla_id = planilla_id;
  const barredores = await Barredor.findAll({
    where,
    include: [{ model: BarredorCatalogo }],
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [['id', 'ASC']]
  });
  res.json(barredores);
};

exports.obtener = async (req, res) => {
  const barredor = await Barredor.findByPk(req.params.id, { include: [{ model: BarredorCatalogo }] });
  if (!barredor) return res.status(404).json({ message: 'No encontrado' });
  res.json(barredor);
};

exports.crear = async (req, res) => {
  const { barredor_id, planilla_id, dias, horas_extras } = req.body;
  const nuevo = await Barredor.create({ barredor_id, planilla_id, dias, horas_extras });
  res.status(201).json(nuevo);
};

exports.actualizar = async (req, res) => {
  const barredor = await Barredor.findByPk(req.params.id);
  if (!barredor) return res.status(404).json({ message: 'No encontrado' });
  const { dias, horas_extras } = req.body;
  await barredor.update({ dias, horas_extras });
  res.json(barredor);
};

exports.eliminar = async (req, res) => {
  const barredor = await Barredor.findByPk(req.params.id);
  if (!barredor) return res.status(404).json({ message: 'No encontrado' });
  await barredor.destroy();
  res.json({ message: 'Eliminado' });
}; 