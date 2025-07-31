const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Zona = require('./zona');
const Sector = require('./sector');

const MetrosSuperficie = sequelize.define('MetrosSuperficie', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha del registro (formato YYYY-MM-DD)'
  },
  zona_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Zona,
      key: 'id'
    },
    comment: 'ID de la zona (HEMBRA/MACHO)'
  },
  sector_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Sector,
      key: 'id'
    },
    comment: 'ID del sector específico'
  },
  pabellones_limpiados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Cantidad de pabellones limpiados en esa fecha'
  },
  metros_cuadrados: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Metros cuadrados calculados (pabellones_limpiados * mt2_sector)'
  },
  tipo_zona: {
    type: DataTypes.ENUM('HEMBRA', 'MACHO'),
    allowNull: false,
    comment: 'Tipo de zona para agrupación'
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales del registro'
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del usuario que creó el registro'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de creación del registro'
  }
}, {
  tableName: 'metros_superficie',
  timestamps: false,
  indexes: [
    {
      fields: ['fecha']
    },
    {
      fields: ['zona_id']
    },
    {
      fields: ['sector_id']
    },
    {
      fields: ['tipo_zona']
    },
    {
      fields: ['fecha', 'zona_id', 'sector_id'],
      unique: true,
      name: 'unique_fecha_zona_sector'
    }
  ]
});

module.exports = MetrosSuperficie;