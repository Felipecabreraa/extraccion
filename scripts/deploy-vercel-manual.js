#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando deploy manual a Vercel...');

// 1. Verificar que tenemos Vercel CLI instalado
console.log('\n📋 VERIFICANDO VERCEL CLI:');
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI está instalado');
} catch (error) {
  console.log('❌ Vercel CLI no está instalado');
  console.log('📦 Instalando Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI instalado');
  } catch (installError) {
    console.error('❌ Error instalando Vercel CLI:', installError.message);
    console.log('\n🔧 Instala Vercel CLI manualmente:');
    console.log('npm install -g vercel');
    process.exit(1);
  }
}

// 2. Preparar el directorio para deploy
console.log('\n📦 PREPARANDO DEPLOY:');
const frontendDir = path.join(__dirname, '../frontend-test-publico');

// Verificar que el directorio existe
if (!fs.existsSync(frontendDir)) {
  console.error('❌ Directorio frontend-test-publico no encontrado');
  process.exit(1);
}

// Crear vercel.json específico para el deploy
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

// 3. Navegar al directorio y hacer deploy
console.log('\n🚀 HACIENDO DEPLOY:');
console.log('⚠️  Se abrirá el navegador para autenticación');
console.log('   - Inicia sesión con tu cuenta de Vercel');
console.log('   - Confirma el deploy');

try {
  // Cambiar al directorio del frontend
  process.chdir(frontendDir);
  
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