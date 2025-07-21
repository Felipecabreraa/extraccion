const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function crearUsuarioAdminSimple() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Datos del usuario administrador
    const datosUsuario = {
      nombre: 'Administrador',
      email: 'admin@admin.com',
      password: 'admin123',
      rol: 'administrador'
    };

    console.log('👤 Creando usuario administrador...');
    console.log(`📧 Email: ${datosUsuario.email}`);
    console.log(`🔑 Contraseña: ${datosUsuario.password}`);

    // Verificar si el usuario ya existe
    const usuariosExistentes = await sequelize.query(
      'SELECT id, nombre, email, rol FROM usuario WHERE email = ?',
      {
        replacements: [datosUsuario.email],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (usuariosExistentes.length > 0) {
      console.log('⚠️  El usuario ya existe:');
      console.log(`   ID: ${usuariosExistentes[0].id}`);
      console.log(`   Nombre: ${usuariosExistentes[0].nombre}`);
      console.log(`   Email: ${usuariosExistentes[0].email}`);
      console.log(`   Rol: ${usuariosExistentes[0].rol}`);
      
      // Actualizar la contraseña si es necesario
      console.log('\n🔄 Actualizando contraseña...');
      const hash = await bcrypt.hash(datosUsuario.password, 10);
      await sequelize.query(
        'UPDATE usuario SET password = ? WHERE email = ?',
        {
          replacements: [hash, datosUsuario.email]
        }
      );
      console.log('✅ Contraseña actualizada');
      return;
    }

    // Hashear la contraseña
    const hash = await bcrypt.hash(datosUsuario.password, 10);
    console.log('🔐 Contraseña hasheada correctamente');

    // Insertar el usuario
    await sequelize.query(
      'INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      {
        replacements: [
          datosUsuario.nombre,
          datosUsuario.email,
          hash,
          datosUsuario.rol
        ]
      }
    );

    console.log('✅ Usuario administrador creado exitosamente!');

    // Verificar que se creó correctamente
    const usuarioCreado = await sequelize.query(
      'SELECT id, nombre, email, rol FROM usuario WHERE email = ?',
      {
        replacements: [datosUsuario.email],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (usuarioCreado.length > 0) {
      console.log('\n📋 Detalles del usuario creado:');
      console.log(`   ID: ${usuarioCreado[0].id}`);
      console.log(`   Nombre: ${usuarioCreado[0].nombre}`);
      console.log(`   Email: ${usuarioCreado[0].email}`);
      console.log(`   Rol: ${usuarioCreado[0].rol}`);
    }

    console.log('\n🎉 ¡Usuario administrador listo para usar!');
    console.log('💡 Puedes iniciar sesión con:');
    console.log(`   Email: ${datosUsuario.email}`);
    console.log(`   Contraseña: ${datosUsuario.password}`);

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la función
crearUsuarioAdminSimple(); 