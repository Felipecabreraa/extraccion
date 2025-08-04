const fs = require('fs');
const path = require('path');

console.log('🔄 Configurando ambiente de PRUEBAS para PRODUCCIÓN...');

// Configurar backend para pruebas en producción
const backendEnvPath = path.join(__dirname, '../backend/.env');
const backendTestProdEnvPath = path.join(__dirname, '../backend/env.test.production');

if (fs.existsSync(backendTestProdEnvPath)) {
  fs.copyFileSync(backendTestProdEnvPath, backendEnvPath);
  console.log('✅ Backend configurado para PRUEBAS en PRODUCCIÓN');
} else {
  console.log('❌ No se encontró env.test.production en backend');
}

// Configurar frontend para pruebas en producción
const frontendEnvPath = path.join(__dirname, '../frontend/.env');
const frontendTestProdEnvPath = path.join(__dirname, '../frontend/env.test.production');

if (fs.existsSync(frontendTestProdEnvPath)) {
  fs.copyFileSync(frontendTestProdEnvPath, frontendEnvPath);
  console.log('✅ Frontend configurado para PRUEBAS en PRODUCCIÓN');
} else {
  console.log('❌ No se encontró env.test.production en frontend');
}

console.log('🎯 Ambiente de PRUEBAS para PRODUCCIÓN configurado:');
console.log('   📊 Backend: Railway, DB: trn_extraccion_test');
console.log('   🌐 Frontend: Vercel, API: Railway Test');
console.log('');
console.log('🚀 Para desplegar:');
console.log('   Backend: cd backend && npx @railway/cli up');
console.log('   Frontend: cd frontend && npx vercel --prod'); 