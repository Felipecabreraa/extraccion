const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Planilla = require('./planilla');
const Pabellon = require('./pabellon');
const Maquina = require('./maquina');

const PabellonMaquina = sequelize.define('PabellonMaquina', {
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
  pabellon_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Pabellon,
      key: 'id'
    }
  },
  maquina_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Maquina,
      key: 'id'
    }
  }
}, {
  tableName: 'pabellon_maquina',
  timestamps: false
});

module.exports = PabellonMaquina;
