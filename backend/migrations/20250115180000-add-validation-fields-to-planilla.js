'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('planilla', 'observacion_validacion', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Observaciones del administrador al validar/rechazar'
    });

    await queryInterface.addColumn('planilla', 'validado_por', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id'
      },
      comment: 'ID del administrador que validó la planilla'
    });

    await queryInterface.addColumn('planilla', 'fecha_validacion', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha cuando se validó la planilla'
    });

    // Actualizar el ENUM de estados para incluir los nuevos estados
    await queryInterface.sequelize.query(`
      ALTER TABLE planilla 
      MODIFY COLUMN estado ENUM('PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADA', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA', 'RECHAZADA') 
      NOT NULL DEFAULT 'PENDIENTE'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('planilla', 'observacion_validacion');
    await queryInterface.removeColumn('planilla', 'validado_por');
    await queryInterface.removeColumn('planilla', 'fecha_validacion');

    // Revertir el ENUM de estados
    await queryInterface.sequelize.query(`
      ALTER TABLE planilla 
      MODIFY COLUMN estado ENUM('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA') 
      NOT NULL DEFAULT 'PENDIENTE'
    `);
  }
}; 