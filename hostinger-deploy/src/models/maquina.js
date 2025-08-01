const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Maquina = sequelize.define('Maquina', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'maquina',
  timestamps: false
});

module.exports = Maquina;
