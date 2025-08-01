#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔴 Cambiando a ambiente de PRODUCCIÓN...');

// Función para copiar archivo
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}:`, error.message);
  }
}

async function switchToProduction() {
  try {
    console.log('\n📋 PASO 1: Verificando rama actual...');
    
    // Verificar que estamos en la rama main
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Rama actual: ${currentBranch}`);
    
    if (currentBranch !== 'main') {
      console.log('⚠️  ADVERTENCIA: Debes estar en la rama main para producción');
      console.log('   git checkout main');
      console.log('   ¿Quieres continuar de todas formas? (s/N)');
      return;
    }
    
    console.log('\n📋 PASO 2: Configurando archivos de entorno para producción...');
    
    // Copiar configuración de producción
    copyFile(
      path.join(__dirname, '../backend/env.railway.production'),
      path.join(__dirname, '../backend/.env')
    );
    
    console.log('\n📋 PASO 3: Verificando configuración...');
    
    // Verificar que los archivos se copiaron correctamente
    const backendEnv = fs.readFileSync(path.join(__dirname, '../backend/.env'), 'utf8');
    
    if (backendEnv.includes('NODE_ENV=production')) {
      console.log('✅ Backend configurado para producción');
    }
    
    console.log('\n✅ ¡Ambiente de producción configurado!');
    console.log('\n🌐 URLs de Producción:');
    console.log('   - Backend: https://backend-production-6fb4.up.railway.app');
    console.log('   - Frontend: https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app');
    console.log('   - Credenciales: admin@admin.com / admin123');
    
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/deploy-production.js      # Desplegar a producción');
    console.log('   - npx @railway/cli logs                 # Ver logs de backend');
    console.log('   - npx vercel logs                       # Ver logs de frontend');
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Solo desplegar desde rama main');
    console.log('   - Verificar que los tests pasen');
    console.log('   - Hacer backup antes de desplegar');
    
  } catch (error) {
    console.error('\n❌ Error configurando ambiente de producción:', error.message);
    process.exit(1);
  }
}

switchToProduction(); 