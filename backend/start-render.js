// Script de inicio específico para Render
console.log('🚀 Iniciando servidor para Render...');

// Configurar variables de entorno críticas
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;

console.log('📊 Variables de entorno configuradas:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_NAME:', process.env.DB_NAME);

// Verificar que las variables críticas estén configuradas
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars);
  process.exit(1);
}

console.log('✅ Todas las variables de entorno están configuradas');

// Cargar la aplicación
try {
  require('./src/app.js');
  console.log('✅ Aplicación cargada correctamente');
} catch (error) {
  console.error('❌ Error cargando la aplicación:', error);
  process.exit(1);
}
