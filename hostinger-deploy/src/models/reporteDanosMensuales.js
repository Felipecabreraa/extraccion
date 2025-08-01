const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReporteDanosMensuales = sequelize.define('ReporteDanosMensuales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Año del reporte (ej: 2024, 2025)'
  },
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    },
    comment: 'Mes del reporte (1 = enero, ..., 12 = diciembre)'
  },
  valor_real: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: 'Valor real del mes en pesos chilenos'
  },
  valor_ppto: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: 'Valor presupuestado del mes en pesos chilenos'
  },
  valor_anio_ant: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: 'Valor base del mismo mes del año anterior en pesos chilenos'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de creación del registro'
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: 'Fecha de última actualización'
  }
}, {
  tableName: 'reporte_danos_mensuales',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['anio', 'mes'],
      name: 'uk_anio_mes'
    }
  ],
  comment: 'Tabla para almacenar reportes mensuales de daños con valores monetarios'
});

module.exports = ReporteDanosMensuales; 