const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function crearUsuariosPrueba() {
  console.log('🔧 CREANDO USUARIOS DE PRUEBA\n');
  
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Conexión a la base de datos exitosa\n');
    
    // Usuarios de prueba con contraseña 'password'
    const usuariosPrueba = [
      { 
        nombre: 'Administrador Test', 
        email: 'admin@test.com', 
        password: 'password', 
        rol: 'administrador' 
      },
      { 
        nombre: 'Supervisor Test', 
        email: 'supervisor@test.com', 
        password: 'password', 
        rol: 'supervisor' 
      },
      { 
        nombre: 'Operador Test', 
        email: 'operador@test.com', 
        password: 'password', 
        rol: 'operador' 
      }
    ];
    
    for (const usuario of usuariosPrueba) {
      try {
        // Verificar si el usuario ya existe
        const [existe] = await connection.execute(
          'SELECT id FROM usuario WHERE email = ?',
          [usuario.email]
        );
        
        if (existe.length > 0) {
          console.log(`   ℹ️  Usuario ya existe: ${usuario.email}`);
          
          // Actualizar contraseña si es necesario
          const hash = await bcrypt.hash(usuario.password, 10);
          await connection.execute(
            'UPDATE usuario SET password = ? WHERE email = ?',
            [hash, usuario.email]
          );
          console.log(`   🔄 Contraseña actualizada para: ${usuario.email}`);
        } else {
          console.log(`   ➕ Creando usuario: ${usuario.email}`);
          
          // Crear hash de la contraseña
          const hash = await bcrypt.hash(usuario.password, 10);
          
          // Insertar usuario
          await connection.execute(
            'INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [usuario.nombre, usuario.email, hash, usuario.rol]
          );
          
          console.log(`   ✅ Usuario creado: ${usuario.email} (${usuario.rol})`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error con usuario ${usuario.email}:`, error.message);
      }
    }
    
    // Verificar usuarios creados
    console.log('\n📋 Verificando usuarios creados...');
    const [usuarios] = await connection.execute('SELECT id, nombre, email, rol FROM usuario ORDER BY id');
    
    usuarios.forEach(usuario => {
      console.log(`   - ID: ${usuario.id} | Nombre: ${usuario.nombre} | Email: ${usuario.email} | Rol: ${usuario.rol}`);
    });
    
    console.log('\n✅ Usuarios de prueba listos');
    console.log('\n🔑 Credenciales de prueba:');
    console.log('   - admin@test.com / password (administrador)');
    console.log('   - supervisor@test.com / password (supervisor)');
    console.log('   - operador@test.com / password (operador)');
    
  } catch (error) {
    console.error('❌ Error durante la creación:', error.message);
    if (error.code) {
      console.error('   Código de error:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar creación
crearUsuariosPrueba().then(() => {
  console.log('\n🏁 Proceso completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
}); 