const axios = require('axios');

console.log('🔧 Configurando variables de entorno automáticamente...\n');

// Datos del proyecto
const PROJECT_ID = 'felipe-lagos-projects-f57024eb';
const TEAM_ID = 'felipe-lagos-projects-f57024eb';

// Variables de entorno CORRECTAS
const envVars = {
  'DB_HOST': 'trn.cl',
  'DB_USER': 'trn_felipe',
  'DB_PASSWORD': 'RioNegro2025@',
  'DB_NAME': 'trn_extraccion',
  'DB_PORT': '3306',
  'NODE_ENV': 'production',
  'JWT_SECRET': 'tu-jwt-secret-super-seguro-para-produccion',
  'CORS_ORIGIN': 'https://extraccion-ifr1jglgp-felipe-lagos-projects-f57024eb.vercel.app',
  'LOG_LEVEL': 'info'
};

async function configurarVariables() {
  try {
    console.log('📋 Variables a configurar:');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${key.includes('PASSWORD') ? '***' : value}`);
    });

    console.log('\n⚠️  IMPORTANTE:');
    console.log('   Las variables de entorno deben configurarse manualmente en el dashboard de Vercel');
    console.log('   debido a restricciones de seguridad de la API.');
    
    console.log('\n🔗 Enlaces directos:');
    console.log('   - Variables de entorno: https://vercel.com/felipe-lagos-projects-f57024eb/extraccion/settings/environment-variables');
    console.log('   - Dashboard: https://vercel.com/dashboard');
    
    console.log('\n📋 Copia y pega estas variables en Vercel:');
    console.log('   ==========================================');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}=${value}`);
    });
    console.log('   ==========================================');
    
    console.log('\n🎯 Pasos a seguir:');
    console.log('   1. Ve a: https://vercel.com/felipe-lagos-projects-f57024eb/extraccion/settings/environment-variables');
    console.log('   2. Haz clic en "Add New" para cada variable');
    console.log('   3. Copia y pega cada variable de la lista de arriba');
    console.log('   4. Guarda los cambios');
    console.log('   5. Haz un nuevo despliegue: npx vercel --prod');
    
    console.log('\n✅ URL de producción:');
    console.log('   https://extraccion-ifr1jglgp-felipe-lagos-projects-f57024eb.vercel.app');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

configurarVariables(); 