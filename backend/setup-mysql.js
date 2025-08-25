// Script para configurar MySQL
const mysql = require('mysql2/promise');

async function setupMySQL() {
  try {
    console.log('🔧 Configurando MySQL...');
    
    // Intentar conectar sin contraseña primero
    let connection;
    try {
      connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
      });
      console.log('✅ Conexión exitosa sin contraseña');
    } catch (error) {
      console.log('❌ No se pudo conectar sin contraseña, intentando con contraseña...');
      try {
        connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'root'
        });
        console.log('✅ Conexión exitosa con contraseña "root"');
      } catch (error2) {
        console.log('❌ No se pudo conectar con contraseña "root"');
        console.log('💡 Instrucciones para configurar MySQL:');
        console.log('1. Abrir MySQL Command Line Client');
        console.log('2. Ejecutar: ALTER USER "root"@"localhost" IDENTIFIED BY "root";');
        console.log('3. Ejecutar: FLUSH PRIVILEGES;');
        console.log('4. O crear un usuario nuevo:');
        console.log('   CREATE USER "extraccion"@"localhost" IDENTIFIED BY "extraccion123";');
        console.log('   GRANT ALL PRIVILEGES ON extraccion.* TO "extraccion"@"localhost";');
        console.log('   FLUSH PRIVILEGES;');
        return;
      }
    }
    
    // Crear base de datos si no existe
    await connection.execute('CREATE DATABASE IF NOT EXISTS extraccion');
    console.log('✅ Base de datos "extraccion" creada/verificada');
    
    // Usar la base de datos
    await connection.execute('USE extraccion');
    console.log('✅ Base de datos "extraccion" seleccionada');
    
    await connection.end();
    console.log('✅ Configuración de MySQL completada');
    
  } catch (error) {
    console.error('❌ Error configurando MySQL:', error.message);
  }
}

setupMySQL();
