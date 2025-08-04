#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Preparando configuración para nuevo proyecto Vercel...');

// 1. Crear vercel.json optimizado para el nuevo proyecto
console.log('\n📝 CREANDO VERCEL.JSON OPTIMIZADO:');
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

fs.writeFileSync('frontend-test-publico/vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json creado en frontend-test-publico/');

// 2. Verificar que el build esté listo
console.log('\n📦 VERIFICANDO BUILD:');
const buildPath = path.join(__dirname, '../frontend-test-publico/build/index.html');
if (fs.existsSync(buildPath)) {
  console.log('✅ Build existe');
  
  // Verificar contenido del build
  const buildContent = fs.readFileSync(buildPath, 'utf8');
  if (buildContent.includes('EXTRACCION') || buildContent.includes('Extracción')) {
    console.log('✅ Build contiene la aplicación correcta');
  } else {
    console.log('⚠️  Build puede necesitar actualización');
  }
} else {
  console.log('❌ Build no existe - necesitarás hacer build');
}

// 3. Verificar package.json
console.log('\n📋 VERIFICANDO PACKAGE.JSON:');
const packagePath = path.join(__dirname, '../frontend-test-publico/package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ package.json existe');
  console.log(`   - Script build: ${packageJson.scripts?.build || 'NO DEFINIDO'}`);
  console.log(`   - Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
} else {
  console.log('❌ package.json no encontrado');
}

// 4. Verificar variables de entorno
console.log('\n🔧 VERIFICANDO VARIABLES DE ENTORNO:');
const envPath = path.join(__dirname, '../frontend-test-publico/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'REACT_APP_API_URL',
    'REACT_APP_ENVIRONMENT',
    'REACT_APP_APP_NAME'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: CONFIGURADO`);
    } else {
      console.log(`❌ ${varName}: FALTANTE`);
    }
  });
} else {
  console.log('❌ Archivo .env no encontrado');
}

console.log('\n🎯 CONFIGURACIÓN LISTA PARA VERCEL:');
console.log('\n📋 PARÁMETROS PARA CONFIGURAR EN VERCEL:');
console.log('- Project Name: trn-extraccion-test-frontend');
console.log('- Framework Preset: Other');
console.log('- Root Directory: frontend-test-publico');
console.log('- Build Command: npm run build');
console.log('- Output Directory: build');
console.log('- Install Command: npm install');
console.log('- Production Branch: test');

console.log('\n🔧 VARIABLES DE ENTORNO PARA AGREGAR:');
console.log('REACT_APP_API_URL = https://trn-extraccion-test-production.up.railway.app/api');
console.log('REACT_APP_ENVIRONMENT = test');
console.log('REACT_APP_APP_NAME = EXTRACCION TEST');

console.log('\n📊 URLs IMPORTANTES:');
console.log('Backend (Railway): https://trn-extraccion-test-production.up.railway.app');
console.log('API Health: https://trn-extraccion-test-production.up.railway.app/api/health');

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('1. Crear nuevo proyecto en Vercel Dashboard');
console.log('2. Importar repositorio: Felipecabreraa/extraccion');
console.log('3. Configurar parámetros según la lista arriba');
console.log('4. Agregar variables de entorno');
console.log('5. Hacer deploy');
console.log('6. Probar la aplicación');

// 5. Hacer commit de los cambios
console.log('\n📦 HACIENDO COMMIT DE CONFIGURACIÓN...');
const { execSync } = require('child_process');

try {
  execSync('git add .', { cwd: process.cwd() });
  console.log('✅ Cambios agregados');
  
  execSync('git commit -m "Setup: Preparar configuración para nuevo proyecto Vercel de pruebas"', { cwd: process.cwd() });
  console.log('✅ Commit realizado');
  
  execSync('git push origin test', { cwd: process.cwd() });
  console.log('✅ Push realizado');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎉 Configuración completada. ¡Ahora puedes crear el proyecto en Vercel!'); 