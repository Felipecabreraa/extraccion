const sequelize = require('./src/config/database');

async function limpiarCacheDashboard() {
  try {
    console.log('🧹 Limpiando caché del dashboard...\n');
    
    // Forzar limpieza de caché modificando las variables globales
    global.metricsCache = null;
    global.cacheTimestamp = null;
    
    console.log('✅ Caché limpiado');
    
    // Verificar que el servidor esté funcionando
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    // Probar una consulta simple
    const [result] = await sequelize.query('SELECT COUNT(*) as total FROM vw_ordenes_2025_actual');
    console.log('✅ Vista unificada accesible, registros:', result[0].total);
    
    console.log('\n🎯 Ahora puedes reiniciar el servidor y los datos deberían cargarse correctamente');
    console.log('💡 Comando: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

limpiarCacheDashboard(); 