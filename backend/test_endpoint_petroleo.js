const axios = require('axios');

async function testPetroleoEndpoint() {
  try {
    console.log('🔍 Probando endpoint de petróleo...\n');
    
    // Probar endpoint sin autenticación
    const response = await axios.get('http://localhost:3001/api/dashboard/petroleo/test-metrics', {
      params: {
        year: 2025,
        origen: 'todos'
      }
    });
    
    console.log('✅ Endpoint funcionando correctamente');
    console.log('📊 Datos recibidos:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error probando endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testPetroleoEndpoint(); 