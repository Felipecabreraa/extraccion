const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BarredorCatalogo = sequelize.define('BarredorCatalogo', {
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
  tableName: 'barredor_catalogo',
  timestamps: false
});

module.exports = BarredorCatalogo; 