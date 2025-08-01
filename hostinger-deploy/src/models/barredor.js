const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Planilla = require('./planilla');
const BarredorCatalogo = require('./barredor_catalogo');

const Barredor = sequelize.define('Barredor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  planilla_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Planilla,
      key: 'id'
    }
  },
  barredor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: BarredorCatalogo,
      key: 'id'
    }
  },
  dias: {
    type: DataTypes.INTEGER
  },
  horas_extras: {
    type: DataTypes.DECIMAL(5,2)
  }
}, {
  tableName: 'barredor',
  timestamps: false
});

module.exports = Barredor;
