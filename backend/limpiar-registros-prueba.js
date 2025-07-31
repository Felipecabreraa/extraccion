const { MetrosSuperficie } = require('./src/models');

async function limpiarRegistrosPrueba() {
  try {
    console.log('🧹 Limpiando registros de prueba...');

    // Eliminar registros que contengan "prueba" en la observación
    const registrosEliminados = await MetrosSuperficie.destroy({
      where: {
        observacion: {
          [require('sequelize').Op.like]: '%prueba%'
        }
      }
    });

    console.log(`✅ ${registrosEliminados} registros de prueba eliminados`);

    // Mostrar registros restantes
    const registrosRestantes = await MetrosSuperficie.findAll({
      attributes: ['id', 'fecha', 'zona_id', 'sector_id', 'observacion']
    });

    console.log(`📊 Registros restantes: ${registrosRestantes.length}`);
    
    if (registrosRestantes.length > 0) {
      console.log('📋 Registros existentes:');
      registrosRestantes.forEach(reg => {
        console.log(`   - ID: ${reg.id}, Fecha: ${reg.fecha}, Zona: ${reg.zona_id}, Sector: ${reg.sector_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error limpiando registros:', error.message);
  }
}

limpiarRegistrosPrueba();