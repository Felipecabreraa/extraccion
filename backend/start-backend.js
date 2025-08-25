// Script para iniciar el backend sin dotenv
console.log('🚀 Iniciando backend sin dotenv...');

// Cargar nuestras variables de entorno primero
require('./config-db.js');

console.log('✅ Variables de entorno cargadas');
console.log('📊 DB_HOST:', process.env.DB_HOST);
console.log('📊 DB_NAME:', process.env.DB_NAME);
console.log('📊 DB_USER:', process.env.DB_USER);

// Iniciar la aplicación
require('./src/app.js');
