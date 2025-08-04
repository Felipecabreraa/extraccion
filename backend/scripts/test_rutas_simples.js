const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRutasSimples() {
  try {
    console.log('🧪 Probando rutas simples...\n');

    // 1. Probar ruta principal (sin autenticación)
    console.log('1. Probando /metros-superficie...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie`);
      console.log('✅ Ruta principal funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${response.data.registros?.length || 0} registros`);
    } catch (error) {
      console.log('❌ Error en ruta principal:', error.response?.status, error.response?.data?.message);
    }

    // 2. Probar ruta de estadísticas (sin autenticación)
    console.log('\n2. Probando /metros-superficie/estadisticas...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas`);
      console.log('✅ Ruta estadísticas funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log('❌ Error en estadísticas:', error.response?.status, error.response?.data?.message);
    }

    // 3. Probar ruta de mes anterior (sin autenticación)
    console.log('\n3. Probando /metros-superficie/mes-anterior...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/mes-anterior`);
      console.log('✅ Ruta mes anterior funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log('❌ Error en mes anterior:', error.response?.status, error.response?.data?.message);
    }

    // 4. Probar con un ID específico
    console.log('\n4. Probando /metros-superficie/1...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/1`);
      console.log('✅ Ruta con ID funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log('❌ Error con ID:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n✅ Pruebas completadas!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testRutasSimples(); 