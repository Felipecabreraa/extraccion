const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { sequelize } = require('../config/database');

async function createTestUser() {
  try {
    console.log('🔧 Creando usuario de prueba...');
    
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ 
      where: { email: 'test@extraccion.com' } 
    });
    
    if (existingUser) {
      console.log('✅ Usuario de prueba ya existe');
      return existingUser;
    }
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Crear usuario de prueba
    const testUser = await Usuario.create({
      nombre: 'Usuario de Prueba',
      email: 'test@extraccion.com',
      password: hashedPassword,
      rol: 'admin',
      activo: true
    });
    
    console.log('✅ Usuario de prueba creado exitosamente:', {
      id: testUser.id,
      nombre: testUser.nombre,
      email: testUser.email,
      rol: testUser.rol
    });
    
    return testUser;
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser }; 