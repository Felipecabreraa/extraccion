'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('maquina', 'patente');
    } catch (error) {
      // Si la columna no existe, ignorar el error
      if (error.message.includes("doesn't exist") || error.message.includes("No se puede eliminar")) {
        console.log('Columna patente no existe en maquina, saltando...');
      } else {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('maquina', 'patente', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      // Si la columna ya existe, ignorar el error
      if (error.message.includes('Duplicate column name')) {
        console.log('Columna patente ya existe en maquina, saltando...');
      } else {
        throw error;
      }
    }
  }
}; 