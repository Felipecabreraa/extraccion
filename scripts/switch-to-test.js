#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Cambiando a ambiente de PRUEBAS...');

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

console.log('🎯 Ambiente de PRUEBAS configurado:');
console.log('   📊 Backend: Puerto 3002, DB: trn_extraccion_test');
console.log('   🌐 Frontend: Puerto 3000, API: http://localhost:3002/api');
console.log('');
console.log('🚀 Para iniciar:');
console.log('   Backend: cd backend && npm run test:server');
console.log('   Frontend: cd frontend && npm start');
