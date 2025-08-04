#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Verificando estado del frontend en Vercel...');

// URLs de prueba para el frontend
const testUrls = [
  'https://frontend-puce-eta-70-git-test.vercel.app',
  'https://frontend-puce-eta-70-git-test.vercel.app/',
  'https://frontend-puce-eta-70-git-test.vercel.app/login',
  'https://frontend-puce-eta-70-git-test.vercel.app/dashboard'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type'] || 'N/A'}`);
      console.log(`   Server: ${res.headers['server'] || 'N/A'}`);
      resolve({ success: true, statusCode: res.statusCode, url });
    });

    req.on('error', (error) => {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${error.message}`);
      resolve({ success: false, error: error.message, url });
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout', url });
    });
  });
}

async function checkAllUrls() {
  console.log('\n🌐 VERIFICANDO FRONTEND VERCEL:');
  
  for (const url of testUrls) {
    const result = await checkUrl(url);
    console.log('');
  }
}

// Verificar configuración del frontend
console.log('\n📋 CONFIGURACIÓN FRONTEND:');
const fs = require('fs');
const path = require('path');

const frontendFiles = [
  'frontend-test-publico/package.json',
  'frontend-test-publico/vercel.json',
  'frontend-test-publico/.env',
  'frontend-test-publico/build/index.html'
];

frontendFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}: EXISTE`);
  } else {
    console.log(`❌ ${file}: NO EXISTE`);
  }
});

// Verificar contenido del build
console.log('\n📦 VERIFICANDO BUILD:');
const buildPath = path.join(__dirname, '../frontend-test-publico/build/index.html');
if (fs.existsSync(buildPath)) {
  const buildContent = fs.readFileSync(buildPath, 'utf8');
  if (buildContent.includes('EXTRACCION')) {
    console.log('✅ Build contiene la aplicación correcta');
  } else {
    console.log('❌ Build no contiene la aplicación esperada');
  }
} else {
  console.log('❌ Build no existe');
}

// Verificar variables de entorno
console.log('\n🔧 VARIABLES DE ENTORNO FRONTEND:');
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

// Ejecutar verificaciones
checkAllUrls().then(() => {
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Revisar Vercel Dashboard para verificar deployment');
  console.log('2. Verificar logs en Vercel');
  console.log('3. Probar el frontend manualmente');
  console.log('4. Si hay problemas, revisar configuración de Vercel');
  
  console.log('\n📊 URLs IMPORTANTES:');
  console.log('Frontend: https://frontend-puce-eta-70-git-test.vercel.app');
  console.log('Backend: https://trn-extraccion-test-production.up.railway.app');
  console.log('API Health: https://trn-extraccion-test-production.up.railway.app/api/health');
}); 