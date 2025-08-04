#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Cambiando a ambiente de DESARROLLO...');

// Configurar backend
const backendEnvPath = path.join(__dirname, '../backend/.env');
const backendDevEnvPath = path.join(__dirname, '../backend/env.development');

if (fs.existsSync(backendDevEnvPath)) {
  fs.copyFileSync(backendDevEnvPath, backendEnvPath);
  console.log('✅ Backend configurado para DESARROLLO');
} else {
  console.log('❌ No se encontró env.development en backend');
}

// Configurar frontend
const frontendEnvPath = path.join(__dirname, '../frontend/.env');
const frontendDevEnvPath = path.join(__dirname, '../frontend/env.development');

if (fs.existsSync(frontendDevEnvPath)) {
  fs.copyFileSync(frontendDevEnvPath, frontendEnvPath);
  console.log('✅ Frontend configurado para DESARROLLO');
} else {
  console.log('❌ No se encontró env.development en frontend');
}

console.log('🎯 Ambiente de DESARROLLO configurado:');
console.log('   📊 Backend: Puerto 3001, DB: trn_extraccion');
console.log('   🌐 Frontend: Puerto 3000, API: http://localhost:3001/api');
console.log('');
console.log('🚀 Para iniciar:');
console.log('   Backend: cd backend && npm run dev');
console.log('   Frontend: cd frontend && npm start');
