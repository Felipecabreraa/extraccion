#!/usr/bin/env node

const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🗄️ Duplicando base de datos trn_extraccion a trn_extraccion_test en hosting...');

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

// Configuración de la base de datos de prueba (destino) - trn_extraccion_test
const sequelizeTest = new Sequelize({
  dialect: 'mysql',
  host: 'trn.cl',
  port: 3306,
  database: 'trn_extraccion_test',
  username: 'trn_felipe',
  password: 'RioNegro2025@',
  logging: false
});

async function duplicarBaseDeDatosPrueba() {
  try {
    console.log('\n📋 PASO 1: Verificando conexión a trn_extraccion...');
    
    // Verificar conexión a producción
    await sequelizeProd.authenticate();
    console.log('✅ Conexión a trn_extraccion exitosa');
    
    console.log('\n📋 PASO 2: Creando base de datos de prueba...');
    
    // Crear base de datos de prueba si no existe
    try {
      await sequelizeTest.authenticate();
      console.log('✅ Conexión a trn_extraccion_test exitosa');
    } catch (error) {
      console.log('⚠️  No se pudo conectar a trn_extraccion_test');
      console.log('💡 Creando base de datos trn_extraccion_test...');
      
      // Crear la base de datos de prueba
      const sequelizeRoot = new Sequelize({
        dialect: 'mysql',
        host: 'trn.cl',
        port: 3306,
        database: 'mysql', // Conectar a mysql para crear la nueva BD
        username: 'trn_felipe',
        password: 'RioNegro2025@',
        logging: false
      });
      
      await sequelizeRoot.query('CREATE DATABASE IF NOT EXISTS trn_extraccion_test');
      console.log('✅ Base de datos trn_extraccion_test creada');
      await sequelizeRoot.close();
      
      // Verificar conexión nuevamente
      await sequelizeTest.authenticate();
      console.log('✅ Conexión a trn_extraccion_test exitosa');
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
    
    console.log('\n📋 PASO 4: Creando estructura en prueba...');
    
    // Crear cada tabla en prueba
    for (const tabla of tablas) {
      const nombreTabla = Object.values(tabla)[0];
      console.log(`🔧 Creando tabla: ${nombreTabla}`);
      
      // Obtener estructura de la tabla
      const [estructura] = await sequelizeProd.query(`SHOW CREATE TABLE ${nombreTabla}`);
      const createTableSQL = estructura[0]['Create Table'];
      
      // Crear tabla en prueba
      await sequelizeTest.query(createTableSQL);
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
        // Insertar datos en prueba
        for (const registro of datos) {
          const columnas = Object.keys(registro).join(', ');
          const valores = Object.values(registro).map(val => 
            val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`
          ).join(', ');
          
          await sequelizeTest.query(`INSERT INTO ${nombreTabla} (${columnas}) VALUES (${valores})`);
        }
        console.log(`✅ ${datos.length} registros copiados de ${nombreTabla}`);
      } else {
        console.log(`ℹ️  Tabla ${nombreTabla} está vacía`);
      }
    }
    
    console.log('\n📋 PASO 6: Verificando datos...');
    
    // Verificar que los datos se copiaron correctamente
    const [tablasTest] = await sequelizeTest.query('SHOW TABLES');
    console.log(`✅ ${tablasTest.length} tablas creadas en prueba`);
    
    // Verificar vista específica
    const [vista] = await sequelizeTest.query("SHOW TABLES LIKE 'vista_danos_acumulados'");
    if (vista.length > 0) {
      const [datosVista] = await sequelizeTest.query('SELECT COUNT(*) as total FROM vista_danos_acumulados');
      console.log(`✅ Vista vista_danos_acumulados: ${datosVista[0].total} registros`);
    }
    
    console.log('\n✅ ¡Base de datos trn_extraccion_test creada exitosamente!');
    console.log('\n🌐 URLs de Prueba:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Base de datos: trn_extraccion_test (en hosting)');
    
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
    console.log('   - npm start (en backend)              # Iniciar backend');
    console.log('   - npm start (en frontend)             # Iniciar frontend');
    
  } catch (error) {
    console.error('\n❌ Error duplicando base de datos:', error.message);
    
    if (error.message.includes('ER_DBACCESS_DENIED_ERROR')) {
      console.log('\n💡 Error de permisos. Verificar que el usuario tenga permisos para:');
      console.log('   1. Crear bases de datos');
      console.log('   2. Acceder a trn_extraccion');
      console.log('   3. Crear tablas en trn_extraccion_test');
    }
  } finally {
    await sequelizeProd.close();
    await sequelizeTest.close();
  }
}

duplicarBaseDeDatosPrueba(); 