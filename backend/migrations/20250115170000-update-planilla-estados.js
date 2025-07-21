'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Actualizar estados existentes
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'PENDIENTE' 
      WHERE estado = 'ABIERTO' OR estado IS NULL
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'COMPLETADA' 
      WHERE estado = 'CERRADO'
    `);
    
    // Actualizar el ENUM en la base de datos
    await queryInterface.sequelize.query(`
      ALTER TABLE planilla 
      MODIFY COLUMN estado ENUM('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA') 
      NOT NULL DEFAULT 'PENDIENTE'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir a los estados originales
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'ABIERTO' 
      WHERE estado IN ('PENDIENTE', 'ACTIVA', 'PAUSADA')
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE planilla 
      SET estado = 'CERRADO' 
      WHERE estado = 'COMPLETADA'
    `);
    
    // Revertir el ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE planilla 
      MODIFY COLUMN estado ENUM('ABIERTO', 'CERRADO') 
      NULL
    `);
  }
}; 