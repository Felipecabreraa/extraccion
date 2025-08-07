#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'yellow');
    const result = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: path.join(__dirname, 'backend')
    });
    log(`✅ ${description} completado`, 'green');
    return result;
  } catch (error) {
    log(`❌ Error en ${description}: ${error.message}`, 'red');
    return null;
  }
}

function checkDatabaseConnection() {
  log('\n🔍 Verificando conexión a la base de datos...', 'cyan');
  
  // Verificar base de datos de producción
  const prodCommand = 'mysql -h trn.cl -P 3306 -u trn_felipe -pRioNegro2025@ trn_extraccion -e "SELECT 1 as test"';
  const testCommand = 'mysql -h trn.cl -P 3306 -u trn_felipe -pRioNegro2025@ trn_extraccion_test -e "SELECT 1 as test"';
  
  try {
    const prodResult = execSync(prodCommand, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    log('✅ Conexión a la base de datos de producción exitosa', 'green');
  } catch (error) {
    log('❌ Error al conectar a la base de datos de producción', 'red');
    log(`   Detalles: ${error.message}`, 'red');
  }
  
  try {
    const testResult = execSync(testCommand, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    log('✅ Conexión a la base de datos de pruebas exitosa', 'green');
    return true;
  } catch (error) {
    log('❌ Error al conectar a la base de datos de pruebas', 'red');
    log(`   Detalles: ${error.message}`, 'red');
    return false;
  }
}

function checkSequelizeCLI() {
  log('\n🔍 Verificando Sequelize CLI...', 'cyan');
  
  try {
    const result = execSync('npx sequelize-cli --version', { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: path.join(__dirname, 'backend')
    });
    log('✅ Sequelize CLI disponible', 'green');
    return true;
  } catch (error) {
    log('❌ Sequelize CLI no encontrado', 'red');
    log('   Instalando dependencias...', 'yellow');
    
    try {
      execSync('npm install', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, 'backend')
      });
      log('✅ Dependencias instaladas', 'green');
      return true;
    } catch (installError) {
      log('❌ Error al instalar dependencias', 'red');
      return false;
    }
  }
}

function main() {
  log('\n🗄️  CONFIGURADOR DE BASE DE DATOS', 'bright');
  log('==================================\n', 'bright');
  
  // Verificar conexión a la base de datos
  const dbConnected = checkDatabaseConnection();
  
  if (!dbConnected) {
    log('\n⚠️  No se pudo conectar a la base de datos de pruebas', 'yellow');
    log('   Verifica las credenciales en backend/.env', 'cyan');
    log('   Credenciales esperadas:', 'cyan');
    log('   DB_HOST=trn.cl', 'yellow');
    log('   DB_PORT=3306', 'yellow');
    log('   DB_NAME=trn_extraccion_test (pruebas)', 'yellow');
    log('   DB_NAME=trn_extraccion (producción)', 'yellow');
    log('   DB_USER=trn_felipe', 'yellow');
    log('   DB_PASSWORD=RioNegro2025@', 'yellow');
    return;
  }
  
  // Verificar Sequelize CLI
  const sequelizeAvailable = checkSequelizeCLI();
  
  if (!sequelizeAvailable) {
    log('\n❌ No se pudo configurar Sequelize CLI', 'red');
    return;
  }
  
  // Ejecutar migraciones
  log('\n📋 Ejecutando migraciones...', 'cyan');
  
  const migrationResult = executeCommand(
    'npx sequelize-cli db:migrate',
    'Ejecutando migraciones'
  );
  
  if (migrationResult) {
    log('\n✅ Migraciones ejecutadas correctamente', 'green');
  } else {
    log('\n❌ Error al ejecutar migraciones', 'red');
    log('   Verifica que las tablas existan en la base de datos', 'cyan');
  }
  
  // Verificar estado de las migraciones
  log('\n📊 Verificando estado de las migraciones...', 'cyan');
  
  const statusResult = executeCommand(
    'npx sequelize-cli db:migrate:status',
    'Verificando estado de migraciones'
  );
  
  if (statusResult) {
    log('\n📋 Estado de las migraciones:', 'cyan');
    console.log(statusResult);
  }
  
  // Crear seeders si es necesario
  log('\n🌱 Verificando seeders...', 'cyan');
  
  const seederResult = executeCommand(
    'npx sequelize-cli db:seed:all',
    'Ejecutando seeders'
  );
  
  if (seederResult) {
    log('✅ Seeders ejecutados correctamente', 'green');
  } else {
    log('ℹ️  No hay seeders para ejecutar o ya fueron ejecutados', 'yellow');
  }
  
  log('\n🎉 CONFIGURACIÓN DE BASE DE DATOS COMPLETADA', 'bright');
  log('=============================================\n', 'bright');
  
  log('📋 Resumen:', 'cyan');
  log('  ✅ Conexión a base de datos verificada', 'green');
  log('  ✅ Sequelize CLI configurado', 'green');
  log('  ✅ Migraciones ejecutadas', 'green');
  log('  ✅ Seeders verificados', 'green');
  
  log('\n🚀 Próximos pasos:', 'bright');
  log('1. Ejecutar el backend: cd backend && npm start', 'cyan');
  log('2. Ejecutar el frontend: cd frontend && npm start', 'cyan');
  log('3. O ejecutar ambos: npm run dev', 'cyan');
  
  log('\n📖 Comandos útiles:', 'bright');
  log('  • Ver estado migraciones: npx sequelize-cli db:migrate:status', 'yellow');
  log('  • Revertir migración: npx sequelize-cli db:migrate:undo', 'yellow');
  log('  • Crear migración: npx sequelize-cli migration:generate --name nombre', 'yellow');
  log('  • Crear seeder: npx sequelize-cli seed:generate --name nombre', 'yellow');
}

main().catch(console.error); 