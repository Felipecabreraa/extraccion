#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🟡 Cambiando a ambiente de PRUEBAS...');

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}: ${error.message}`);
  }
}

async function switchToTest() {
  try {
    console.log('\n📋 Configurando archivos de entorno para pruebas...');
    
    copyFile(
      path.join(__dirname, '../backend/env.test'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.test'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\n✅ ¡Ambiente de pruebas configurado!');
    console.log('\n🌐 URLs de Pruebas:');
    console.log('   - Backend: http://localhost:3002');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Base de datos: trn_extraccion_test');
    
    console.log('\n🚀 Comandos para iniciar:');
    console.log('   - Backend: cd backend && npm run test:server');
    console.log('   - Frontend: cd frontend && npm start');
    
  } catch (error) {
    console.error('\n❌ Error configurando ambiente de pruebas:', error.message);
    process.exit(1);
  }
}

switchToTest();
