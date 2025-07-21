const bcrypt = require('bcryptjs');
const { Usuario } = require('./src/models');
const sequelize = require('./src/config/database');

async function createTestUser() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ where: { email: 'admin@test.com' } });
    
    if (existingUser) {
      console.log('⚠️ El usuario de prueba ya existe');
      return;
    }
    
    console.log('🔧 Creando usuario de prueba...');
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Crear usuario de prueba
    const testUser = await Usuario.create({
      nombre: 'Administrador Test',
      email: 'admin@test.com',
      password: hashedPassword,
      rol: 'administrador'
    });
    
    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log('   📧 Email: admin@test.com');
    console.log('   🔑 Password: 123456');
    console.log('   👤 Rol: administrador');
    console.log('   🆔 ID:', testUser.id);
    
  } catch (error) {
    console.log('❌ Error creando usuario de prueba:');
    console.log('   📄 Error:', error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('💡 Verifica que:');
      console.log('   1. La base de datos MySQL esté corriendo');
      console.log('   2. El archivo .env tenga la configuración correcta');
      console.log('   3. Las credenciales de la base de datos sean correctas');
    }
  } finally {
    await sequelize.close();
  }
}

createTestUser(); 