const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Planilla = require('./planilla');
const Pabellon = require('./pabellon');
const Maquina = require('./maquina');

const Dano = sequelize.define('Dano', {
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
  },
  tipo: {
    type: DataTypes.ENUM('infraestructura', 'equipo')
  },
  descripcion: {
    type: DataTypes.STRING(255)
  },
  cantidad: {
    type: DataTypes.INTEGER
  },
  observacion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'dano',
  timestamps: false
});

module.exports = Dano;
