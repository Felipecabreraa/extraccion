#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔴 Cambiando a ambiente de PRODUCCIÓN...');

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}: ${error.message}`);
  }
}

async function switchToProduction() {
  try {
    console.log('\n📋 Configurando archivos de entorno para producción...');
    
    copyFile(
      path.join(__dirname, '../backend/env.production'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.production'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\n✅ ¡Ambiente de producción configurado!');
    console.log('\n🌐 URLs de Producción:');
    console.log('   - Backend: [Configurar URL de producción]');
    console.log('   - Frontend: [Configurar URL de producción]');
    console.log('   - Base de datos: trn_extraccion_prod');
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Este ambiente usa la base de datos de producción');
    console.log('   - Los cambios afectarán datos reales');
    console.log('   - Usar solo para despliegues finales');
    
  } catch (error) {
    console.error('\n❌ Error configurando ambiente de producción:', error.message);
    process.exit(1);
  }
}

switchToProduction();
