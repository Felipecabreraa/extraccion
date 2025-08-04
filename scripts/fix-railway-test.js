#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Solucionando problema de Railway Test Environment...');

// Función para ejecutar comandos git
function runGitCommand(command) {
  try {
    const result = execSync(command, { encoding: 'utf8', cwd: process.cwd() });
    console.log(`✅ ${command}: ${result.trim()}`);
    return result;
  } catch (error) {
    console.error(`❌ Error en ${command}:`, error.message);
    return null;
  }
}

console.log('\n🎯 PROBLEMA IDENTIFICADO:');
console.log('   - Railway está configurado como "producción"');
console.log('   - Necesitamos configurarlo como "test"');
console.log('   - URL actual: trn-extracción-prueba-producción.up.railway.app');

console.log('\n📋 PASOS PARA SOLUCIONAR:');

console.log('\n1. 🔧 CONFIGURAR VARIABLES DE ENTORNO EN RAILWAY:');
console.log('   - Ir a: https://railway.app/dashboard');
console.log('   - Seleccionar proyecto: trn-extraccion-test');
console.log('   - Ir a: Variables → "+ Nueva variable"');
console.log('   - Agregar las siguientes variables:');

const railwayVars = [
  'NODE_ENV=test',
  'PORT=3002',
  'DB_HOST=trn.cl',
  'DB_USER=trn_felipe',
  'DB_PASSWORD=RioNegro2025@',
  'DB_NAME=trn_extraccion_test',
  'DB_PORT=3306',
  'JWT_SECRET=test-secret-key',
  'JWT_EXPIRES_IN=1h',
  'CORS_ORIGIN=https://frontend-puce-eta-70-git-test.vercel.app',
  'LOG_LEVEL=error',
  'RATE_LIMIT_WINDOW_MS=60000',
  'RATE_LIMIT_MAX_REQUESTS=100',
  'UPLOAD_MAX_SIZE=5242880',
  'UPLOAD_PATH=uploads/test/',
  'BCRYPT_ROUNDS=4'
];

railwayVars.forEach((variable, index) => {
  console.log(`   ${index + 1}. ${variable}`);
});

console.log('\n2. 🔄 ACTUALIZAR CÓDIGO Y HACER DEPLOY:');

// Configurar ambiente local
console.log('\n⚙️ Configurando ambiente local...');
try {
  // Configurar backend
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  const backendTestEnvPath = path.join(__dirname, '../backend/env.test');
  
  if (fs.existsSync(backendTestEnvPath)) {
    fs.copyFileSync(backendTestEnvPath, backendEnvPath);
    console.log('✅ Backend configurado para PRUEBAS');
  }
  
  // Configurar frontend
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');
  const frontendTestEnvPath = path.join(__dirname, '../frontend/env.test');
  
  if (fs.existsSync(frontendTestEnvPath)) {
    fs.copyFileSync(frontendTestEnvPath, frontendEnvPath);
    console.log('✅ Frontend configurado para PRUEBAS');
  }
} catch (error) {
  console.error('❌ Error configurando ambiente:', error.message);
}

// Hacer commit y push
console.log('\n📦 Agregando cambios...');
runGitCommand('git add .');

console.log('\n💾 Haciendo commit...');
runGitCommand('git commit -m "Fix: Configurar Railway para ambiente de pruebas"');

console.log('\n🚀 Haciendo push a la rama test...');
runGitCommand('git push origin test');

console.log('\n3. 🔄 RESTART EN RAILWAY:');
console.log('   - En Railway Dashboard, hacer click en "Restart"');
console.log('   - Esperar a que el deployment termine');
console.log('   - Verificar que el estado cambie de "CRASHED" a "RUNNING"');

console.log('\n4. ✅ VERIFICAR FUNCIONAMIENTO:');
console.log('   - Backend: https://trn-extracción-prueba-producción.up.railway.app');
console.log('   - Frontend: https://frontend-puce-eta-70-git-test.vercel.app');
console.log('   - Probar login con credenciales de prueba');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('   - Railway funcionando en modo TEST');
console.log('   - Base de datos: trn_extraccion_test');
console.log('   - Puerto: 3002');
console.log('   - CORS configurado para el frontend de Vercel');

console.log('\n📞 Si hay problemas:');
console.log('   - Revisar logs en Railway');
console.log('   - Verificar variables de entorno');
console.log('   - Contactar: soporte@trn.com'); 