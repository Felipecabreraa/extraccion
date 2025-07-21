const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');

// Función para crear usuario con datos personalizados
async function crearUsuarioPersonalizado(nombre, email, password, rol = 'administrador') {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Validar datos de entrada
    if (!nombre || !email || !password) {
      console.error('❌ Error: nombre, email y password son obligatorios');
      return;
    }

    // Validar rol
    const rolesValidos = ['administrador', 'operador', 'supervisor'];
    if (!rolesValidos.includes(rol)) {
      console.error(`❌ Error: rol debe ser uno de: ${rolesValidos.join(', ')}`);
      return;
    }

    console.log('👤 Creando usuario...');
    console.log(`📝 Nombre: ${nombre}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${password}`);
    console.log(`👑 Rol: ${rol}`);

    // Verificar si el usuario ya existe
    const usuariosExistentes = await sequelize.query(
      'SELECT id, nombre, email, rol FROM usuario WHERE email = ?',
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (usuariosExistentes && usuariosExistentes.length > 0) {
      console.log('⚠️  El usuario ya existe:');
      console.log(`   ID: ${usuariosExistentes[0].id}`);
      console.log(`   Nombre: ${usuariosExistentes[0].nombre}`);
      console.log(`   Email: ${usuariosExistentes[0].email}`);
      console.log(`   Rol: ${usuariosExistentes[0].rol}`);
      return;
    }

    // Hashear la contraseña
    const hash = await bcrypt.hash(password, 10);
    console.log('🔐 Contraseña hasheada correctamente');

    // Insertar el usuario
    await sequelize.query(
      'INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      {
        replacements: [nombre, email, hash, rol]
      }
    );

    console.log('✅ Usuario creado exitosamente!');
    
    // Obtener el ID del usuario insertado
    const usuarioInsertado = await sequelize.query(
      'SELECT id, nombre, email, rol FROM usuario WHERE email = ?',
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (usuarioInsertado && usuarioInsertado.length > 0) {
      const usuario = usuarioInsertado[0];
      console.log(`🆔 ID del usuario: ${usuario.id}`);
      
      console.log('\n📋 Detalles del usuario creado:');
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Nombre: ${usuario.nombre}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol}`);
    }

    console.log('\n🎉 ¡Usuario listo para usar!');
    console.log('💡 Puedes iniciar sesión con:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejemplos de uso - puedes modificar estos valores
console.log('🚀 CREANDO USUARIOS DE EJEMPLO\n');

// Usuario administrador por defecto
crearUsuarioPersonalizado(
  'Felipe Lagos',
  'admin@admin.com',
  'admin123',
  'administrador'
);

// Descomenta las siguientes líneas para crear más usuarios
/*
// Usuario supervisor
crearUsuarioPersonalizado(
  'Supervisor General',
  'supervisor@extraccion.com',
  'supervisor123',
  'supervisor'
);

// Usuario operador
crearUsuarioPersonalizado(
  'Operador Principal',
  'operador@extraccion.com',
  'operador123',
  'operador'
);
*/ 