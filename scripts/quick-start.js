#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando EXTRACCION - Ambiente de Desarrollo...');

// Función para ejecutar comando en paralelo
function runCommand(command, cwd, name) {
  console.log(`📦 Iniciando ${name}...`);
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

// Función para copiar archivo
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Configurado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error configurando ${source}:`, error.message);
  }
}

async function quickStart() {
  try {
    console.log('\n📋 PASO 1: Configurando ambiente de desarrollo...');
    
    // Configurar archivos .env para desarrollo
    copyFile('backend/env.development', 'backend/.env');
    copyFile('frontend/env.development', 'frontend/.env');
    
    console.log('\n📋 PASO 2: Verificando dependencias...');
    
    // Verificar si node_modules existe
    const backendHasDeps = fs.existsSync('backend/node_modules');
    const frontendHasDeps = fs.existsSync('frontend/node_modules');
    
    if (!backendHasDeps) {
      console.log('📦 Instalando dependencias del backend...');
      const { execSync } = require('child_process');
      execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
    } else {
      console.log('✅ Dependencias del backend ya instaladas');
    }
    
    if (!frontendHasDeps) {
      console.log('📦 Instalando dependencias del frontend...');
      const { execSync } = require('child_process');
      execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
    } else {
      console.log('✅ Dependencias del frontend ya instaladas');
    }
    
    console.log('\n📋 PASO 3: Iniciando servidores...');
    
    // Iniciar backend
    console.log('🚀 Iniciando backend en http://localhost:3001...');
    const backend = runCommand('npm run dev', 'backend', 'Backend');
    
    // Esperar un poco antes de iniciar frontend
    setTimeout(() => {
      console.log('🚀 Iniciando frontend en http://localhost:3000...');
      const frontend = runCommand('npm start', 'frontend', 'Frontend');
    }, 3000);
    
    console.log('\n✅ ¡Ambiente de desarrollo iniciado!');
    console.log('\n🌐 URLs:');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - API Health: http://localhost:3001/health');
    console.log('   - API Docs: http://localhost:3001/api');
    
    console.log('\n💡 Comandos útiles:');
    console.log('   - Cambiar a pruebas: node scripts/switch-to-test.js');
    console.log('   - Cambiar a producción: node scripts/switch-to-production.js');
    console.log('   - Verificar ambientes: node scripts/verify-environments.js');
    
    console.log('\n⚠️  Para detener: Ctrl+C');
    
    // Manejar señales de terminación
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo servidores...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Deteniendo servidores...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Error iniciando desarrollo:', error.message);
    process.exit(1);
  }
}

quickStart(); 