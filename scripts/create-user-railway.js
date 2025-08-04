#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

console.log('👤 CREANDO USUARIO PARA RAILWAY');
console.log('================================\n');

async function createUserForRailway() {
  try {
    // Usar las mismas credenciales que Railway
    const connection = await mysql.createConnection({
      host: 'trn.cl',
      port: 3306,
      user: 'trn_felipe',
      password: 'RioNegro2025@',
      database: 'trn_extraccion'
    });

    console.log('✅ Conexión a la base de datos exitosa');

    // Verificar si la tabla existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'usuarios'"
    );

    if (tables.length === 0) {
      console.log('❌ La tabla usuarios no existe');
      return;
    }

    // Crear usuario con credenciales simples
    const userData = {
      nombre: 'Admin Railway',
      email: 'admin@railway.com',
      password: 'admin123',
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
      console.log('🔑 Password: admin123');
      console.log('👤 Rol: admin');
      return;
    }

    // Encriptar contraseña con los mismos parámetros que Railway
    const hashedPassword = await bcrypt.hash(userData.password, 12); // Railway usa 12 rounds

    // Insertar usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [userData.nombre, userData.email, hashedPassword, userData.rol]
    );

    console.log('✅ Usuario creado exitosamente para Railway');
    console.log(`📧 Email: ${userData.email}`);
    console.log('🔑 Password: admin123');
    console.log('👤 Rol: admin');
    console.log(`🆔 ID: ${result.insertId}`);

    // También crear un usuario de prueba
    const testUserData = {
      nombre: 'Test User',
      email: 'test@railway.com',
      password: 'test123',
      rol: 'user'
    };

    const [existingTestUsers] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [testUserData.email]
    );

    if (existingTestUsers.length === 0) {
      const testHashedPassword = await bcrypt.hash(testUserData.password, 12);
      
      const [testResult] = await connection.execute(
        'INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [testUserData.nombre, testUserData.email, testHashedPassword, testUserData.rol]
      );

      console.log('\n✅ Usuario de prueba creado');
      console.log(`📧 Email: ${testUserData.email}`);
      console.log('🔑 Password: test123');
      console.log('👤 Rol: user');
    }

    await connection.end();

    console.log('\n🎯 CREDENCIALES PARA RAILWAY:');
    console.log('👤 Admin: admin@railway.com / admin123');
    console.log('👤 Test: test@railway.com / test123');

  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
  }
}

createUserForRailway().catch(console.error); 