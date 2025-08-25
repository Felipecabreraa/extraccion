const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor de desarrollo del frontend...\n');

// Configurar variables de entorno
process.env.PORT = '3001';
process.env.REACT_APP_API_URL = 'http://localhost:3000/api';
process.env.REACT_APP_ENV = 'development';

console.log('📊 Configuración:');
console.log('   - Puerto del frontend: 3001');
console.log('   - URL de la API: http://localhost:3000/api');
console.log('   - Modo: development');

// Iniciar el servidor de desarrollo
const proceso = exec('npm start', { 
  cwd: path.join(__dirname, 'frontend'),
  env: {
    ...process.env,
    PORT: '3001',
    REACT_APP_API_URL: 'http://localhost:3000/api',
    REACT_APP_ENV: 'development'
  }
});

proceso.stdout.on('data', (data) => {
  console.log(data);
});

proceso.stderr.on('data', (data) => {
  console.error(data);
});

proceso.on('close', (code) => {
  console.log(`\n🔄 Servidor terminado con código ${code}`);
});

proceso.on('error', (error) => {
  console.error('❌ Error iniciando servidor:', error.message);
});

console.log('\n📱 El servidor se iniciará en http://localhost:3001');
console.log('🔗 Presiona Ctrl+C para detener el servidor');
