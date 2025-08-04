#!/usr/bin/env node

const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🗄️ Duplicando base de datos trn_extraccion a desarrollo...');

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

// Configuración de la base de datos de desarrollo (destino)
const sequelizeDev = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'trn_extraccion_dev',
  username: 'root',
  password: 'password',
  logging: false
});

async function duplicarBaseDeDatos() {
  try {
    console.log('\n📋 PASO 1: Verificando conexión a trn_extraccion...');
    
    // Verificar conexión a producción
    await sequelizeProd.authenticate();
    console.log('✅ Conexión a trn_extraccion exitosa');
    
    console.log('\n📋 PASO 2: Creando base de datos de desarrollo...');
    
    // Crear base de datos de desarrollo si no existe
    try {
      await sequelizeDev.authenticate();
      console.log('✅ Conexión a desarrollo exitosa');
    } catch (error) {
      console.log('⚠️  No se pudo conectar a MySQL local');
      console.log('💡 Instrucciones para configurar MySQL local:');
      console.log('   1. Instalar MySQL Server');
      console.log('   2. Crear usuario root con contraseña "password"');
      console.log('   3. Crear base de datos trn_extraccion_dev');
      console.log('   4. Ejecutar este script nuevamente');
      
      console.log('\n🔄 Continuando con configuración de archivos...');
      
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
      console.log('   - Base de datos: trn_extraccion_dev (cuando esté configurada)');
      
      console.log('\n🚀 Comandos disponibles:');
      console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
      console.log('   - npm start (en backend)              # Iniciar backend');
      console.log('   - npm start (en frontend)             # Iniciar frontend');
      
      return;
    }
    
    console.log('\n📋 PASO 3: Obteniendo estructura de tablas...');
    
    // Obtener lista de tablas de producción
    const [tablas] = await sequelizeProd.query('SHOW TABLES');
    console.log(`📊 Encontradas ${tablas.length} tablas en trn_extraccion`);
    
    // Mostrar las tablas encontradas
    console.log('\n📋 Tablas encontradas:');
    tablas.forEach((tabla, index) => {
      const nombreTabla = Object.values(tabla)[0];
      console.log(`   ${index + 1}. ${nombreTabla}`);
    });
    
    console.log('\n📋 PASO 4: Creando estructura en desarrollo...');
    
    // Crear cada tabla en desarrollo
    for (const tabla of tablas) {
      const nombreTabla = Object.values(tabla)[0];
      console.log(`🔧 Creando tabla: ${nombreTabla}`);
      
      // Obtener estructura de la tabla
      const [estructura] = await sequelizeProd.query(`SHOW CREATE TABLE ${nombreTabla}`);
      const createTableSQL = estructura[0]['Create Table'];
      
      // Crear tabla en desarrollo
      await sequelizeDev.query(createTableSQL);
      console.log(`✅ Tabla ${nombreTabla} creada`);
    }
    
    console.log('\n📋 PASO 5: Copiando datos...');
    
    // Copiar datos de cada tabla
    for (const tabla of tablas) {
      const nombreTabla = Object.values(tabla)[0];
      console.log(`📋 Copiando datos de: ${nombreTabla}`);
      
      // Obtener datos de producción
      const [datos] = await sequelizeProd.query(`SELECT * FROM ${nombreTabla}`);
      
      if (datos.length > 0) {
        // Insertar datos en desarrollo
        for (const registro of datos) {
          const columnas = Object.keys(registro).join(', ');
          const valores = Object.values(registro).map(val => 
            val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`
          ).join(', ');
          
          await sequelizeDev.query(`INSERT INTO ${nombreTabla} (${columnas}) VALUES (${valores})`);
        }
        console.log(`✅ ${datos.length} registros copiados de ${nombreTabla}`);
      } else {
        console.log(`ℹ️  Tabla ${nombreTabla} está vacía`);
      }
    }
    
    console.log('\n📋 PASO 6: Verificando datos...');
    
    // Verificar que los datos se copiaron correctamente
    const [tablasDev] = await sequelizeDev.query('SHOW TABLES');
    console.log(`✅ ${tablasDev.length} tablas creadas en desarrollo`);
    
    // Verificar vista específica
    const [vista] = await sequelizeDev.query("SHOW TABLES LIKE 'vista_danos_acumulados'");
    if (vista.length > 0) {
      const [datosVista] = await sequelizeDev.query('SELECT COUNT(*) as total FROM vista_danos_acumulados');
      console.log(`✅ Vista vista_danos_acumulados: ${datosVista[0].total} registros`);
    }
    
    console.log('\n✅ ¡Base de datos trn_extraccion_dev creada exitosamente!');
    console.log('\n🌐 URLs de Desarrollo:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Base de datos: trn_extraccion_dev');
    
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
    console.log('   - npm start (en backend)              # Iniciar backend');
    console.log('   - npm start (en frontend)             # Iniciar frontend');
    
  } catch (error) {
    console.error('\n❌ Error duplicando base de datos:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solución:');
      console.log('   1. Instalar MySQL Server local');
      console.log('   2. Crear usuario root con contraseña "password"');
      console.log('   3. Crear base de datos trn_extraccion_dev');
      console.log('   4. Ejecutar este script nuevamente');
    }
  } finally {
    await sequelizeProd.close();
    await sequelizeDev.close();
  }
}

duplicarBaseDeDatos(); 