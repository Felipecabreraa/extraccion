#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

console.log('👤 CREANDO USUARIO DE PRUEBA');
console.log('==============================\n');

async function createUser() {
  try {
    // Configuración de la base de datos
    const connection = await mysql.createConnection({
      host: 'trn.cl',
      port: 3306,
      user: 'trn_felipe',
      password: 'RioNegro2025@',
      database: 'trn_extraccion'
    });

    console.log('✅ Conexión a la base de datos exitosa');

    // Datos del usuario
    const userData = {
      nombre: 'Usuario Test',
      email: 'test@trn.com',
      password: 'test123',
      rol: 'admin'
    };

    // Verificar si el usuario ya existe
    const [existingUsers] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [userData.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  El usuario ya existe');
      console.log(`📧 Email: ${userData.email}`);
      console.log('🔑 Password: test123');
      console.log('👤 Rol: admin');
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insertar usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [userData.nombre, userData.email, hashedPassword, userData.rol]
    );

    console.log('✅ Usuario creado exitosamente');
    console.log(`📧 Email: ${userData.email}`);
    console.log('🔑 Password: test123');
    console.log('👤 Rol: admin');
    console.log(`🆔 ID: ${result.insertId}`);

    await connection.end();

  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 La tabla usuarios no existe. Creando tabla...');
      await createTable();
    }
  }
}

async function createTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'trn.cl',
      port: 3306,
      user: 'trn_felipe',
      password: 'RioNegro2025@',
      database: 'trn_extraccion'
    });

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'user', 'supervisor') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Tabla usuarios creada');
    
    await connection.end();
    
    // Intentar crear usuario nuevamente
    await createUser();

  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
  }
}

createUser().catch(console.error); 