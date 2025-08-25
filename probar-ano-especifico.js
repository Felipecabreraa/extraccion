const axios = require('axios');

async function probarAnoEspecifico() {
  const ano = 2026;
  console.log(`🧪 Probando año ${ano} específicamente...\n`);
  
  try {
    const response = await axios.get(`http://localhost:3001/api/dashboard/unified/test-metrics?year=${ano}`);
    console.log('✅ Respuesta completa:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Respuesta de error:', error.response.data);
    }
  }
}

probarAnoEspecifico();
