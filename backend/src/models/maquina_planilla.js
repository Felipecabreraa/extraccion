const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Planilla = require('./planilla');
const Maquina = require('./maquina');
const Operador = require('./operador');

const MaquinaPlanilla = sequelize.define('MaquinaPlanilla', {
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
  maquina_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Maquina,
      key: 'id'
    }
  },
  operador_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Operador,
      key: 'id'
    }
  },
  dias_trabajados: {
    type: DataTypes.INTEGER
  },
  horas_extras: {
    type: DataTypes.DECIMAL(5,2)
  },
  odometro_inicio: {
    type: DataTypes.DECIMAL(10,2)
  },
  odometro_fin: {
    type: DataTypes.DECIMAL(10,2)
  },
  petroleo: {
    type: DataTypes.DECIMAL(10,2)
  }
}, {
  tableName: 'maquina_planilla',
  timestamps: false
});

module.exports = MaquinaPlanilla;
