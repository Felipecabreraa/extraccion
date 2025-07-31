const sequelize = require('./src/config/database');

async function fixMigration() {
  try {
    await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES ("20250120000000-create-reporte-danos-mensuales.js") ON DUPLICATE KEY UPDATE name = name');
    console.log('✅ Migración marcada como completada');
    
    // Verificar estado
    const [results] = await sequelize.query('SELECT * FROM SequelizeMeta WHERE name = "20250120000000-create-reporte-danos-mensuales.js"');
    console.log('Estado de migración:', results.length > 0 ? 'COMPLETADA' : 'PENDIENTE');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixMigration(); 