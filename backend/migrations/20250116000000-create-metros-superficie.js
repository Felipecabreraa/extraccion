'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('metros_superficie', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha del registro (formato YYYY-MM-DD)'
      },
      zona_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID de la zona (HEMBRA/MACHO)'
      },
      sector_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del sector específico'
      },
      pabellones_limpiados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad de pabellones limpiados en esa fecha'
      },
      metros_cuadrados: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Metros cuadrados calculados (pabellones_limpiados * mt2_sector)'
      },
      tipo_zona: {
        type: Sequelize.ENUM('HEMBRA', 'MACHO'),
        allowNull: false,
        comment: 'Tipo de zona para agrupación'
      },
      observacion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones adicionales del registro'
      },
      creado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que creó el registro'
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Fecha y hora de creación del registro'
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('metros_superficie', ['fecha']);
    await queryInterface.addIndex('metros_superficie', ['zona_id']);
    await queryInterface.addIndex('metros_superficie', ['sector_id']);
    await queryInterface.addIndex('metros_superficie', ['tipo_zona']);
    
    // Índice único para evitar duplicados
    await queryInterface.addIndex('metros_superficie', ['fecha', 'zona_id', 'sector_id'], {
      unique: true,
      name: 'unique_fecha_zona_sector'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('metros_superficie');
  }
};