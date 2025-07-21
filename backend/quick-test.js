const axios = require('axios');

async function quickTest() {
  console.log('🧪 Prueba rápida del servidor...\n');
  
  try {
    // Probar el endpoint de salud
    console.log('📡 Probando /api/health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health', { timeout: 3000 });
    console.log('✅ Servidor funcionando correctamente');
    console.log('   Status:', healthResponse.data.status);
    console.log('   Database:', healthResponse.data.database);
    
    return true;
  } catch (error) {
    console.log('❌ Servidor no disponible');
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 El servidor no está corriendo en puerto 3001');
      console.log('   💡 Ejecuta: npm run dev');
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

quickTest(); 