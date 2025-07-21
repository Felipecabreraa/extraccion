const { Dano } = require('../models');
const { Op } = require('sequelize');

// Variable para invalidar cache del dashboard
let dashboardCacheInvalid = false;

// Función para invalidar cache
const invalidateDashboardCache = () => {
  dashboardCacheInvalid = true;
  console.log('Cache del dashboard invalidado debido a cambios en daños');
};

exports.listar = async (req, res) => {
  const { tipo, planilla_id, pabellon_id, maquina_id, limit, offset } = req.query;
  const where = {};
  if (tipo) where.tipo = tipo;
  if (planilla_id) where.planilla_id = planilla_id;
  if (pabellon_id) where.pabellon_id = pabellon_id;
  if (maquina_id) where.maquina_id = maquina_id;
  const danos = await Dano.findAll({
    where,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [['id', 'DESC']]
  });
  res.json(danos);
};

exports.obtener = async (req, res) => {
  const dano = await Dano.findByPk(req.params.id);
  if (!dano) return res.status(404).json({ message: 'No encontrado' });
  res.json(dano);
};

exports.crear = async (req, res) => {
  const nuevo = await Dano.create(req.body);
  // Invalidar cache cuando se crea un nuevo daño
  invalidateDashboardCache();
  res.status(201).json(nuevo);
};

exports.actualizar = async (req, res) => {
  const dano = await Dano.findByPk(req.params.id);
  if (!dano) return res.status(404).json({ message: 'No encontrado' });
  await dano.update(req.body);
  // Invalidar cache cuando se actualiza un daño
  invalidateDashboardCache();
  res.json(dano);
};

exports.eliminar = async (req, res) => {
  const dano = await Dano.findByPk(req.params.id);
  if (!dano) return res.status(404).json({ message: 'No encontrado' });
  await dano.destroy();
  // Invalidar cache cuando se elimina un daño
  invalidateDashboardCache();
  res.json({ message: 'Eliminado' });
};

// Exportar función para verificar si el cache está invalidado
exports.isDashboardCacheInvalid = () => dashboardCacheInvalid;

// Exportar función para resetear el estado del cache
exports.resetDashboardCache = () => {
  dashboardCacheInvalid = false;
}; 