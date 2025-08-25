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

// Función de debug de autenticación integrada
async function debugAuth() {
  try {
    console.log('🔍 Debugging autenticación...');
    
    const jwt = require('jsonwebtoken');
    const { Usuario } = require('./src/models');
    
    // Verificar JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_super_seguro_2024';
    console.log('📊 JWT_SECRET configurado:', JWT_SECRET ? 'SÍ' : 'NO');
    
    // Verificar usuarios en la BD
    console.log('👥 Verificando usuarios...');
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'activo']
    });
    
    console.log(`📊 Total usuarios: ${usuarios.length}`);
    usuarios.forEach(user => {
      console.log(`   - ${user.email} (${user.rol}) - Activo: ${user.activo}`);
    });
    
    // Verificar usuario admin específico
    const adminUser = await Usuario.findOne({ 
      where: { email: 'admin@admin.com' },
      attributes: ['id', 'nombre', 'email', 'rol', 'activo']
    });
    
    if (adminUser) {
      console.log('✅ Usuario admin encontrado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Rol: ${adminUser.rol}`);
      console.log(`   Activo: ${adminUser.activo}`);
      
      // Generar token de prueba
      const token = jwt.sign(
        { 
          id: adminUser.id, 
          email: adminUser.email, 
          rol: adminUser.rol 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      console.log('🔑 Token de prueba generado:');
      console.log(`   ${token.substring(0, 50)}...`);
      
      // Verificar token
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verificado correctamente:');
        console.log(`   ID: ${decoded.id}`);
        console.log(`   Email: ${decoded.email}`);
        console.log(`   Rol: ${decoded.rol}`);
      } catch (error) {
        console.error('❌ Error verificando token:', error.message);
      }
      
    } else {
      console.log('❌ Usuario admin no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error en debug de autenticación:', error);
  }
}

// Función de configuración de Puppeteer integrada
async function setupPuppeteer() {
  try {
    console.log('🔧 Configurando Puppeteer...');
    
    const puppeteer = require('puppeteer');
    
    // Configurar Puppeteer para Render
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
    });
    
    console.log('✅ Puppeteer configurado correctamente');
    
    // Verificar que funciona
    const page = await browser.newPage();
    await page.setContent('<html><body><h1>Test</h1></body></html>');
    const pdf = await page.pdf({ format: 'A4' });
    
    console.log('✅ Generación de PDF funciona correctamente');
    console.log(`📄 Tamaño del PDF: ${pdf.length} bytes`);
    
    await browser.close();
    console.log('✅ Browser cerrado correctamente');
    
  } catch (error) {
    console.error('❌ Error configurando Puppeteer:', error.message);
    
    // Configuración alternativa
    console.log('🔄 Intentando configuración alternativa...');
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      console.log('✅ Configuración alternativa exitosa');
      await browser.close();
      
    } catch (altError) {
      console.error('❌ Configuración alternativa también falló:', altError.message);
    }
  }
}

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
    
         // Debug de autenticación integrado
     await debugAuth();
     
     // Corregir roles de usuarios
     console.log('🔧 Corrigiendo roles de usuarios...');
     require('./fix-user-roles.js');
     
     // Configurar Puppeteer integrado
     await setupPuppeteer();
    
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
