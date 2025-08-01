#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Desplegando ambiente de STAGING...');

// Función para copiar archivo de configuración
function copyEnvFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}:`, error.message);
  }
}

// Función para ejecutar comando
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📦 Ejecutando: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    console.log(`✅ Comando exitoso: ${command}`);
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    process.exit(1);
  }
}

async function deployStaging() {
  try {
    console.log('\n📋 PASO 1: Configurando backend para staging...');
    
    // Copiar configuración de staging al backend
    copyEnvFile(
      path.join(__dirname, '../backend/env.staging'),
      path.join(__dirname, '../backend/.env')
    );
    
    console.log('\n📋 PASO 2: Desplegando backend a Railway (staging)...');
    process.chdir(path.join(__dirname, '../backend'));
    
    // Verificar si Railway CLI está disponible
    try {
      execSync('npx @railway/cli --version', { stdio: 'pipe' });
    } catch {
      console.log('📦 Instalando Railway CLI...');
      runCommand('npm install -g @railway/cli');
    }
    
    // Desplegar a Railway (staging)
    runCommand('npx @railway/cli up --service staging');
    
    console.log('\n📋 PASO 3: Configurando frontend para staging...');
    process.chdir(path.join(__dirname, '../frontend'));
    
    // Copiar configuración de staging al frontend
    copyEnvFile(
      path.join(__dirname, '../frontend/env.staging'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\n📋 PASO 4: Desplegando frontend a Vercel (staging)...');
    
    // Desplegar a Vercel (staging)
    runCommand('npx vercel --prod --env staging');
    
    console.log('\n✅ ¡Despliegue de STAGING completado exitosamente!');
    console.log('\n🌐 URLs de Staging:');
    console.log('   - Backend: https://backend-staging.up.railway.app');
    console.log('   - Frontend: [URL del deploy de Vercel]');
    
  } catch (error) {
    console.error('\n❌ Error en el despliegue de staging:', error.message);
    process.exit(1);
  }
}

deployStaging(); 