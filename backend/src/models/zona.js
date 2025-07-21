const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zona = sequelize.define('Zona', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('HEMBRA', 'MACHO'),
    allowNull: false,
    defaultValue: 'HEMBRA'
  }
}, {
  tableName: 'zona',
  timestamps: false
});

module.exports = Zona;