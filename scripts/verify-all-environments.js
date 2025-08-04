const fs = require('fs');
const path = require('path');

function verifyAllEnvironments() {
  console.log('🔍 Verificando configuración de todos los ambientes...\n');

  const environments = [
    { name: 'TEST', file: 'env.test', color: '🟡' },
    { name: 'DEVELOPMENT', file: 'env.development', color: '🟢' },
    { name: 'PRODUCTION', file: 'env.production', color: '🔴' }
  ];

  console.log('📋 Configuración por ambiente:\n');

  environments.forEach(env => {
    console.log(`${env.color} **AMBIENTE ${env.name}**`);
    
    // Verificar backend
    const backendPath = path.join(__dirname, `../backend/${env.file}`);
    if (fs.existsSync(backendPath)) {
      const backendContent = fs.readFileSync(backendPath, 'utf8');
      const dbName = backendContent.match(/DB_NAME=(.+)/)?.[1] || 'No configurado';
      const port = backendContent.match(/PORT=(.+)/)?.[1] || 'No configurado';
      const nodeEnv = backendContent.match(/NODE_ENV=(.+)/)?.[1] || 'No configurado';
      
      console.log(`   📊 Backend: Puerto ${port}, DB: ${dbName}, NODE_ENV: ${nodeEnv}`);
    } else {
      console.log(`   ❌ Backend: Archivo ${env.file} no encontrado`);
    }

    // Verificar frontend
    const frontendPath = path.join(__dirname, `../frontend/${env.file}`);
    if (fs.existsSync(frontendPath)) {
      const frontendContent = fs.readFileSync(frontendPath, 'utf8');
      const apiUrl = frontendContent.match(/REACT_APP_API_URL=(.+)/)?.[1] || 'No configurado';
      const environment = frontendContent.match(/REACT_APP_ENVIRONMENT=(.+)/)?.[1] || 'No configurado';
      
      console.log(`   🌐 Frontend: API: ${apiUrl}, ENV: ${environment}`);
    } else {
      console.log(`   ❌ Frontend: Archivo ${env.file} no encontrado`);
    }

    console.log('');
  });

  console.log('🚀 Comandos disponibles:');
  console.log('   npm run env:test  # Cambiar a ambiente de PRUEBAS');
  console.log('   npm run env:dev   # Cambiar a ambiente de DESARROLLO');
  console.log('   npm run env:prod  # Cambiar a ambiente de PRODUCCIÓN');
  console.log('');
  console.log('📊 Resumen de ambientes:');
  console.log('   🟡 TEST: Base de datos trn_extraccion_test, Railway API');
  console.log('   🟢 DEV: Base de datos trn_extraccion, Localhost API');
  console.log('   🔴 PROD: Base de datos trn_extraccion, Railway API');
  console.log('');
  console.log('💡 Para probar cada ambiente:');
  console.log('   1. Ejecutar: npm run env:[ambiente]');
  console.log('   2. Ejecutar: npm run dev:frontend');
  console.log('   3. Abrir: http://localhost:3001');
  console.log('   4. Hacer login con credenciales correspondientes');
}

verifyAllEnvironments(); 