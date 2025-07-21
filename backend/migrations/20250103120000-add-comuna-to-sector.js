'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sector', 'comuna', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'zona_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sector', 'comuna');
  }
}; 