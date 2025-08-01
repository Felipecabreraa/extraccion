#!/usr/bin/env node

const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

console.log('🗄️ Configurando Base de Datos de Staging...');

async function configurarBDStaging() {
  try {
    console.log('\n📋 PASO 1: Verificando conexión a MySQL...');
    
    // Configuración de conexión
    const connection = await mysql.createConnection({
      host: 'trn.cl',
      user: 'extraccion_user',
      password: 'Extraccion2024!',
      port: 3306
    });
    
    console.log('✅ Conexión a MySQL establecida');
    
    console.log('\n📋 PASO 2: Creando base de datos de staging...');
    
    // Crear base de datos de staging
    await connection.execute('CREATE DATABASE IF NOT EXISTS extraccion_staging');
    console.log('✅ Base de datos extraccion_staging creada');
    
    console.log('\n📋 PASO 3: Copiando estructura de producción...');
    
    // Crear backup de producción
    console.log('📦 Creando backup de producción...');
    execSync('mysqldump -h trn.cl -u extraccion_user -pExtraccion2024! extraccion_prod > backup_prod_staging.sql', { stdio: 'inherit' });
    
    // Restaurar en staging
    console.log('📦 Restaurando en staging...');
    execSync('mysql -h trn.cl -u extraccion_user -pExtraccion2024! extraccion_staging < backup_prod_staging.sql', { stdio: 'inherit' });
    
    console.log('✅ Datos copiados a staging');
    
    console.log('\n📋 PASO 4: Verificando datos...');
    
    // Verificar que los datos se copiaron correctamente
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM extraccion_staging.reporte_danos_mensuales');
    console.log(`✅ Tabla reporte_danos_mensuales: ${rows[0].total} registros`);
    
    const [vistas] = await connection.execute('SHOW TABLES LIKE "vista_danos_acumulados"');
    if (vistas.length > 0) {
      console.log('✅ Vista vista_danos_acumulados existe');
    } else {
      console.log('⚠️  Vista vista_danos_acumulados no encontrada');
    }
    
    await connection.end();
    
    console.log('\n✅ ¡Base de datos de staging configurada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('   - Base de datos: extraccion_staging');
    console.log('   - Host: trn.cl');
    console.log('   - Usuario: extraccion_user');
    console.log('   - Backup: backup_prod_staging.sql');
    
  } catch (error) {
    console.error('\n❌ Error configurando base de datos de staging:', error.message);
    process.exit(1);
  }
}

configurarBDStaging(); 