const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.listar = async (req, res) => {
  const { nombre, email, rol, limit, offset } = req.query;
  const where = {};
  if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
  if (email) where.email = { [Op.like]: `%${email}%` };
  if (rol) where.rol = rol;
  const usuarios = await Usuario.findAll({
    where,
    attributes: { exclude: ['password'] },
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [['nombre', 'ASC']]
  });
  res.json(usuarios);
};

exports.obtener = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  if (!usuario) return res.status(404).json({ message: 'No encontrado' });
  res.json(usuario);
};

exports.crear = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password || !rol) return res.status(400).json({ message: 'Faltan datos' });
  const existe = await Usuario.findOne({ where: { email } });
  if (existe) return res.status(400).json({ message: 'El email ya existe' });
  const hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, email, password: hash, rol });
  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
};

exports.actualizar = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ message: 'No encontrado' });
  const { nombre, email, password, rol } = req.body;
  if (nombre) usuario.nombre = nombre;
  if (email) usuario.email = email;
  if (rol) usuario.rol = rol;
  if (password) usuario.password = await bcrypt.hash(password, 10);
  await usuario.save();
  res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
};

exports.eliminar = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ message: 'No encontrado' });
  await usuario.destroy();
  res.json({ message: 'Eliminado' });
}; 