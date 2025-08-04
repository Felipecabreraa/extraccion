const { execSync } = require('child_process');

async function setupRailwayTest() {
  console.log('🚀 Configurando Railway para ambiente de PRUEBAS...');
  
  try {
    // Verificar si railway CLI está disponible
    try {
      execSync('npx railway --version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Railway CLI no está disponible. Instálalo con: npm install -g @railway/cli');
      return;
    }
    
    // Variables de entorno específicas para PRUEBAS
    const testEnvVars = {
      'NODE_ENV': 'test',
      'PORT': '3000',
      'DB_HOST': 'trn.cl',
      'DB_USER': 'trn_felipe',
      'DB_PASSWORD': 'RioNegro2025@',
      'DB_NAME': 'trn_extraccion_test',
      'DB_PORT': '3306',
      'JWT_SECRET': 'test-secret-key-for-testing-only',
      'JWT_EXPIRES_IN': '24h',
      'CORS_ORIGIN': 'http://localhost:3000,http://localhost:3002,https://trn-extraccion-test.up.railway.app',
      'LOG_LEVEL': 'debug',
      'RATE_LIMIT_WINDOW_MS': '60000',
      'RATE_LIMIT_MAX_REQUESTS': '1000',
      'UPLOAD_MAX_SIZE': '10485760',
      'BCRYPT_ROUNDS': '8',
      'TEST_MODE': 'true',
      'ALLOW_TEST_USERS': 'true'
    };
    
    console.log('📋 Configurando variables de entorno para PRUEBAS...');
    
    for (const [key, value] of Object.entries(testEnvVars)) {
      try {
        execSync(`npx railway variables set ${key}=${value}`, { stdio: 'pipe' });
        console.log(`✅ ${key} configurado para pruebas`);
      } catch (error) {
        console.error(`❌ Error configurando ${key}:`, error.message);
      }
    }
    
    console.log('\n🔄 Reiniciando servicio en Railway...');
    execSync('npx railway up', { stdio: 'inherit' });
    
    console.log('\n✅ Railway configurado para PRUEBAS');
    console.log('🌐 URL: https://trn-extraccion-test.up.railway.app');
    console.log('🔧 Ambiente: TEST');
    console.log('📊 Rate Limit: 1000 requests/min');
    console.log('🔓 CORS: Permitido para localhost y Railway Test');
    
  } catch (error) {
    console.error('❌ Error configurando Railway para pruebas:', error.message);
    console.log('\n💡 Alternativas:');
    console.log('1. Configurar variables manualmente en Railway Dashboard');
    console.log('2. Verificar que estés logueado en Railway CLI');
    console.log('3. Verificar que el proyecto esté seleccionado correctamente');
  }
}

// Ejecutar configuración
setupRailwayTest(); 