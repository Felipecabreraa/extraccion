#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🟡 Cambiando a ambiente de STAGING...');

// Función para copiar archivo
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}:`, error.message);
  }
}

async function switchToStaging() {
  try {
    console.log('\n📋 PASO 1: Verificando rama actual...');
    
    // Verificar que estamos en la rama develop
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Rama actual: ${currentBranch}`);
    
    if (currentBranch !== 'develop') {
      console.log('⚠️  Recomendación: Cambiar a rama develop para staging');
      console.log('   git checkout develop');
    }
    
    console.log('\n📋 PASO 2: Configurando archivos de entorno para staging...');
    
    // Copiar configuración de staging
    copyFile(
      path.join(__dirname, '../backend/env.staging'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.staging'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\n📋 PASO 3: Verificando configuración...');
    
    // Verificar que los archivos se copiaron correctamente
    const backendEnv = fs.readFileSync(path.join(__dirname, '../backend/.env'), 'utf8');
    const frontendEnv = fs.readFileSync(path.join(__dirname, '../frontend/.env'), 'utf8');
    
    if (backendEnv.includes('NODE_ENV=staging')) {
      console.log('✅ Backend configurado para staging');
    }
    
    if (frontendEnv.includes('REACT_APP_ENV=staging')) {
      console.log('✅ Frontend configurado para staging');
    }
    
    console.log('\n✅ ¡Ambiente de staging configurado!');
    console.log('\n🌐 URLs de Staging:');
    console.log('   - Backend: https://backend-staging.up.railway.app');
    console.log('   - Frontend: https://frontend-staging.vercel.app');
    console.log('   - Credenciales: staging@admin.com / staging123');
    
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/deploy-staging.js       # Desplegar a staging');
    console.log('   - npx @railway/cli logs               # Ver logs de backend');
    console.log('   - npx vercel logs                     # Ver logs de frontend');
    
  } catch (error) {
    console.error('\n❌ Error configurando ambiente de staging:', error.message);
    process.exit(1);
  }
}

switchToStaging(); 