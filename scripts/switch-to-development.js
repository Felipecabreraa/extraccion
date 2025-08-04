#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🟢 Cambiando a ambiente de DESARROLLO...');

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}: ${error.message}`);
  }
}

async function switchToDevelopment() {
  try {
    console.log('\n📋 Configurando archivos de entorno para desarrollo...');
    
    copyFile(
      path.join(__dirname, '../backend/env.development'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.development'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\n✅ ¡Ambiente de desarrollo configurado!');
    console.log('\n🌐 URLs de Desarrollo:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Base de datos: trn_extraccion_dev');
    
    console.log('\n🚀 Comandos para iniciar:');
    console.log('   - Backend: cd backend && npm run dev');
    console.log('   - Frontend: cd frontend && npm start');
    
  } catch (error) {
    console.error('\n❌ Error configurando ambiente de desarrollo:', error.message);
    process.exit(1);
  }
}

switchToDevelopment();
