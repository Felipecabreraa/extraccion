const sequelize = require('./src/config/database');

async function verificarEstructuraTablas() {
  try {
    console.log('🧪 Verificando estructura de tablas...');
    
    // Verificar estructura de migracion_ordenes
    const [estructuraMigracion] = await sequelize.query(`
      DESCRIBE migracion_ordenes
    `);
    
    console.log('\n📊 ESTRUCTURA DE migracion_ordenes:');
    estructuraMigracion.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type}`);
    });
    
    // Verificar estructura de vw_ordenes_unificada_completa
    const [estructuraVista] = await sequelize.query(`
      DESCRIBE vw_ordenes_unificada_completa
    `);
    
    console.log('\n📊 ESTRUCTURA DE vw_ordenes_unificada_completa:');
    estructuraVista.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type}`);
    });
    
    // Verificar estructura de vw_danos_mes_anio
    const [estructuraDanos] = await sequelize.query(`
      DESCRIBE vw_danos_mes_anio
    `);
    
    console.log('\n📊 ESTRUCTURA DE vw_danos_mes_anio:');
    estructuraDanos.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type}`);
    });
    
    console.log('\n✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraTablas(); 