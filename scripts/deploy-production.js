#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Desplegando ambiente de PRODUCCIÓN...');

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

async function deployProduction() {
  try {
    console.log('\n📋 PASO 1: Verificando que estás en la rama main...');
    
    // Verificar que estás en la rama main
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (currentBranch !== 'main') {
      console.error('❌ Error: Debes estar en la rama main para desplegar a producción');
      console.log(`   Rama actual: ${currentBranch}`);
      console.log('   Ejecuta: git checkout main');
      process.exit(1);
    }
    
    console.log('✅ Rama correcta: main');
    
    console.log('\n📋 PASO 2: Configurando backend para producción...');
    
    // Copiar configuración de producción al backend
    copyEnvFile(
      path.join(__dirname, '../backend/env.railway.production'),
      path.join(__dirname, '../backend/.env')
    );
    
    console.log('\n📋 PASO 3: Desplegando backend a Railway (producción)...');
    process.chdir(path.join(__dirname, '../backend'));
    
    // Verificar si Railway CLI está disponible
    try {
      execSync('npx @railway/cli --version', { stdio: 'pipe' });
    } catch {
      console.log('📦 Instalando Railway CLI...');
      runCommand('npm install -g @railway/cli');
    }
    
    // Desplegar a Railway (producción)
    runCommand('npx @railway/cli up --service production');
    
    console.log('\n📋 PASO 4: Configurando frontend para producción...');
    process.chdir(path.join(__dirname, '../frontend'));
    
    // El frontend ya está configurado para producción por defecto
    
    console.log('\n📋 PASO 5: Desplegando frontend a Vercel (producción)...');
    
    // Desplegar a Vercel (producción)
    runCommand('npx vercel --prod');
    
    console.log('\n✅ ¡Despliegue de PRODUCCIÓN completado exitosamente!');
    console.log('\n🌐 URLs de Producción:');
    console.log('   - Backend: https://backend-production-6fb4.up.railway.app');
    console.log('   - Frontend: [URL del deploy de Vercel]');
    
  } catch (error) {
    console.error('\n❌ Error en el despliegue de producción:', error.message);
    process.exit(1);
  }
}

deployProduction(); 