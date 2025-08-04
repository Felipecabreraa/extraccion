const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMetrosSuperficieRoutes() {
  try {
    console.log('🧪 Probando rutas de metros superficie...\n');

    // 1. Probar ruta de estadísticas
    console.log('1. Probando /metros-superficie/estadisticas...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas`);
      console.log('✅ Estadísticas obtenidas correctamente');
      console.log(`   - Año: ${response.data.year}`);
      console.log(`   - Mes: ${response.data.month}`);
      console.log(`   - Registros: ${response.data.registros}`);
    } catch (error) {
      console.log('❌ Error en estadísticas:', error.response?.status, error.response?.data?.message);
    }

    // 2. Probar ruta de mes anterior
    console.log('\n2. Probando /metros-superficie/mes-anterior...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/mes-anterior`);
      console.log('✅ Mes anterior obtenido correctamente');
      console.log(`   - Datos: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log('❌ Error en mes anterior:', error.response?.status, error.response?.data?.message);
    }

    // 3. Probar ruta principal
    console.log('\n3. Probando /metros-superficie...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie`);
      console.log('✅ Lista de registros obtenida correctamente');
      console.log(`   - Total registros: ${response.data.length || 0}`);
    } catch (error) {
      console.log('❌ Error en lista:', error.response?.status, error.response?.data?.message);
    }

    // 4. Probar ruta de zonas
    console.log('\n4. Probando /zonas...');
    try {
      const response = await axios.get(`${BASE_URL}/zonas`);
      console.log('✅ Zonas obtenidas correctamente');
      console.log(`   - Total zonas: ${response.data.length || 0}`);
    } catch (error) {
      console.log('❌ Error en zonas:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n✅ Pruebas completadas!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testMetrosSuperficieRoutes(); 