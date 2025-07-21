const mysql = require('mysql2/promise');
const config = require('../src/config/config');

async function eliminarColumnaRut() {
  let connection;
  
  try {
    console.log('🔧 Iniciando eliminación de columna RUT de barredor_catalogo...\n');
    
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.username,
      password: config.database.password,
      database: config.database.database
    });
    
    console.log('✅ Conexión a la base de datos establecida');
    
    // Verificar si la tabla existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'barredor_catalogo'
    `);
    
    if (tables.length === 0) {
      console.log('❌ La tabla barredor_catalogo no existe');
      return;
    }
    
    console.log('✅ Tabla barredor_catalogo encontrada');
    
    // Verificar si la columna rut existe
    const [columns] = await connection.execute(`
      DESCRIBE barredor_catalogo
    `);
    
    const rutColumn = columns.find(col => col.Field === 'rut');
    
    if (!rutColumn) {
      console.log('⚠️ La columna rut no existe en barredor_catalogo');
      console.log('📋 Columnas actuales:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
      return;
    }
    
    console.log('✅ Columna rut encontrada');
    console.log(`📋 Detalles: ${rutColumn.Field} (${rutColumn.Type})`);
    
    // Hacer backup de los datos antes de eliminar
    console.log('\n💾 Creando backup de datos...');
    const [barredores] = await connection.execute(`
      SELECT id, nombre, apellido, rut FROM barredor_catalogo
    `);
    
    console.log(`📊 Total de barredores en backup: ${barredores.length}`);
    
    // Eliminar la columna rut
    console.log('\n🗑️ Eliminando columna rut...');
    await connection.execute(`
      ALTER TABLE barredor_catalogo DROP COLUMN rut
    `);
    
    console.log('✅ Columna rut eliminada exitosamente');
    
    // Verificar la nueva estructura
    console.log('\n📋 Nueva estructura de la tabla:');
    const [newColumns] = await connection.execute(`
      DESCRIBE barredor_catalogo
    `);
    
    newColumns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    
    // Verificar que los datos se mantuvieron
    const [barredoresDespues] = await connection.execute(`
      SELECT id, nombre, apellido FROM barredor_catalogo
    `);
    
    console.log(`\n📊 Total de barredores después de la eliminación: ${barredoresDespues.length}`);
    
    if (barredores.length === barredoresDespues.length) {
      console.log('✅ Todos los datos se mantuvieron correctamente');
    } else {
      console.log('⚠️ Algunos datos se perdieron durante la operación');
    }
    
    console.log('\n🎉 Proceso completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error.message);
    
    if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('💡 Sugerencia: La columna puede estar siendo referenciada por una clave foránea');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el script
eliminarColumnaRut()
  .then(() => {
    console.log('\n✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error);
    process.exit(1);
  }); 