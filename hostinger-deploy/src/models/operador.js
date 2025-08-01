const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Operador = sequelize.define('Operador', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'operador',
  timestamps: false
});

module.exports = Operador;
