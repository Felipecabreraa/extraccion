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

function killProcessOnPort(port) {
  try {
    log(`🔍 Buscando proceso en puerto ${port}...`, 'cyan');
    
    const result = execSync(`netstat -ano | findstr :${port}`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    if (result) {
      const lines = result.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          log(`🔄 Matando proceso PID: ${pid}`, 'yellow');
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
          log(`✅ Proceso ${pid} terminado`, 'green');
        }
      }
    }
  } catch (error) {
    log(`ℹ️  No se encontraron procesos en puerto ${port}`, 'yellow');
  }
}

function updateBackendPort() {
  try {
    log('\n🔧 Actualizando puerto del backend...', 'cyan');
    
    // Leer archivo .env.staging
    const envPath = path.join('backend', '.env.staging');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Cambiar puerto de 3001 a 3002
    envContent = envContent.replace(/PORT=3001/g, 'PORT=3002');
    
    // Crear nuevo archivo .env
    const newEnvPath = path.join('backend', '.env');
    fs.writeFileSync(newEnvPath, envContent);
    
    log('✅ Puerto del backend actualizado a 3002', 'green');
    
    // Actualizar frontend para apuntar al nuevo puerto
    const frontendEnvPath = path.join('frontend', '.env');
    let frontendContent = fs.readFileSync(frontendEnvPath, 'utf8');
    frontendContent = frontendContent.replace(/localhost:3001/g, 'localhost:3002');
    fs.writeFileSync(frontendEnvPath, frontendContent);
    
    log('✅ Frontend actualizado para usar puerto 3002', 'green');
    
  } catch (error) {
    log(`❌ Error actualizando configuración: ${error.message}`, 'red');
  }
}

function main() {
  log('\n🔧 SOLUCIONADOR DE PUERTO', 'bright');
  log('==========================\n', 'bright');
  
  // Matar procesos en puertos 3001 y 3002
  killProcessOnPort(3001);
  killProcessOnPort(3002);
  
  // Actualizar configuración
  updateBackendPort();
  
  log('\n✅ PROBLEMA SOLUCIONADO', 'bright');
  log('=======================\n', 'bright');
  
  log('📋 Cambios realizados:', 'cyan');
  log('  ✅ Procesos en puerto 3001 terminados', 'green');
  log('  ✅ Backend configurado en puerto 3002', 'green');
  log('  ✅ Frontend actualizado para puerto 3002', 'green');
  
  log('\n🚀 Para ejecutar el proyecto:', 'bright');
  log('1. Backend: cd backend && npm start', 'yellow');
  log('2. Frontend: cd frontend && npm start', 'yellow');
  log('3. URLs:', 'cyan');
  log('   • Backend: http://localhost:3002', 'green');
  log('   • Frontend: http://localhost:3000', 'green');
  
  log('\n📖 Credenciales de login:', 'bright');
  log('  • Email: admin@admin.com', 'yellow');
  log('  • Password: admin123', 'yellow');
}

main().catch(console.error); 