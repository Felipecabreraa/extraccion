const mysql = require('mysql2/promise');
const config = require('../src/config/config');
const { BarredorCatalogo } = require('../src/models');

async function verificarProblemaBarredores() {
  let connection;
  
  try {
    console.log('🔍 Verificando problema con barredores...\n');
    
    // Determinar el entorno
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = config[env];
    
    console.log(`🌍 Entorno: ${env}`);
    console.log('📋 Configuración de base de datos:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Username: ${dbConfig.username}`);
    console.log(`   Port: ${dbConfig.port}`);
    
    // 1. Verificar conexión directa a MySQL
    console.log('\n1️⃣ Verificando conexión directa a MySQL...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    console.log('✅ Conexión directa a MySQL exitosa');
    
    // 2. Verificar estructura de la tabla
    console.log('\n2️⃣ Verificando estructura de la tabla...');
    const [columns] = await connection.execute(`
      DESCRIBE barredor_catalogo
    `);
    
    console.log('📋 Estructura actual:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 3. Verificar si hay datos existentes
    console.log('\n3️⃣ Verificando datos existentes...');
    const [barredores] = await connection.execute(`
      SELECT id, nombre, apellido FROM barredor_catalogo LIMIT 5
    `);
    
    console.log(`📊 Total de barredores: ${barredores.length}`);
    if (barredores.length > 0) {
      console.log('📋 Datos existentes:');
      barredores.forEach(b => {
        console.log(`   - ID: ${b.id}, Nombre: ${b.nombre}, Apellido: ${b.apellido}`);
      });
    }
    
    // 4. Probar inserción directa en MySQL
    console.log('\n4️⃣ Probando inserción directa en MySQL...');
    try {
      const [result] = await connection.execute(`
        INSERT INTO barredor_catalogo (nombre, apellido) VALUES (?, ?)
      `, ['Test', 'Usuario']);
      
      console.log('✅ Inserción directa exitosa');
      console.log(`   ID generado: ${result.insertId}`);
      
      // Verificar que se insertó correctamente
      const [nuevoBarredor] = await connection.execute(`
        SELECT id, nombre, apellido FROM barredor_catalogo WHERE id = ?
      `, [result.insertId]);
      
      if (nuevoBarredor.length > 0) {
        console.log('✅ Verificación de inserción exitosa');
        console.log(`   Datos: ${nuevoBarredor[0].nombre} ${nuevoBarredor[0].apellido}`);
      }
      
      // Limpiar el dato de prueba
      await connection.execute(`
        DELETE FROM barredor_catalogo WHERE id = ?
      `, [result.insertId]);
      console.log('🧹 Dato de prueba eliminado');
      
    } catch (error) {
      console.log('❌ Error en inserción directa:', error.message);
    }
    
    // 5. Probar inserción con Sequelize
    console.log('\n5️⃣ Probando inserción con Sequelize...');
    try {
      const barredor = await BarredorCatalogo.create({
        nombre: 'Test',
        apellido: 'Sequelize'
      });
      
      console.log('✅ Inserción con Sequelize exitosa');
      console.log(`   ID: ${barredor.id}, Nombre: ${barredor.nombre}, Apellido: ${barredor.apellido}`);
      
      // Limpiar el dato de prueba
      await barredor.destroy();
      console.log('🧹 Dato de prueba eliminado');
      
    } catch (error) {
      console.log('❌ Error en inserción con Sequelize:', error.message);
      console.log('   Detalles:', error);
    }
    
    // 6. Verificar permisos de usuario
    console.log('\n6️⃣ Verificando permisos de usuario...');
    try {
      const [privileges] = await connection.execute(`
        SHOW GRANTS FOR CURRENT_USER()
      `);
      
      console.log('📋 Privilegios del usuario:');
      privileges.forEach(priv => {
        console.log(`   - ${priv['Grants for ' + dbConfig.username + '@' + dbConfig.host]}`);
      });
      
    } catch (error) {
      console.log('⚠️ No se pudieron verificar privilegios:', error.message);
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar verificación
verificarProblemaBarredores()
  .then(() => {
    console.log('\n✅ Verificación completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  }); 