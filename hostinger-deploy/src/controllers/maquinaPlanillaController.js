const { MaquinaPlanilla, Maquina, Operador } = require('../models');

exports.listar = async (req, res) => {
  const { planilla_id } = req.query;
  const where = {};
  if (planilla_id) where.planilla_id = planilla_id;
  const registros = await MaquinaPlanilla.findAll({
    where,
    include: [
      { model: Maquina },
      { model: Operador }
    ],
    order: [['id', 'ASC']]
  });
  res.json(registros);
};

exports.obtener = async (req, res) => {
  const registro = await MaquinaPlanilla.findByPk(req.params.id, {
    include: [
      { model: Maquina },
      { model: Operador }
    ]
  });
  if (!registro) return res.status(404).json({ message: 'No encontrado' });
  res.json(registro);
};

exports.crear = async (req, res) => {
  const nuevo = await MaquinaPlanilla.create(req.body);
  res.status(201).json(nuevo);
};

exports.actualizar = async (req, res) => {
  const registro = await MaquinaPlanilla.findByPk(req.params.id);
  if (!registro) return res.status(404).json({ message: 'No encontrado' });
  await registro.update(req.body);
  res.json(registro);
};

exports.eliminar = async (req, res) => {
  const registro = await MaquinaPlanilla.findByPk(req.params.id);
  if (!registro) return res.status(404).json({ message: 'No encontrado' });
  await registro.destroy();
  res.json({ message: 'Eliminado' });
}; 