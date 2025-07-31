const sequelize = require('./src/config/database');

async function verificarMts2() {
  try {
    console.log('🔍 Verificando cálculo de mts2...');
    
    // 1. Verificar estructura de la tabla de migración
    const [estructuraMigracion] = await sequelize.query('DESCRIBE migracion_ordenes_2025');
    console.log('\n📋 Estructura de migracion_ordenes_2025:');
    estructuraMigracion.forEach(col => {
      if (col.Field.includes('mts') || col.Field.includes('mt2')) {
        console.log(`  ✅ ${col.Field}: ${col.Type}`);
      }
    });
    
    // 2. Verificar algunos registros de ejemplo
    const [ejemplos] = await sequelize.query(`
      SELECT 
        id_orden_servicio,
        fecha_inicio,
        pabellones_total,
        mts2,
        litros_petroleo,
        sector
      FROM migracion_ordenes_2025 
      WHERE mts2 > 0 
      LIMIT 5
    `);
    
    console.log('\n📊 Ejemplos de registros con mts2:');
    ejemplos.forEach((reg, index) => {
      console.log(`  ${index + 1}. Orden ${reg.id_orden_servicio}: ${reg.pabellones_total} pabellones, ${reg.mts2} m², ${reg.litros_petroleo} L, Sector: ${reg.sector}`);
    });
    
    // 3. Verificar estadísticas de mts2
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN mts2 > 0 THEN 1 END) as con_mts2,
        SUM(mts2) as total_mts2,
        AVG(mts2) as promedio_mts2,
        MAX(mts2) as max_mts2,
        MIN(mts2) as min_mts2
      FROM migracion_ordenes_2025
      WHERE YEAR(fecha_inicio) = 2025
    `);
    
    console.log('\n📈 Estadísticas de mts2:');
    console.log(`   Total registros: ${stats[0].total_registros}`);
    console.log(`   Registros con mts2: ${stats[0].con_mts2}`);
    console.log(`   Total mts2: ${parseFloat(stats[0].total_mts2 || 0).toLocaleString()} m²`);
    console.log(`   Promedio mts2: ${parseFloat(stats[0].promedio_mts2 || 0).toFixed(2)} m²`);
    console.log(`   Máximo mts2: ${parseFloat(stats[0].max_mts2 || 0).toLocaleString()} m²`);
    console.log(`   Mínimo mts2: ${parseFloat(stats[0].min_mts2 || 0).toLocaleString()} m²`);
    
    // 4. Verificar cómo se calcula en la vista unificada
    const [vistaEjemplo] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        fechaOrdenServicio,
        cantidadPabellones,
        mts2,
        litrosPetroleo,
        nombreSector
      FROM vw_ordenes_unificada_completa
      WHERE mts2 > 0 
      LIMIT 5
    `);
    
    console.log('\n🔍 Ejemplos de la vista unificada:');
    vistaEjemplo.forEach((reg, index) => {
      console.log(`  ${index + 1}. Orden ${reg.idOrdenServicio}: ${reg.cantidadPabellones} pabellones, ${reg.mts2} m², ${reg.litrosPetroleo} L, Sector: ${reg.nombreSector}`);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verificarMts2(); 