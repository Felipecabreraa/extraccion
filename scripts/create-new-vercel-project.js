#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Preparando configuración para nuevo proyecto Vercel...');

// 1. Verificar que estamos en la rama test
console.log('\n📋 VERIFICANDO RAMA:');
const { execSync } = require('child_process');

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

// 2. Hacer push de todos los cambios
console.log('\n📦 HACIENDO PUSH DE CAMBIOS:');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Setup: Configuración completa para nuevo proyecto Vercel"', { stdio: 'inherit' });
  execSync('git push origin test', { stdio: 'inherit' });
  console.log('✅ Cambios enviados a rama test');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

// 3. Crear vercel.json optimizado
console.log('\n🔧 CREANDO CONFIGURACIÓN:');
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "frontend-test-publico/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend-test-publico/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://trn-extraccion-test-production.up.railway.app/api",
    "REACT_APP_ENVIRONMENT": "test",
    "REACT_APP_APP_NAME": "EXTRACCION TEST"
  }
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json creado en raíz');

// 4. Crear vercel.json específico para el directorio
const frontendVercelConfig = {
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

fs.writeFileSync('frontend-test-publico/vercel.json', JSON.stringify(frontendVercelConfig, null, 2));
console.log('✅ vercel.json creado en frontend-test-publico/');

// 5. Hacer commit de la configuración
console.log('\n📦 HACIENDO COMMIT FINAL:');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Fix: Configuración final para nuevo proyecto Vercel"', { stdio: 'inherit' });
  execSync('git push origin test', { stdio: 'inherit' });
  console.log('✅ Configuración final enviada');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎯 CONFIGURACIÓN LISTA PARA NUEVO PROYECTO:');
console.log('\n📋 PASOS PARA CREAR NUEVO PROYECTO:');
console.log('1. Ve a: https://vercel.com/dashboard');
console.log('2. Haz clic en "New Project"');
console.log('3. Importa repositorio: Felipecabreraa/extraccion');
console.log('4. IMPORTANTE: Cambia la rama a "test"');
console.log('5. Configura estos parámetros:');
console.log('   - Project Name: trn-extraccion-test-frontend');
console.log('   - Framework Preset: Other');
console.log('   - Root Directory: frontend-test-publico');
console.log('   - Build Command: npm run build');
console.log('   - Output Directory: build');
console.log('   - Install Command: npm install');
console.log('6. Agrega variables de entorno:');
console.log('   REACT_APP_API_URL = https://trn-extraccion-test-production.up.railway.app/api');
console.log('   REACT_APP_ENVIRONMENT = test');
console.log('   REACT_APP_APP_NAME = EXTRACCION TEST');
console.log('7. Haz clic en "Deploy"');

console.log('\n📊 URLs IMPORTANTES:');
console.log('Backend: https://trn-extraccion-test-production.up.railway.app');
console.log('API Health: https://trn-extraccion-test-production.up.railway.app/api/health');

console.log('\n🎉 ¡Todo listo! Ahora puedes crear el nuevo proyecto en Vercel.'); 