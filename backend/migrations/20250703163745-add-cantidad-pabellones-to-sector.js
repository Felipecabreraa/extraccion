'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('sector', 'cantidad_pabellones', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
    } catch (error) {
      // Si la columna ya existe, ignorar el error
      if (error.message.includes('Duplicate column name')) {
        console.log('Columna cantidad_pabellones ya existe, saltando...');
      } else {
        throw error;
      }
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('sector', 'cantidad_pabellones');
    } catch (error) {
      // Si la columna no existe, ignorar el error
      if (error.message.includes("doesn't exist")) {
        console.log('Columna cantidad_pabellones no existe, saltando...');
      } else {
        throw error;
      }
    }
  }
};
