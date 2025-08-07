const fs = require('fs');
const path = require('path');

function checkCurrentEnvironment() {
  const envFile = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envFile)) {
    console.log('❌ No se encontró archivo .env');
    console.log('💡 Ejecuta: node scripts/switch-environment.js <ambiente>');
    return;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const lines = envContent.split('\n');
  
  let currentEnv = 'desconocido';
  let apiUrl = 'no configurada';
  let dbName = 'no configurada';
  
  lines.forEach(line => {
    if (line.startsWith('REACT_APP_ENV=')) {
      currentEnv = line.split('=')[1].trim();
    }
    if (line.startsWith('REACT_APP_API_URL=')) {
      apiUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('REACT_APP_DB_NAME=')) {
      dbName = line.split('=')[1].trim();
    }
  });

  console.log('🔍 Ambiente Actual:');
  console.log(`   Ambiente: ${currentEnv.toUpperCase()}`);
  console.log(`   API URL: ${apiUrl}`);
  console.log(`   Base de Datos: ${dbName}`);
  
  if (currentEnv === 'test' || dbName.includes('test')) {
    console.log('✅ Banner de prueba: SE MOSTRARÁ');
  } else if (currentEnv === 'production') {
    console.log('❌ Banner de prueba: NO SE MOSTRARÁ (producción)');
  } else {
    console.log('⚠️  Banner de prueba: NO SE MOSTRARÁ (no es ambiente de prueba)');
  }
}

checkCurrentEnvironment(); 