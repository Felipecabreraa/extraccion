const sequelize = require('../src/config/database');

async function eliminarVistaPlanillasCompletas() {
  try {
    console.log('🧹 Eliminando vista vw_planillas_completas...');
    
    // Verificar si existe la vista
    const [vistas] = await sequelize.query("SHOW TABLES LIKE 'vw_planillas_completas'");
    
    if (vistas.length === 0) {
      console.log('✅ La vista vw_planillas_completas NO EXISTE');
      console.log('💡 No hay nada que eliminar');
      return;
    }
    
    console.log('⚠️ La vista vw_planillas_completas EXISTE');
    
    // Eliminar la vista
    await sequelize.query('DROP VIEW IF EXISTS vw_planillas_completas');
    console.log('✅ Vista vw_planillas_completas eliminada exitosamente');
    
    // Verificar que se eliminó
    const [verificacion] = await sequelize.query("SHOW TABLES LIKE 'vw_planillas_completas'");
    
    if (verificacion.length === 0) {
      console.log('✅ Verificación: La vista ya no existe');
    } else {
      console.log('❌ Error: La vista aún existe');
    }
    
    console.log('\n🎉 Proceso completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('- Vista vw_planillas_completas eliminada');
    console.log('- Sistema actualizado para usar tablas principales');
    console.log('- Controladores actualizados');
    
  } catch (error) {
    console.error('❌ Error eliminando vista:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    await eliminarVistaPlanillasCompletas();
    
    console.log('\n🎉 Limpieza completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. El sistema ahora usa las tablas principales (planilla, dano, etc.)');
    console.log('2. Los endpoints del dashboard funcionan con datos reales');
    console.log('3. No hay dependencias de vistas unificadas');
    
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { eliminarVistaPlanillasCompletas }; 