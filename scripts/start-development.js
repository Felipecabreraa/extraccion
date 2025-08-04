#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando ambiente de DESARROLLO...');

// Función para ejecutar comando en paralelo
function runCommand(command, cwd, name) {
  const [cmd, ...args] = command.split(' ');
  const child = spawn(cmd, args, { 
    cwd, 
    stdio: 'inherit',
    shell: true 
  });
  
  child.on('error', (error) => {
    console.error(`❌ Error en ${name}:`, error.message);
  });
  
  child.on('close', (code) => {
    console.log(`✅ ${name} terminado con código: ${code}`);
  });
  
  return child;
}

async function startDevelopment() {
  try {
    console.log('\n📋 PASO 1: Configurando ambiente de desarrollo...');
    
    // Cambiar a ambiente de desarrollo
    const { execSync } = require('child_process');
    execSync('node scripts/switch-to-development.js', { stdio: 'inherit' });
    
    console.log('\n📋 PASO 2: Instalando dependencias...');
    
    // Instalar dependencias del backend
    console.log('📦 Instalando dependencias del backend...');
    execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
    
    // Instalar dependencias del frontend
    console.log('📦 Instalando dependencias del frontend...');
    execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
    
    console.log('\n📋 PASO 3: Iniciando servidores...');
    
    // Iniciar backend
    console.log('🚀 Iniciando backend...');
    const backend = runCommand('npm run dev', 'backend', 'Backend');
    
    // Esperar un poco antes de iniciar frontend
    setTimeout(() => {
      console.log('🚀 Iniciando frontend...');
      const frontend = runCommand('npm start', 'frontend', 'Frontend');
    }, 3000);
    
    console.log('\n✅ ¡Ambiente de desarrollo iniciado!');
    console.log('\n🌐 URLs:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - API Health: http://localhost:3001/health');
    
    console.log('\n💡 Para detener: Ctrl+C');
    
  } catch (error) {
    console.error('\n❌ Error iniciando desarrollo:', error.message);
    process.exit(1);
  }
}

startDevelopment();
