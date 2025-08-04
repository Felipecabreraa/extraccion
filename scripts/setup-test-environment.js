#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Configurando ambiente de PRUEBAS PÚBLICO...');

// Configurar backend
const backendEnvPath = path.join(__dirname, '../backend/.env');
const backendTestEnvPath = path.join(__dirname, '../backend/env.test');

if (fs.existsSync(backendTestEnvPath)) {
  fs.copyFileSync(backendTestEnvPath, backendEnvPath);
  console.log('✅ Backend configurado para PRUEBAS');
} else {
  console.log('❌ No se encontró env.test en backend');
}

// Configurar frontend
const frontendEnvPath = path.join(__dirname, '../frontend/.env');
const frontendTestEnvPath = path.join(__dirname, '../frontend/env.test');

if (fs.existsSync(frontendTestEnvPath)) {
  fs.copyFileSync(frontendTestEnvPath, frontendEnvPath);
  console.log('✅ Frontend configurado para PRUEBAS');
} else {
  console.log('❌ No se encontró env.test en frontend');
}

console.log('🎯 Ambiente de PRUEBAS PÚBLICO configurado:');
console.log('   📊 Backend: Puerto 3002, DB: trn_extraccion_test');
console.log('   🌐 Frontend: API: https://trn-extraccion-test.up.railway.app/api');
console.log('');
console.log('🚀 Para desplegar:');
console.log('   1. Hacer commit y push a la rama test');
console.log('   2. Vercel desplegará automáticamente');
console.log('   3. Configurar variables de entorno en Railway para el backend');
console.log('');
console.log('📋 Variables de entorno necesarias en Railway:');
console.log('   NODE_ENV=test');
console.log('   PORT=3002');
console.log('   DB_NAME=trn_extraccion_test');
console.log('   CORS_ORIGIN=https://frontend-puce-eta-70-git-test.vercel.app'); 