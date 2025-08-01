#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🟢 Cambiando a ambiente de DESARROLLO...');

// Función para copiar archivo
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}:`, error.message);
  }
}

async function switchToDevelopment() {
  try {
    console.log('\n📋 PASO 1: Verificando rama actual...');
    
    // Verificar que estamos en una rama feature
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Rama actual: ${currentBranch}`);
    
    if (!currentBranch.startsWith('feature/')) {
      console.log('⚠️  Recomendación: Trabajar en una rama feature para desarrollo');
      console.log('   git checkout -b feature/nueva-funcionalidad');
    }
    
    console.log('\n📋 PASO 2: Configurando archivos de entorno para desarrollo...');
    
    // Copiar configuración de desarrollo
    copyFile(
      path.join(__dirname, '../backend/env.development'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.development'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\n📋 PASO 3: Verificando configuración...');
    
    // Verificar que los archivos se copiaron correctamente
    const backendEnv = fs.readFileSync(path.join(__dirname, '../backend/.env'), 'utf8');
    const frontendEnv = fs.readFileSync(path.join(__dirname, '../frontend/.env'), 'utf8');
    
    if (backendEnv.includes('NODE_ENV=development')) {
      console.log('✅ Backend configurado para desarrollo');
    }
    
    if (frontendEnv.includes('REACT_APP_ENV=development')) {
      console.log('✅ Frontend configurado para desarrollo');
    }
    
    console.log('\n✅ ¡Ambiente de desarrollo configurado!');
    console.log('\n🌐 URLs de Desarrollo:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Credenciales: dev@admin.com / dev123');
    
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
    console.log('   - npm start (en backend)              # Iniciar backend');
    console.log('   - npm start (en frontend)             # Iniciar frontend');
    
  } catch (error) {
    console.error('\n❌ Error configurando ambiente de desarrollo:', error.message);
    process.exit(1);
  }
}

switchToDevelopment(); 