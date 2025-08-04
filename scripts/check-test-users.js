const mysql = require('mysql2/promise');

async function checkTestUsers() {
  console.log('🔍 Verificando usuarios en la base de datos de pruebas...');

  const dbConfig = {
    host: 'trn.cl',
    user: 'trn_felipe',
    password: 'RioNegro2025@',
    database: 'trn_extraccion_test',
    port: 3306
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a trn_extraccion_test exitosa');

    // Verificar todos los usuarios
    const [users] = await connection.execute(
      'SELECT id, nombre, email, rol FROM usuario ORDER BY id'
    );

    console.log(`\n📋 Usuarios encontrados (${users.length}):`);
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id} | Email: ${user.email} | Nombre: ${user.nombre} | Rol: ${user.rol}`);
      });
    }

    // Verificar si existe el usuario de prueba
    const [testUser] = await connection.execute(
      'SELECT id, nombre, email, rol FROM usuario WHERE email = ?',
      ['admin@test.com']
    );

    if (testUser.length > 0) {
      console.log('\n✅ Usuario de prueba encontrado:');
      console.log(`   Email: ${testUser[0].email}`);
      console.log(`   Nombre: ${testUser[0].nombre}`);
      console.log(`   Rol: ${testUser[0].rol}`);
    } else {
      console.log('\n❌ Usuario admin@test.com no encontrado');
    }

    // Verificar otros usuarios comunes
    const commonEmails = ['admin@trn.com', 'admin@admin.com', 'test@test.com'];
    
    for (const email of commonEmails) {
      const [user] = await connection.execute(
        'SELECT id, nombre, email, rol FROM usuario WHERE email = ?',
        [email]
      );
      
      if (user.length > 0) {
        console.log(`\n✅ Usuario ${email} encontrado:`);
        console.log(`   Nombre: ${user[0].nombre}`);
        console.log(`   Rol: ${user[0].rol}`);
      }
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error verificando usuarios:', {
      message: error.message,
      code: error.code
    });
  }
}

checkTestUsers(); 