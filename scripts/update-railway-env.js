const { execSync } = require('child_process');

async function updateRailwayEnv() {
  console.log('🚀 Actualizando variables de entorno en Railway...');
  
  try {
    // Verificar si railway CLI está instalado
    try {
      execSync('railway --version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Railway CLI no está instalado. Instálalo con: npm install -g @railway/cli');
      return;
    }
    
    // Variables de entorno para Railway
    const envVars = {
      'NODE_ENV': 'production',
      'PORT': '3000',
      'DB_HOST': 'trn.cl',
      'DB_USER': 'trn_felipe',
      'DB_PASSWORD': 'RioNegro2025@',
      'DB_NAME': 'trn_extraccion',
      'DB_PORT': '3306',
      'JWT_SECRET': 'your-production-secret-key-here',
      'JWT_EXPIRES_IN': '24h',
      'CORS_ORIGIN': 'http://localhost:3000,https://trn-extraccion-test.up.railway.app,https://trn-extraccion-production.up.railway.app',
      'LOG_LEVEL': 'info',
      'RATE_LIMIT_WINDOW_MS': '900000',
      'RATE_LIMIT_MAX_REQUESTS': '100',
      'UPLOAD_MAX_SIZE': '10485760',
      'BCRYPT_ROUNDS': '10'
    };
    
    console.log('📋 Configurando variables de entorno...');
    
    for (const [key, value] of Object.entries(envVars)) {
      try {
        execSync(`railway variables set ${key}=${value}`, { stdio: 'pipe' });
        console.log(`✅ ${key} configurado`);
      } catch (error) {
        console.error(`❌ Error configurando ${key}:`, error.message);
      }
    }
    
    console.log('\n🔄 Reiniciando servicio en Railway...');
    execSync('railway up', { stdio: 'inherit' });
    
    console.log('\n✅ Variables de entorno actualizadas en Railway');
    console.log('🌐 URL: https://trn-extraccion-test.up.railway.app');
    
  } catch (error) {
    console.error('❌ Error actualizando Railway:', error.message);
    console.log('\n💡 Alternativas:');
    console.log('1. Configurar variables manualmente en Railway Dashboard');
    console.log('2. Usar railway variables set desde la línea de comandos');
    console.log('3. Verificar que estés logueado en Railway CLI');
  }
}

// Ejecutar actualización
updateRailwayEnv(); 