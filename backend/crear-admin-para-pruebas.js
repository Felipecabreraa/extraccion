const bcrypt = require('bcryptjs');
const { Usuario } = require('./src/models');

async function crearAdminParaPruebas() {
  try {
    console.log('🔧 Creando usuario administrador para pruebas...');

    // Verificar si ya existe un admin
    const adminExistente = await Usuario.findOne({
      where: { email: 'admin@test.com' }
    });

    if (adminExistente) {
      console.log('✅ Usuario administrador ya existe');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Rol: administrador');
      return;
    }

    // Crear hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Crear usuario administrador
    const admin = await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@test.com',
      password: hashedPassword,
      rol: 'administrador',
      estado: 'activo'
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Rol: administrador');
    console.log('🆔 ID:', admin.id);

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
  }
}

crearAdminParaPruebas();