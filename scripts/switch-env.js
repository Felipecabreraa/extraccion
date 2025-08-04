const fs = require('fs');
const path = require('path');

function switchEnvironment(environment) {
  console.log(`🔄 Cambiando a ambiente de ${environment.toUpperCase()}...`);
  
  try {
    // Configurar backend
    const backendEnvPath = path.join(__dirname, '../backend/.env');
    const backendEnvSource = path.join(__dirname, `../backend/env.${environment}`);
    
    if (fs.existsSync(backendEnvSource)) {
      fs.copyFileSync(backendEnvSource, backendEnvPath);
      console.log('✅ Backend configurado para', environment);
    } else {
      console.log('⚠️ No se encontró configuración de backend para', environment);
    }
    
    // Configurar frontend
    const frontendEnvPath = path.join(__dirname, '../frontend/.env');
    const frontendEnvSource = path.join(__dirname, `../frontend/env.${environment}`);
    
    if (fs.existsSync(frontendEnvSource)) {
      fs.copyFileSync(frontendEnvSource, frontendEnvPath);
      console.log('✅ Frontend configurado para', environment);
    } else {
      console.log('⚠️ No se encontró configuración de frontend para', environment);
    }
    
    console.log(`\n🎯 Ambiente de ${environment.toUpperCase()} configurado:`);
    
    switch (environment) {
      case 'test':
        console.log('   📊 Backend: Puerto 3001, DB: trn_extraccion_test');
        console.log('   🌐 Frontend: API: https://trn-extraccion-production.up.railway.app/api');
        console.log('   📧 Usuario: admin@test.com / admin123');
        break;
      case 'development':
        console.log('   📊 Backend: Puerto 3001, DB: trn_extraccion');
        console.log('   🌐 Frontend: API: http://localhost:3001/api');
        break;
      case 'production':
        console.log('   📊 Backend: Puerto 3000, DB: trn_extraccion');
        console.log('   🌐 Frontend: API: https://trn-extraccion-production.up.railway.app/api');
        break;
    }
    
    console.log('\n🚀 Para iniciar:');
    console.log('   npm run dev:backend  # Iniciar backend');
    console.log('   npm run dev:frontend # Iniciar frontend');
    console.log('   npm run dev          # Iniciar ambos');
    
  } catch (error) {
    console.error('❌ Error cambiando ambiente:', error.message);
  }
}

// Obtener el ambiente desde los argumentos de línea de comandos
const environment = process.argv[2];

if (!environment) {
  console.log('❌ Debes especificar un ambiente:');
  console.log('   npm run env:test');
  console.log('   npm run env:dev');
  console.log('   npm run env:prod');
  process.exit(1);
}

switchEnvironment(environment); 