'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('maquina', 'patente');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('maquina', 'patente', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 