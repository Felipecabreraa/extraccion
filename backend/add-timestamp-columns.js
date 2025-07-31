const sequelize = require('./src/config/database');

async function addTimestampColumns() {
  try {
    console.log('🔧 Agregando columnas de timestamp...');
    
    // Agregar columna fecha_creacion
    await sequelize.query('ALTER TABLE reporte_danos_mensuales ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    console.log('✅ Columna fecha_creacion agregada');
    
    // Agregar columna fecha_actualizacion
    await sequelize.query('ALTER TABLE reporte_danos_mensuales ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    console.log('✅ Columna fecha_actualizacion agregada');
    
    // Verificar estructura
    const [columns] = await sequelize.query('DESCRIBE reporte_danos_mensuales');
    console.log('📋 Estructura actualizada:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    console.log('✅ Columnas de timestamp agregadas exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addTimestampColumns(); 