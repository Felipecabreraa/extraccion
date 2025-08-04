#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Verificando estado del deployment en Railway...');

// URLs de prueba
const testUrls = [
  'https://trn-extraccion-test-production.up.railway.app',
  'https://trn-extraccion-test-production.up.railway.app/api/health',
  'https://trn-extraccion-test-production.up.railway.app/api/auth/login'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
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
  console.log('\n🌐 VERIFICANDO ENDPOINTS:');
  
  for (const url of testUrls) {
    const result = await checkUrl(url);
    console.log('');
  }
}

// Verificar variables de entorno
console.log('\n🔧 CONFIGURACIÓN DE ENTORNO:');
const envVars = [
  'NODE_ENV',
  'PORT', 
  'DB_HOST',
  'DB_USER',
  'DB_NAME'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADO`);
  }
});

// Verificar archivos de configuración
console.log('\n📋 ARCHIVOS DE CONFIGURACIÓN:');
const fs = require('fs');
const path = require('path');

const configFiles = [
  'Procfile',
  'railway.json',
  'package.json',
  'backend/package.json'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}: EXISTE`);
  } else {
    console.log(`❌ ${file}: NO EXISTE`);
  }
});

// Verificar logs recientes
console.log('\n📊 LOGS RECIENTES:');
console.log('Para ver logs en Railway:');
console.log('1. Ir a: https://railway.app/dashboard');
console.log('2. Seleccionar proyecto: trn-extraccion-test');
console.log('3. Ir a la pestaña "Deployments"');
console.log('4. Revisar logs del último deployment');

// Ejecutar verificaciones
checkAllUrls().then(() => {
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Revisar Railway Dashboard para verificar deployment');
  console.log('2. Verificar logs en Railway');
  console.log('3. Probar endpoints manualmente');
  console.log('4. Si hay problemas, revisar variables de entorno');
}); 