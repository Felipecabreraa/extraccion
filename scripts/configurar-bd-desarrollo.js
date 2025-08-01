#!/usr/bin/env node

const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

console.log('🗄️ Configurando Base de Datos de Desarrollo...');

async function configurarBDDesarrollo() {
  try {
    console.log('\n📋 PASO 1: Verificando MySQL local...');
    
    // Verificar si MySQL está instalado localmente
    try {
      execSync('mysql --version', { stdio: 'pipe' });
      console.log('✅ MySQL local detectado');
    } catch {
      console.log('⚠️  MySQL no está instalado localmente');
      console.log('   Por favor, instala MySQL y crea la base de datos manualmente');
      console.log('   CREATE DATABASE extraccion_dev;');
      return;
    }
    
    console.log('\n📋 PASO 2: Creando base de datos de desarrollo...');
    
    // Crear base de datos de desarrollo
    execSync('mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS extraccion_dev;"', { stdio: 'inherit' });
    console.log('✅ Base de datos extraccion_dev creada');
    
    console.log('\n📋 PASO 3: Copiando estructura (sin datos sensibles)...');
    
    // Crear backup solo de estructura
    console.log('📦 Creando backup de estructura...');
    execSync('mysqldump -h trn.cl -u extraccion_user -pExtraccion2024! --no-data extraccion_prod > structure_dev.sql', { stdio: 'inherit' });
    
    // Restaurar estructura en desarrollo
    console.log('📦 Restaurando estructura en desarrollo...');
    execSync('mysql -u root -p extraccion_dev < structure_dev.sql', { stdio: 'inherit' });
    
    console.log('✅ Estructura copiada a desarrollo');
    
    console.log('\n📋 PASO 4: Insertando datos de prueba...');
    
    // Insertar algunos datos de prueba
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password', // Cambiar según tu configuración
      database: 'extraccion_dev'
    });
    
    // Insertar datos de prueba
    await connection.execute(`
      INSERT INTO reporte_danos_mensuales (anio, mes, valor_real, valor_ppto, valor_anio_ant, real_acumulado, ppto_acumulado, anio_ant_acumulado) 
      VALUES 
      (2024, 1, 5000000, 3000000, 0, 5000000, 3000000, 0),
      (2024, 2, 6000000, 3000000, 0, 11000000, 6000000, 0),
      (2025, 1, 4000000, 3000000, 5000000, 4000000, 3000000, 5000000)
    `);
    
    console.log('✅ Datos de prueba insertados');
    
    await connection.end();
    
    console.log('\n✅ ¡Base de datos de desarrollo configurada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('   - Base de datos: extraccion_dev');
    console.log('   - Host: localhost');
    console.log('   - Usuario: root');
    console.log('   - Estructura: structure_dev.sql');
    
  } catch (error) {
    console.error('\n❌ Error configurando base de datos de desarrollo:', error.message);
    process.exit(1);
  }
}

configurarBDDesarrollo(); 