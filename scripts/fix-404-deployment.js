#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Solucionando problema de deployment 404...');

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

// 1. Verificar estado actual
console.log('\n📋 Verificando estado actual...');
runGitCommand('git status');

// 2. Verificar rama actual
console.log('\n🌿 Verificando rama actual...');
const currentBranch = runGitCommand('git branch --show-current');
console.log(`Rama actual: ${currentBranch}`);

// 3. Configurar ambiente de pruebas
console.log('\n⚙️ Configurando ambiente de pruebas...');
try {
  const setupScript = path.join(__dirname, 'setup-test-environment.js');
  if (fs.existsSync(setupScript)) {
    require(setupScript);
  } else {
    console.log('⚠️ Script de configuración no encontrado, configurando manualmente...');
    
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
  }
} catch (error) {
  console.error('❌ Error configurando ambiente:', error.message);
}

// 4. Agregar todos los cambios
console.log('\n📦 Agregando cambios...');
runGitCommand('git add .');

// 5. Hacer commit
console.log('\n💾 Haciendo commit...');
runGitCommand('git commit -m "Fix: Configurar ambiente de pruebas público y solucionar deployment 404"');

// 6. Push a la rama test
console.log('\n🚀 Haciendo push a la rama test...');
runGitCommand('git push origin test');

console.log('\n🎯 Pasos para completar la solución:');
console.log('');
console.log('1. 📱 Ir a Vercel Dashboard');
console.log('   - https://vercel.com/dashboard');
console.log('   - Buscar tu proyecto "Interfaz"');
console.log('');
console.log('2. ⚙️ Configurar Variables de Entorno en Vercel:');
console.log('   - Settings → Environment Variables');
console.log('   - Agregar: REACT_APP_API_URL=https://trn-extraccion-test.up.railway.app/api');
console.log('   - Agregar: REACT_APP_ENVIRONMENT=test');
console.log('');
console.log('3. 🔄 Trigger nuevo deployment:');
console.log('   - Ir a Deployments');
console.log('   - Hacer click en "Redeploy" en el último deployment');
console.log('');
console.log('4. 🚀 Crear Backend en Railway:');
console.log('   - https://railway.app/dashboard');
console.log('   - New Project → Deploy from GitHub repo');
console.log('   - Seleccionar rama "test"');
console.log('   - Configurar variables de entorno del archivo AMBIENTE_PRUEBAS_PUBLICO.md');
console.log('');
console.log('✅ El deployment debería funcionar correctamente después de estos pasos.'); 