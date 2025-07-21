'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Verificar si la columna existe antes de eliminarla
      const tableDescription = await queryInterface.describeTable('barredor_catalogo');
      
      if (tableDescription.rut) {
        console.log('Eliminando columna rut de barredor_catalogo...');
        await queryInterface.removeColumn('barredor_catalogo', 'rut');
        console.log('✅ Columna rut eliminada exitosamente');
      } else {
        console.log('⚠️ La columna rut no existe en barredor_catalogo');
      }
    } catch (error) {
      console.error('❌ Error eliminando columna rut:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Recrear la columna rut si es necesario hacer rollback
      console.log('Recreando columna rut en barredor_catalogo...');
      await queryInterface.addColumn('barredor_catalogo', 'rut', {
        type: Sequelize.STRING(20),
        allowNull: true,
        after: 'apellido'
      });
      console.log('✅ Columna rut recreada exitosamente');
    } catch (error) {
      console.error('❌ Error recreando columna rut:', error);
      throw error;
    }
  }
}; 