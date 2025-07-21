'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('zona', 'tipo', {
      type: Sequelize.ENUM('HEMBRA', 'MACHO'),
      allowNull: false,
      defaultValue: 'HEMBRA'
    });

    // Actualizar zonas existentes según la regla de negocio
    await queryInterface.sequelize.query(`
      UPDATE zona 
      SET tipo = CASE 
        WHEN id IN (1, 3) THEN 'HEMBRA'
        WHEN id = 2 THEN 'MACHO'
        ELSE 'HEMBRA'
      END
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('zona', 'tipo');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_zona_tipo;');
  }
}; 