const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VwOrdenesUnificadaCompleta = sequelize.define('VwOrdenesUnificadaCompleta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  id_orden_servicio: {
    type: DataTypes.INTEGER
  },
  fecha_inicio: {
    type: DataTypes.DATE
  },
  fecha_fin: {
    type: DataTypes.DATE
  },
  supervisor: {
    type: DataTypes.STRING
  },
  sector: {
    type: DataTypes.STRING
  },
  mts2: {
    type: DataTypes.INTEGER
  },
  pabellones_total: {
    type: DataTypes.INTEGER
  },
  pabellones_limpiados: {
    type: DataTypes.INTEGER
  },
  maquina: {
    type: DataTypes.STRING
  },
  operador: {
    type: DataTypes.STRING
  },
  odometro_inicio: {
    type: DataTypes.DECIMAL(10,2)
  },
  odometro_fin: {
    type: DataTypes.DECIMAL(10,2)
  },
  litros_petroleo: {
    type: DataTypes.DECIMAL(10,2)
  },
  barredor: {
    type: DataTypes.STRING
  },
  tipo_dano: {
    type: DataTypes.STRING
  },
  descripcion_dano: {
    type: DataTypes.STRING
  },
  cantidad_dano: {
    type: DataTypes.INTEGER
  },
  observacion: {
    type: DataTypes.TEXT
  },
  nroPabellon: {
    type: DataTypes.INTEGER
  },
  nombreSector: {
    type: DataTypes.STRING
  },
  pabellon_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'migracion_ordenes_2025',
  timestamps: false,
  freezeTableName: true
});

module.exports = VwOrdenesUnificadaCompleta;
