const mysql = require('mysql2/promise');

async function crearDatosPrueba() {
  try {
    console.log('🔧 Creando datos de prueba...');
    
    const connection = await mysql.createConnection({
      host: 'trn.cl',
      user: 'trn_felipe',
      password: 'RioNegro2025@',
      database: 'trn_extraccion_test',
      port: 3306
    });

    // Crear usuario de prueba con contraseña más segura
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuario');
    if (usuarios[0].total === 0) {
      console.log('👤 Creando usuario de prueba...');
      // Contraseña: Test2024! (más segura)
      await connection.execute(`
        INSERT INTO usuario (nombre, apellido, email, password, rol, activo) 
        VALUES ('Admin', 'Test', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1)
      `);
      console.log('✅ Usuario de prueba creado');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Contraseña: Test2024!');
    }

    // Crear barredores de prueba
    const [barredores] = await connection.execute('SELECT COUNT(*) as total FROM barredor');
    if (barredores[0].total === 0) {
      console.log('🧹 Creando barredores de prueba...');
      await connection.execute(`
        INSERT INTO barredor (nombre, apellido, rut, activo) 
        VALUES ('Juan', 'Pérez', '12345678-9', 1)
      `);
      await connection.execute(`
        INSERT INTO barredor (nombre, apellido, rut, activo) 
        VALUES ('María', 'González', '98765432-1', 1)
      `);
      console.log('✅ Barredores de prueba creados');
    }

    await connection.end();
    console.log('✅ Datos de prueba creados exitosamente');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

crearDatosPrueba(); 