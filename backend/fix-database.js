const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  console.log('🔧 Solucionando problema de índices en la base de datos...\n');
  
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'extraccion'
    });

    console.log('✅ Conectado a MySQL');

    // Verificar índices existentes en la tabla usuario
    console.log('\n📊 Verificando índices en tabla usuario...');
    const [indexes] = await connection.execute(`
      SHOW INDEX FROM usuario
    `);
    
    console.log(`   Encontrados ${indexes.length} índices:`);
    indexes.forEach(index => {
      console.log(`   - ${index.Key_name} (${index.Column_name})`);
    });

    // Si hay demasiados índices, eliminar los innecesarios
    if (indexes.length > 10) {
      console.log('\n⚠️ Demasiados índices detectados. Limpiando índices innecesarios...');
      
      // Eliminar índices duplicados o innecesarios (excepto PRIMARY y UNIQUE importantes)
      const indexesToRemove = indexes
        .filter(index => 
          !['PRIMARY'].includes(index.Key_name) && 
          !index.Key_name.includes('UNIQUE') &&
          index.Key_name.includes('_')
        )
        .map(index => index.Key_name)
        .filter((value, index, self) => self.indexOf(value) === index); // Remover duplicados

      console.log(`   Índices a eliminar: ${indexesToRemove.join(', ')}`);

      for (const indexName of indexesToRemove) {
        try {
          await connection.execute(`DROP INDEX \`${indexName}\` ON usuario`);
          console.log(`   ✅ Eliminado índice: ${indexName}`);
        } catch (error) {
          console.log(`   ⚠️ No se pudo eliminar ${indexName}: ${error.message}`);
        }
      }
    }

    // Verificar estructura de la tabla
    console.log('\n📋 Verificando estructura de la tabla usuario...');
    const [columns] = await connection.execute(`
      DESCRIBE usuario
    `);
    
    console.log('   Estructura actual:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\n✅ Base de datos optimizada correctamente');
    
  } catch (error) {
    console.error('❌ Error solucionando base de datos:', error.message);
    
    if (error.code === 'ER_TOO_MANY_KEYS') {
      console.log('\n💡 SOLUCIÓN ALTERNATIVA:');
      console.log('1. Elimina la base de datos actual:');
      console.log('   DROP DATABASE extraccion;');
      console.log('2. Crea una nueva base de datos:');
      console.log('   CREATE DATABASE extraccion;');
      console.log('3. Ejecuta el backend nuevamente');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDatabase(); 