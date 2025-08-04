#!/usr/bin/env node

const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

console.log('🗄️ Creando Base de Datos de Prueba...');

async function crearBDPrueba() {
  try {
    console.log('\n📋 PASO 1: Verificando conexión a MySQL...');
    
    // Configuración de conexión
    const connection = await mysql.createConnection({
      host: 'trn.cl',
      user: 'trn_felipe',
      password: 'RioNegro2025@',
      port: 3306
    });
    
    console.log('✅ Conexión a MySQL establecida');
    
    console.log('\n📋 PASO 2: Creando base de datos de prueba...');
    
    // Crear base de datos de prueba
    const dbName = 'trn_extraccion_test';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Base de datos ${dbName} creada`);
    
    console.log('\n📋 PASO 3: Copiando datos de producción...');
    
    // Crear backup de producción
    console.log('📦 Creando backup de producción...');
    execSync(`mysqldump -h trn.cl -u trn_felipe -pRioNegro2025@ trn_extraccion > backup_prod_prueba.sql`, { stdio: 'inherit' });
    
    // Restaurar en base de datos de prueba
    console.log('📦 Restaurando en base de datos de prueba...');
    execSync(`mysql -h trn.cl -u trn_felipe -pRioNegro2025@ ${dbName} < backup_prod_prueba.sql`, { stdio: 'inherit' });
    
    console.log('✅ Datos copiados a base de datos de prueba');
    
    console.log('\n📋 PASO 4: Verificando datos...');
    
    // Verificar que los datos se copiaron correctamente
    const [rows] = await connection.execute(`SELECT COUNT(*) as total FROM ${dbName}.reporte_danos_mensuales`);
    console.log(`✅ Tabla reporte_danos_mensuales: ${rows[0].total} registros`);
    
    const [vistas] = await connection.execute(`SHOW TABLES FROM ${dbName} LIKE "vista_danos_acumulados"`);
    if (vistas.length > 0) {
      console.log('✅ Vista vista_danos_acumulados existe');
    } else {
      console.log('⚠️  Vista vista_danos_acumulados no encontrada');
    }
    
    await connection.end();
    
    console.log('\n✅ ¡Base de datos de prueba creada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Base de datos: ${dbName}`);
    console.log('   - Host: trn.cl');
    console.log('   - Usuario: trn_felipe');
    console.log('   - Backup: backup_prod_prueba.sql');
    
    console.log('\n🔧 Para usar esta base de datos:');
    console.log('   1. Copia el archivo env.development');
    console.log('   2. Cambia DB_NAME a trn_extraccion_test');
    console.log('   3. Ejecuta: node scripts/switch-to-test.js');
    
  } catch (error) {
    console.error('\n❌ Error creando base de datos de prueba:', error.message);
    process.exit(1);
  }
}

crearBDPrueba(); 