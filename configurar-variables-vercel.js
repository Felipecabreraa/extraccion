const { execSync } = require('child_process');

console.log('🔧 Configurando variables de entorno en Vercel...\n');

// Variables de entorno CORRECTAS para la aplicación
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

console.log('📋 Variables de entorno CORRECTAS a configurar:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

console.log('\n⚠️  IMPORTANTE:');
console.log('   1. Debes configurar estas variables manualmente en el dashboard de Vercel');
console.log('   2. Ve a: https://vercel.com/felipe-lagos-projects-f57024eb/extraccion/settings/environment-variables');
console.log('   3. Agrega cada variable con su valor correspondiente');
console.log('   4. La base de datos MySQL está en trn.cl y debería estar accesible desde Vercel');
console.log('\n🔗 Enlaces útiles:');
console.log('   - Dashboard de Vercel: https://vercel.com/dashboard');
console.log('   - Variables de entorno: https://vercel.com/felipe-lagos-projects-f57024eb/extraccion/settings/environment-variables');
console.log('   - Logs de la aplicación: https://vercel.com/felipe-lagos-projects-f57024eb/extraccion/functions');

console.log('\n📊 URL de producción:');
console.log('   https://extraccion-ifr1jglgp-felipe-lagos-projects-f57024eb.vercel.app');

console.log('\n🎯 Próximos pasos:');
console.log('   1. Configurar variables de entorno en Vercel Dashboard');
console.log('   2. Verificar que la base de datos esté accesible');
console.log('   3. Probar la aplicación en producción');
console.log('   4. Verificar que los datos de daños acumulados se muestren correctamente');

console.log('\n✅ Datos de la base de datos:');
console.log('   - Host: trn.cl');
console.log('   - Base de datos: trn_extraccion');
console.log('   - Usuario: trn_felipe');
console.log('   - Puerto: 3306'); 