#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Haciendo frontend-test-publico visible para Vercel...');

// 1. Crear un README.md específico en frontend-test-publico
console.log('\n📝 CREANDO README ESPECÍFICO:');
const readmeContent = `# EXTRACCION TEST FRONTEND

Este es el frontend de prueba para el sistema de extracción.

## Tecnologías
- React 18
- React Router
- Axios
- Bootstrap

## Scripts
- \`npm start\`: Iniciar en desarrollo
- \`npm run build\`: Construir para producción
- \`npm test\`: Ejecutar tests

## Variables de Entorno
- REACT_APP_API_URL: URL del backend
- REACT_APP_ENVIRONMENT: test
- REACT_APP_APP_NAME: EXTRACCION TEST
`;

fs.writeFileSync('frontend-test-publico/README.md', readmeContent);
console.log('✅ README.md creado en frontend-test-publico/');

// 2. Crear un .gitignore específico
console.log('\n📁 CREANDO .GITIGNORE ESPECÍFICO:');
const gitignoreContent = `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;

fs.writeFileSync('frontend-test-publico/.gitignore', gitignoreContent);
console.log('✅ .gitignore creado en frontend-test-publico/');

// 3. Crear un public/index.html específico si no existe
console.log('\n🌐 VERIFICANDO PUBLIC/INDEX.HTML:');
const publicIndexPath = 'frontend-test-publico/public/index.html';
if (!fs.existsSync(publicIndexPath)) {
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Sistema de Extracción - Ambiente de Pruebas"
    />
    <title>EXTRACCION TEST</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  
  // Crear directorio public si no existe
  if (!fs.existsSync('frontend-test-publico/public')) {
    fs.mkdirSync('frontend-test-publico/public', { recursive: true });
  }
  
  fs.writeFileSync(publicIndexPath, indexHtmlContent);
  console.log('✅ public/index.html creado');
} else {
  console.log('✅ public/index.html ya existe');
}

// 4. Verificar que el directorio tenga estructura correcta
console.log('\n📂 VERIFICANDO ESTRUCTURA:');
const requiredFiles = [
  'frontend-test-publico/package.json',
  'frontend-test-publico/public/index.html',
  'frontend-test-publico/src/index.js',
  'frontend-test-publico/src/App.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: EXISTE`);
  } else {
    console.log(`❌ ${file}: FALTANTE`);
  }
});

// 5. Hacer commit y push
console.log('\n📦 HACIENDO COMMIT Y PUSH:');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Fix: Hacer frontend-test-publico visible para Vercel"', { stdio: 'inherit' });
  execSync('git push origin test', { stdio: 'inherit' });
  console.log('✅ Cambios enviados a rama test');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎯 INSTRUCCIONES PARA VERCEL:');
console.log('\n📋 PASOS A SEGUIR:');
console.log('1. Ve a Vercel Dashboard');
console.log('2. Haz clic en "New Project"');
console.log('3. Selecciona tu repositorio "extraccion"');
console.log('4. En el modal de "Root Directory":');
console.log('   - Busca "frontend-test-publico" en la lista');
console.log('   - Si no aparece, haz clic en "Cancel" y vuelve a intentar');
console.log('   - Selecciona "frontend-test-publico"');
console.log('5. Haz clic en "Continue"');
console.log('6. Configura las variables de entorno:');
console.log('   - REACT_APP_API_URL = https://trn-extraccion-test-production.up.railway.app/api');
console.log('   - REACT_APP_ENVIRONMENT = test');
console.log('   - REACT_APP_APP_NAME = EXTRACCION TEST');

console.log('\n💡 CONSEJO:');
console.log('Si "frontend-test-publico" no aparece en la lista,');
console.log('puedes intentar:');
console.log('1. Refrescar la página');
console.log('2. Cancelar y volver a crear el proyecto');
console.log('3. Esperar unos minutos y volver a intentar');

console.log('\n🎉 ¡Estructura mejorada! Ahora Vercel debería detectar frontend-test-publico.'); 