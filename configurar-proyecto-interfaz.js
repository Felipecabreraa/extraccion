const axios = require('axios');

console.log('🎯 CONFIGURACIÓN DEL PROYECTO "INTERFAZ"');
console.log('==========================================');
console.log('');

console.log('📋 VARIABLES DE ENTORNO REQUERIDAS:');
console.log('====================================');
console.log('');
console.log('DB_HOST=trn.cl');
console.log('DB_USER=trn_felipe');
console.log('DB_PASSWORD=RioNegro2025@');
console.log('DB_NAME=trn_extraccion');
console.log('DB_PORT=3306');
console.log('NODE_ENV=production');
console.log('JWT_SECRET=tu-jwt-secret-super-seguro-para-produccion');
console.log('CORS_ORIGIN=https://frontend-tau-liard-43.vercel.app');
console.log('LOG_LEVEL=info');
console.log('');

console.log('🔧 PASOS PARA CONFIGURAR:');
console.log('==========================');
console.log('');
console.log('1. Ve a: https://vercel.com/dashboard');
console.log('2. Selecciona el proyecto "Interfaz"');
console.log('3. Ve a Settings > Environment Variables');
console.log('4. Agrega cada variable de la lista anterior');
console.log('5. Guarda los cambios');
console.log('');
console.log('6. Conecta el repositorio Git:');
console.log('   - Ve a Settings > Git');
console.log('   - Conecta tu repositorio de GitHub');
console.log('');
console.log('7. Haz un nuevo despliegue:');
console.log('   - Ve a Deployments');
console.log('   - Haz clic en "Redeploy"');
console.log('');

console.log('✅ URL del proyecto: https://frontend-tau-liard-43.vercel.app');
console.log('');

async function verificarProyectoInterfaz() {
  console.log('🔍 Verificando estado del proyecto...');
  
  try {
    const response = await axios.get('https://frontend-tau-liard-43.vercel.app', { 
      timeout: 10000 
    });
    console.log('✅ Proyecto accesible - Status:', response.status);
  } catch (error) {
    console.log('❌ Error al acceder al proyecto:', error.message);
    console.log('💡 Esto es normal si las variables no están configuradas');
  }
}

verificarProyectoInterfaz(); 