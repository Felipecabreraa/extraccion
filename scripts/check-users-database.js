#!/usr/bin/env node

const mysql = require('mysql2/promise');

console.log('👥 VERIFICANDO USUARIOS EN LA BASE DE DATOS');
console.log('============================================\n');

async function checkUsers() {
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

    // Verificar si la tabla existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'usuarios'"
    );

    if (tables.length === 0) {
      console.log('❌ La tabla usuarios no existe');
      return;
    }

    // Obtener todos los usuarios
    const [users] = await connection.execute(
      'SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id'
    );

    console.log(`📊 Total de usuarios: ${users.length}\n`);

    if (users.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos');
      console.log('💡 Creando usuario de prueba...');
      
      // Crear usuario de prueba
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const [result] = await connection.execute(
        'INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        ['Usuario Test', 'test@trn.com', hashedPassword, 'admin']
      );
      
      console.log('✅ Usuario de prueba creado');
      console.log('📧 Email: test@trn.com');
      console.log('🔑 Password: test123');
      console.log('👤 Rol: admin');
    } else {
      console.log('👥 USUARIOS EN LA BASE DE DATOS:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.nombre}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🎭 Rol: ${user.rol}`);
        console.log(`   📅 Creado: ${user.created_at}`);
        console.log('');
      });
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
  }
}

checkUsers().catch(console.error); 