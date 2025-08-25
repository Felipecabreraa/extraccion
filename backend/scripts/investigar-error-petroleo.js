const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function investigarErrorPetroleo() {
  console.log('🔍 Investigando error 500 en Petroleo Metrics...\n');

  try {
    // Probar con diferentes años
    const años = [2025, 2026, 2027];
    
    for (const año of años) {
      console.log(`📊 Probando Petroleo Metrics para año ${año}:`);
      
      try {
        const response = await axios.get(`${BASE_URL}/dashboard/petroleo/test-metrics?year=${año}`);
        console.log(`   ✅ Respuesta exitosa para ${año}:`);
        console.log(`      - Status: ${response.status}`);
        console.log(`      - Datos recibidos: ${Object.keys(response.data).length} campos`);
      } catch (error) {
        console.log(`   ❌ Error para ${año}:`);
        console.log(`      - Status: ${error.response?.status}`);
        console.log(`      - Mensaje: ${error.response?.data?.message || error.message}`);
        
        // Si hay detalles del error, mostrarlos
        if (error.response?.data?.error) {
          console.log(`      - Error detallado: ${error.response.data.error}`);
        }
        
        // Si hay stack trace, mostrarlo
        if (error.response?.data?.stack) {
          console.log(`      - Stack trace: ${error.response.data.stack.split('\n')[0]}`);
        }
      }
      
      console.log('');
    }

    // Probar sin parámetros
    console.log('📊 Probando Petroleo Metrics sin parámetros:');
    try {
      const response = await axios.get(`${BASE_URL}/dashboard/petroleo/test-metrics`);
      console.log(`   ✅ Respuesta exitosa sin parámetros:`);
      console.log(`      - Status: ${response.status}`);
      console.log(`      - Datos recibidos: ${Object.keys(response.data).length} campos`);
    } catch (error) {
      console.log(`   ❌ Error sin parámetros:`);
      console.log(`      - Status: ${error.response?.status}`);
      console.log(`      - Mensaje: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la investigación
investigarErrorPetroleo();
