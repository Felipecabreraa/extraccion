const sequelize = require('./src/config/database');

async function checkTable() {
  try {
    const [results] = await sequelize.query('SHOW TABLES LIKE "reporte_danos_mensuales"');
    console.log('Tabla existe:', results.length > 0);
    
    if (results.length > 0) {
      const [columns] = await sequelize.query('DESCRIBE reporte_danos_mensuales');
      console.log('Columnas:', columns.map(col => col.Field));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTable(); 