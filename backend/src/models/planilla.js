const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./usuario');
const Sector = require('./sector');

const Planilla = sequelize.define('Planilla', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  supervisor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  sector_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Sector,
      key: 'id'
    }
  },
  mt2: {
    type: DataTypes.DECIMAL(10,2)
  },
  pabellones_total: {
    type: DataTypes.INTEGER
  },
  pabellones_limpiados: {
    type: DataTypes.INTEGER
  },
  fecha_inicio: {
    type: DataTypes.DATE
  },
  fecha_termino: {
    type: DataTypes.DATE
  },
  ticket: {
    type: DataTypes.STRING(100)
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'PENDIENTE'
  },
  observacion: {
    type: DataTypes.TEXT
  },
  observacion_validacion: {
    type: DataTypes.TEXT,
    comment: 'Observaciones del administrador al validar/cancelar'
  },
  validado_por: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    },
    comment: 'ID del administrador que validó la planilla'
  },
  fecha_validacion: {
    type: DataTypes.DATE,
    comment: 'Fecha cuando se validó la planilla'
  }
}, {
  tableName: 'planilla',
  timestamps: false
});

module.exports = Planilla;
