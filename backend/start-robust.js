#!/usr/bin/env node

// Script de inicio robusto para Render
console.log('🚀 Iniciando servidor robusto para Render...');

// Configurar variables de entorno
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_super_seguro_2024';

const PORT = process.env.PORT || 3000;

console.log('📊 Configuración:');
console.log('   PORT:', PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_NAME:', process.env.DB_NAME);

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  // No salir del proceso, solo loggear
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  // No salir del proceso, solo loggear
});

// Función principal
async function startServer() {
  try {
    console.log('📦 Cargando aplicación...');
    
    // Cargar la aplicación
    const app = require('./src/app.js');
    
    console.log('✅ Aplicación cargada correctamente');
    
    // Verificar base de datos
    console.log('🔍 Verificando base de datos...');
    const sequelize = require('./src/config/database');
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');
    
    // Verificar usuarios
    console.log('👥 Verificando usuarios...');
    const { Usuario } = require('./src/models');
    const bcrypt = require('bcryptjs');
    
    const adminUser = await Usuario.findOne({ where: { email: 'admin@admin.com' } });
    if (!adminUser) {
      console.log('⚠️ Usuario admin@admin.com no existe. Creándolo...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        rol: 'admin',
        activo: true
      });
      console.log('✅ Usuario admin@admin.com creado');
    } else {
      console.log('✅ Usuario admin@admin.com ya existe');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🎉 Servidor iniciado exitosamente!');
      console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
      console.log(`📊 Modo: ${process.env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🔗 Auth: http://localhost:${PORT}/api/auth/login`);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    console.error('Stack trace:', error.stack);
    
    // Esperar un poco antes de intentar reiniciar
    console.log('🔄 Esperando 5 segundos antes de salir...');
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  }
}

// Iniciar el servidor
console.log('🚀 Iniciando proceso principal...');
startServer().catch(error => {
  console.error('❌ Error en proceso principal:', error);
  process.exit(1);
});
