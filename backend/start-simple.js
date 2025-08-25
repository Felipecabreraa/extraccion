#!/usr/bin/env node

// Script de inicio simple para Render
console.log('🚀 Iniciando servidor simple para Render...');

// Forzar variables de entorno críticas
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_super_seguro_2024';

// Usar el puerto que Render espera (10000) o 3000 como fallback
const PORT = process.env.PORT || 3000;

console.log('📊 Variables de entorno configuradas:');
console.log('   PORT:', PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_NAME:', process.env.DB_NAME);

// Verificar variables de base de datos
const dbVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = dbVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de BD faltantes:', missingVars);
  process.exit(1);
}

console.log('✅ Variables de BD configuradas');

  // Cargar la aplicación completa con todas las rutas
  try {
    console.log('📦 Cargando aplicación completa...');
    const app = require('./src/app.js');
    
    // Iniciar servidor con la aplicación completa
    const startServer = async () => {
      try {
        const sequelize = require('./src/config/database');
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL exitosa');
        
        // Verificar y crear usuarios si es necesario
        console.log('👥 Verificando usuarios en la base de datos...');
        const { Usuario } = require('./src/models');
        const bcrypt = require('bcryptjs');
        
        const totalUsuarios = await Usuario.count();
        console.log(`📊 Total de usuarios en la BD: ${totalUsuarios}`);
        
                 if (totalUsuarios === 0) {
           console.log('⚠️ No hay usuarios. Creando usuario de prueba...');
           
           const hashedPassword = await bcrypt.hash('admin123', 10);
           await Usuario.create({
             nombre: 'Administrador',
             email: 'admin@admin.com',
             password: hashedPassword,
             rol: 'admin',
             activo: true
           });
           
           console.log('✅ Usuario de prueba creado: admin@admin.com / admin123');
                 } else {
           console.log('✅ Hay usuarios en la base de datos');
           
           // Verificar si existe el usuario admin@admin.com
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
         }
        
        app.listen(PORT, () => {
          console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
          console.log(`📊 Modo: production`);
          console.log(`🔗 URL: http://localhost:${PORT}`);
          console.log(`🔗 Health check: http://localhost:${PORT}/health`);
          console.log(`🔗 API: http://localhost:${PORT}/api`);
        });
      } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
      }
    };

    startServer();
  
} catch (error) {
  console.error('❌ Error cargando la aplicación:', error);
  process.exit(1);
}
