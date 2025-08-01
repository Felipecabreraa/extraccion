#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️ Configurando Sistema de Ambientes...');

// Función para crear directorio si no existe
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Creado directorio: ${dir}`);
  }
}

// Función para copiar archivo
function copyFile(source, destination) {
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
    return false;
  }
  return true;
}

async function setupAmbientes() {
  try {
    console.log('\n📋 PASO 1: Creando estructura de directorios...');
    
    // Crear directorios necesarios
    ensureDir('scripts');
    ensureDir('backend');
    ensureDir('frontend');
    
    console.log('\n📋 PASO 2: Configurando archivos de variables de entorno...');
    
    // Verificar que los archivos de configuración existan
    const requiredFiles = [
      'backend/env.development',
      'backend/env.staging',
      'backend/env.railway.production',
      'frontend/env.development',
      'frontend/env.staging'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.error(`❌ Archivo faltante: ${file}`);
        console.log('   Por favor, crea los archivos de configuración primero.');
        return;
      }
    }
    
    console.log('✅ Todos los archivos de configuración están presentes');
    
    console.log('\n📋 PASO 3: Configurando Git...');
    
    // Verificar si es un repositorio Git
    try {
      execSync('git status', { stdio: 'pipe' });
      console.log('✅ Repositorio Git detectado');
    } catch {
      console.log('📦 Inicializando repositorio Git...');
      runCommand('git init');
      runCommand('git add .');
      runCommand('git commit -m "feat: configuración inicial de ambientes"');
    }
    
    // Crear rama develop si no existe
    try {
      execSync('git show-ref --verify --quiet refs/heads/develop', { stdio: 'pipe' });
      console.log('✅ Rama develop ya existe');
    } catch {
      console.log('📦 Creando rama develop...');
      runCommand('git checkout -b develop');
      runCommand('git push -u origin develop');
    }
    
    console.log('\n📋 PASO 4: Instalando dependencias...');
    
    // Instalar dependencias del backend
    console.log('📦 Instalando dependencias del backend...');
    if (fs.existsSync('backend/package.json')) {
      runCommand('npm install', 'backend');
    } else {
      console.log('⚠️  package.json del backend no encontrado');
    }
    
    // Instalar dependencias del frontend
    console.log('📦 Instalando dependencias del frontend...');
    if (fs.existsSync('frontend/package.json')) {
      runCommand('npm install', 'frontend');
    } else {
      console.log('⚠️  package.json del frontend no encontrado');
    }
    
    console.log('\n📋 PASO 5: Configurando herramientas CLI...');
    
    // Verificar Railway CLI
    try {
      execSync('npx @railway/cli --version', { stdio: 'pipe' });
      console.log('✅ Railway CLI ya está instalado');
    } catch {
      console.log('📦 Instalando Railway CLI...');
      runCommand('npm install -g @railway/cli');
    }
    
    // Verificar Vercel CLI
    try {
      execSync('npx vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI ya está instalado');
    } catch {
      console.log('📦 Instalando Vercel CLI...');
      runCommand('npm install -g vercel');
    }
    
    console.log('\n📋 PASO 6: Creando archivos de configuración local...');
    
    // Crear .env local para desarrollo
    copyFile('backend/env.development', 'backend/.env');
    copyFile('frontend/env.development', 'frontend/.env');
    
    console.log('\n✅ ¡Configuración de ambientes completada!');
    console.log('\n🌐 URLs de Acceso:');
    console.log('   🟢 Desarrollo: http://localhost:3000');
    console.log('   🟡 Staging: https://frontend-staging.vercel.app');
    console.log('   🔴 Producción: https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app');
    
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
    console.log('   - node scripts/deploy-staging.js       # Desplegar staging');
    console.log('   - node scripts/deploy-production.js    # Desplegar producción');
    
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Configurar base de datos de staging');
    console.log('   2. Configurar base de datos de desarrollo');
    console.log('   3. Probar despliegue a staging');
    console.log('   4. Configurar monitoreo y alertas');
    
  } catch (error) {
    console.error('\n❌ Error en la configuración:', error.message);
    process.exit(1);
  }
}

setupAmbientes(); 