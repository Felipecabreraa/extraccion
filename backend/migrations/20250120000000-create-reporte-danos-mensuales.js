'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reporte_danos_mensuales', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      anio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Año del reporte (ej: 2024, 2025)'
      },
      mes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Mes del reporte (1 = enero, ..., 12 = diciembre)'
      },
      valor_real: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        comment: 'Valor real del mes en pesos chilenos'
      },
      valor_ppto: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        comment: 'Valor presupuestado del mes en pesos chilenos'
      },
      valor_anio_ant: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        comment: 'Valor base del mismo mes del año anterior en pesos chilenos'
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: 'Fecha de creación del registro'
      },
      fecha_actualizacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: 'Fecha de última actualización'
      }
    });

    // Crear índice único para anio y mes
    await queryInterface.addIndex('reporte_danos_mensuales', ['anio', 'mes'], {
      unique: true,
      name: 'uk_anio_mes'
    });

    // Crear índice para búsquedas por año
    await queryInterface.addIndex('reporte_danos_mensuales', ['anio'], {
      name: 'idx_anio'
    });

    // Crear índice para búsquedas por mes
    await queryInterface.addIndex('reporte_danos_mensuales', ['mes'], {
      name: 'idx_mes'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reporte_danos_mensuales');
  }
}; 