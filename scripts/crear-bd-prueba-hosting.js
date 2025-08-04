#!/usr/bin/env node

const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🗄️ Creando base de datos de prueba trn_extraccion_test...');

// Configuración de la base de datos de producción (origen) - trn_extraccion
const sequelizeProd = new Sequelize({
  dialect: 'mysql',
  host: 'trn.cl',
  port: 3306,
  database: 'trn_extraccion',
  username: 'trn_felipe',
  password: 'RioNegro2025@',
  logging: false
});

async function crearBaseDeDatosPrueba() {
  try {
    console.log('\n📋 PASO 1: Verificando conexión a trn_extraccion...');
    
    // Verificar conexión a producción
    await sequelizeProd.authenticate();
    console.log('✅ Conexión a trn_extraccion exitosa');
    
    console.log('\n📋 PASO 2: Verificando si existe trn_extraccion_test...');
    
    // Intentar conectar a la base de datos de prueba
    const sequelizeTest = new Sequelize({
      dialect: 'mysql',
      host: 'trn.cl',
      port: 3306,
      database: 'trn_extraccion_test',
      username: 'trn_felipe',
      password: 'RioNegro2025@',
      logging: false
    });
    
    try {
      await sequelizeTest.authenticate();
      console.log('✅ Base de datos trn_extraccion_test ya existe');
      
      // Verificar tablas
      const [tablas] = await sequelizeTest.query('SHOW TABLES');
      console.log(`📊 Encontradas ${tablas.length} tablas en trn_extraccion_test`);
      
      if (tablas.length > 0) {
        console.log('✅ Base de datos de prueba está lista para usar');
        console.log('\n🌐 URLs de Prueba:');
        console.log('   - Backend: http://localhost:3001');
        console.log('   - Frontend: http://localhost:3000');
        console.log('   - Base de datos: trn_extraccion_test (en hosting)');
        
        console.log('\n🚀 Comandos disponibles:');
        console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
        console.log('   - npm start (en backend)              # Iniciar backend');
        console.log('   - npm start (en frontend)             # Iniciar frontend');
        
        return;
      }
    } catch (error) {
      console.log('⚠️  Base de datos trn_extraccion_test no existe');
      console.log('💡 Necesitas crear la base de datos manualmente en el hosting');
      console.log('\n📋 Instrucciones para crear la base de datos:');
      console.log('   1. Acceder al panel de control del hosting');
      console.log('   2. Ir a phpMyAdmin o gestor de bases de datos');
      console.log('   3. Crear nueva base de datos: trn_extraccion_test');
      console.log('   4. Asignar permisos al usuario trn_felipe');
      console.log('   5. Ejecutar este script nuevamente');
      
      console.log('\n🔄 Configurando archivos de entorno...');
      
      // Configurar archivos de entorno para desarrollo
      const fs = require('fs');
      const path = require('path');
      
      // Copiar configuración de desarrollo
      fs.copyFileSync(
        path.join(__dirname, '../backend/env.development'),
        path.join(__dirname, '../backend/.env')
      );
      
      console.log('✅ Archivos de entorno configurados para desarrollo');
      console.log('\n🌐 URLs de Desarrollo:');
      console.log('   - Backend: http://localhost:3001');
      console.log('   - Frontend: http://localhost:3000');
      console.log('   - Base de datos: trn_extraccion_test (cuando esté creada)');
      
      console.log('\n🚀 Comandos disponibles:');
      console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
      console.log('   - npm start (en backend)              # Iniciar backend');
      console.log('   - npm start (en frontend)             # Iniciar frontend');
      
      return;
    }
    
  } catch (error) {
    console.error('\n❌ Error verificando base de datos:', error.message);
  } finally {
    await sequelizeProd.close();
  }
}

crearBaseDeDatosPrueba(); 