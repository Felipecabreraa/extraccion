const mysql = require('mysql2/promise');
const config = require('../src/config/config');

async function verificarEstructuraBarredores() {
  let connection;
  
  try {
    console.log('🔍 Verificando estructura de la tabla barredor_catalogo...\n');
    
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
    
    // Obtener estructura de la tabla
    const [columns] = await connection.execute(`
      DESCRIBE barredor_catalogo
    `);
    
    console.log('\n📋 Estructura actual de la tabla:');
    console.log('┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Campo       │ Tipo        │ Null        │ Key         │ Default     │ Extra       │');
    console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    
    columns.forEach(col => {
      console.log(`│ ${col.Field.padEnd(11)} │ ${col.Type.padEnd(11)} │ ${col.Null.padEnd(11)} │ ${col.Key.padEnd(11)} │ ${(col.Default || '').padEnd(11)} │ ${col.Extra.padEnd(11)} │`);
    });
    
    console.log('└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
    
    // Verificar si existe la columna rut
    const rutColumn = columns.find(col => col.Field === 'rut');
    
    if (rutColumn) {
      console.log('\n⚠️ La columna RUT aún existe en la tabla');
      console.log(`   Detalles: ${rutColumn.Field} (${rutColumn.Type})`);
      console.log('\n💡 Para eliminarla, ejecuta: node scripts/eliminar_columna_rut.js');
    } else {
      console.log('\n✅ La columna RUT ya fue eliminada correctamente');
    }
    
    // Mostrar algunos datos de ejemplo
    const [barredores] = await connection.execute(`
      SELECT id, nombre, apellido FROM barredor_catalogo LIMIT 5
    `);
    
    if (barredores.length > 0) {
      console.log('\n📊 Datos de ejemplo:');
      console.log('┌─────┬─────────────┬─────────────┐');
      console.log('│ ID  │ Nombre      │ Apellido    │');
      console.log('├─────┼─────────────┼─────────────┤');
      
      barredores.forEach(b => {
        console.log(`│ ${b.id.toString().padEnd(3)} │ ${b.nombre.padEnd(11)} │ ${b.apellido.padEnd(11)} │`);
      });
      
      console.log('└─────┴─────────────┴─────────────┘');
    } else {
      console.log('\n📊 No hay datos en la tabla');
    }
    
    // Contar total de registros
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM barredor_catalogo
    `);
    
    console.log(`\n📈 Total de barredores en el catálogo: ${count[0].total}`);
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el script
verificarEstructuraBarredores()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  }); 