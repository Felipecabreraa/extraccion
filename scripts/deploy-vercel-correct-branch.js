#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Deploy manual desde rama test...');

// Verificar que estamos en la rama correcta
console.log('\n📋 VERIFICANDO RAMA:');
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`✅ Rama actual: ${currentBranch}`);
  
  if (currentBranch !== 'test') {
    console.log('⚠️  Cambiando a rama test...');
    execSync('git checkout test', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Error verificando rama:', error.message);
}

// Verificar que el directorio existe
console.log('\n📦 VERIFICANDO DIRECTORIO:');
const frontendDir = path.join(__dirname, '../frontend-test-publico');
if (!fs.existsSync(frontendDir)) {
  console.error('❌ Directorio frontend-test-publico no encontrado');
  process.exit(1);
}
console.log('✅ Directorio frontend-test-publico existe');

// Crear vercel.json optimizado
console.log('\n🔧 CREANDO CONFIGURACIÓN:');
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://trn-extraccion-test-production.up.railway.app/api",
    "REACT_APP_ENVIRONMENT": "test",
    "REACT_APP_APP_NAME": "EXTRACCION TEST"
  }
};

fs.writeFileSync(path.join(frontendDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json creado');

// Verificar build
console.log('\n📦 VERIFICANDO BUILD:');
const buildPath = path.join(frontendDir, 'build/index.html');
if (!fs.existsSync(buildPath)) {
  console.log('⚠️  Build no existe, creando...');
  process.chdir(frontendDir);
  execSync('npm install', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  process.chdir(__dirname + '/..');
} else {
  console.log('✅ Build existe');
}

// Hacer deploy
console.log('\n🚀 HACIENDO DEPLOY:');
console.log('⚠️  Se abrirá el navegador para autenticación');
console.log('   - Inicia sesión con tu cuenta de Vercel');
console.log('   - Confirma el deploy');

try {
  process.chdir(frontendDir);
  
  // Verificar si Vercel CLI está instalado
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Instalando Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }
  
  // Hacer deploy
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('\n✅ Deploy completado exitosamente!');
  console.log('🌐 El frontend debería estar disponible en la URL proporcionada');
  
} catch (error) {
  console.error('❌ Error en el deploy:', error.message);
  console.log('\n🔧 Soluciones posibles:');
  console.log('1. Verificar que estás autenticado en Vercel');
  console.log('2. Verificar que el proyecto existe en Vercel');
  console.log('3. Intentar: vercel --prod --yes');
}

console.log('\n📊 URLs IMPORTANTES:');
console.log('Backend: https://trn-extraccion-test-production.up.railway.app');
console.log('API Health: https://trn-extraccion-test-production.up.railway.app/api/health');
console.log('Frontend: (URL proporcionada por Vercel)'); 