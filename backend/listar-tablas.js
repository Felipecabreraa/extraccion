const sequelize = require('./src/config/database');

async function listarTablas() {
  try {
    console.log('🔍 Listando todas las tablas disponibles...\n');

    // Listar todas las tablas
    const [results] = await sequelize.query(`
      SHOW TABLES
    `);

    console.log('📋 TABLAS DISPONIBLES:');
    results.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Buscar tablas que contengan "ordenes" o "migraciones"
    console.log('\n🔍 BUSCANDO TABLAS RELACIONADAS:');
    const tablasRelacionadas = results.filter(row => {
      const tableName = Object.values(row)[0];
      return tableName.toLowerCase().includes('ordenes') || 
             tableName.toLowerCase().includes('migraciones') ||
             tableName.toLowerCase().includes('2025');
    });

    if (tablasRelacionadas.length > 0) {
      console.log('   Tablas que podrían ser relevantes:');
      tablasRelacionadas.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`   • ${tableName}`);
      });
    } else {
      console.log('   No se encontraron tablas con nombres relacionados');
    }

    console.log('\n✅ Listado completado');

  } catch (error) {
    console.error('❌ Error listando tablas:', error);
  }
}

listarTablas();



