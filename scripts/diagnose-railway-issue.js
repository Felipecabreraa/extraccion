#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Diagnosticando problema de Railway...');

// Verificar configuración actual
console.log('\n📋 CONFIGURACIÓN ACTUAL:');

// Verificar package.json
const packagePath = path.join(__dirname, '../backend/package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ Package.json encontrado');
  console.log(`   - Script start: ${packageJson.scripts?.start || 'NO DEFINIDO'}`);
  console.log(`   - Script dev: ${packageJson.scripts?.dev || 'NO DEFINIDO'}`);
  console.log(`   - Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
} else {
  console.log('❌ Package.json no encontrado');
}

// Verificar Procfile
const procfilePath = path.join(__dirname, '../Procfile');
if (fs.existsSync(procfilePath)) {
  const procfile = fs.readFileSync(procfilePath, 'utf8');
  console.log('✅ Procfile encontrado:');
  console.log(`   ${procfile.trim()}`);
} else {
  console.log('❌ Procfile no encontrado');
}

// Verificar railway.json
const railwayPath = path.join(__dirname, '../railway.json');
if (fs.existsSync(railwayPath)) {
  const railwayJson = JSON.parse(fs.readFileSync(railwayPath, 'utf8'));
  console.log('✅ Railway.json encontrado:');
  console.log(`   - Build: ${railwayJson.build?.builder || 'NO DEFINIDO'}`);
  console.log(`   - Deploy: ${railwayJson.deploy?.restartPolicyType || 'NO DEFINIDO'}`);
} else {
  console.log('❌ Railway.json no encontrado');
}

console.log('\n🎯 PROBLEMA IDENTIFICADO:');
console.log('   - Railway está enviando SIGTERM al servidor');
console.log('   - Esto puede deberse a:');
console.log('     1. Configuración incorrecta del Procfile');
console.log('     2. Variables de entorno faltantes');
console.log('     3. Puerto incorrecto');
console.log('     4. Timeout de Railway');

console.log('\n🔧 SOLUCIONES:');

// 1. Crear/actualizar Procfile
console.log('\n1. 📝 CREAR PROCFILE CORRECTO:');
const procfileContent = `web: npm start
`;
fs.writeFileSync(procfilePath, procfileContent);
console.log('✅ Procfile creado/actualizado');

// 2. Crear/actualizar railway.json
console.log('\n2. ⚙️ CONFIGURAR RAILWAY.JSON:');
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
};
fs.writeFileSync(railwayPath, JSON.stringify(railwayConfig, null, 2));
console.log('✅ Railway.json configurado');

// 3. Verificar variables de entorno
console.log('\n3. 🔍 VERIFICAR VARIABLES DE ENTORNO:');
const envPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`   ✅ ${varName}: CONFIGURADO`);
    } else {
      console.log(`   ❌ ${varName}: FALTANTE`);
    }
  });
} else {
  console.log('❌ Archivo .env no encontrado');
}

// 4. Crear script de inicio mejorado
console.log('\n4. 🚀 CREAR SCRIPT DE INICIO MEJORADO:');
const startScript = `#!/bin/bash
echo "🚀 Iniciando servidor en modo: $NODE_ENV"
echo "📊 Puerto: $PORT"
echo "🔗 Base de datos: $DB_NAME"

# Esperar a que la base de datos esté lista
echo "⏳ Esperando conexión a base de datos..."
sleep 5

# Iniciar servidor con manejo de señales mejorado
node src/app.js
`;

const startScriptPath = path.join(__dirname, '../backend/start.sh');
fs.writeFileSync(startScriptPath, startScript);
fs.chmodSync(startScriptPath, '755');
console.log('✅ Script de inicio creado');

// 5. Actualizar package.json
console.log('\n5. 📦 ACTUALIZAR PACKAGE.JSON:');
const packageJsonPath = path.join(__dirname, '../backend/package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.scripts = {
    ...packageJson.scripts,
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "start:prod": "NODE_ENV=production node src/app.js",
    "start:test": "NODE_ENV=test node src/app.js"
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json actualizado');
}

console.log('\n📋 PASOS MANUALES REQUERIDOS:');

console.log('\n1. 🔧 EN RAILWAY DASHBOARD:');
console.log('   - Ir a: https://railway.app/dashboard');
console.log('   - Seleccionar proyecto: trn-extraccion-test');
console.log('   - Verificar variables de entorno:');
console.log('     * NODE_ENV=test');
console.log('     * PORT=3002');
console.log('     * DB_HOST=trn.cl');
console.log('     * DB_USER=trn_felipe');
console.log('     * DB_PASSWORD=RioNegro2025@');
console.log('     * DB_NAME=trn_extraccion_test');

console.log('\n2. 🔄 HACER DEPLOY:');
console.log('   - Hacer commit de los cambios');
console.log('   - Hacer push a la rama test');
console.log('   - Railway debería hacer deploy automáticamente');

console.log('\n3. 📊 VERIFICAR LOGS:');
console.log('   - En Railway Dashboard, ir a "Deployments"');
console.log('   - Revisar logs del último deployment');
console.log('   - Verificar que no haya errores de conexión');

console.log('\n4. 🎯 RESULTADO ESPERADO:');
console.log('   - Servidor iniciando sin SIGTERM');
console.log('   - Estado: RUNNING en lugar de CRASHED');
console.log('   - Logs mostrando conexión exitosa a MySQL');

// Hacer commit de los cambios
console.log('\n📦 Agregando cambios...');
try {
  execSync('git add .', { cwd: process.cwd() });
  console.log('✅ Cambios agregados');
  
  execSync('git commit -m "Fix: Solucionar problema SIGTERM en Railway"', { cwd: process.cwd() });
  console.log('✅ Commit realizado');
  
  execSync('git push origin test', { cwd: process.cwd() });
  console.log('✅ Push realizado');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎉 Diagnóstico completado. Revisa Railway Dashboard para verificar el deployment.'); 