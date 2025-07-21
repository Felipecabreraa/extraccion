'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Actualizar el ENUM de estados para incluir solo los estados finales
    await queryInterface.sequelize.query(`
      ALTER TABLE planilla 
      MODIFY COLUMN estado ENUM('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA') 
      NOT NULL DEFAULT 'PENDIENTE'
    `);

    // Actualizar estados existentes según la nueva lógica
    // PENDIENTE_VALIDACION -> ACTIVA (pendiente de validación por admin)
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'ACTIVA' 
      WHERE estado = 'PENDIENTE_VALIDACION'
    `);

    // VALIDADA -> COMPLETADA (ya fue validada por admin)
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'COMPLETADA' 
      WHERE estado = 'VALIDADA'
    `);

    // RECHAZADA -> PENDIENTE (vuelve a pendiente para corrección)
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'PENDIENTE' 
      WHERE estado = 'RECHAZADA'
    `);

    // PAUSADA -> ACTIVA (asumiendo que está pausada pero activa)
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'ACTIVA' 
      WHERE estado = 'PAUSADA'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir a los estados anteriores
    await queryInterface.sequelize.query(`
      ALTER TABLE planilla 
      MODIFY COLUMN estado ENUM('PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADA', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA', 'RECHAZADA') 
      NOT NULL DEFAULT 'PENDIENTE'
    `);

    // Revertir los cambios de estado
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'PENDIENTE_VALIDACION' 
      WHERE estado = 'ACTIVA' AND validado_por IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'VALIDADA' 
      WHERE estado = 'COMPLETADA'
    `);
  }
}; 