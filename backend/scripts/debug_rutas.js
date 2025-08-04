const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugRutas() {
  try {
    console.log('🔍 Debuggeando rutas paso a paso...\n');

    // 1. Login para obtener token
    console.log('1. Obteniendo token...');
    let token = null;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      
      token = loginResponse.data.token;
      console.log('✅ Login exitoso');
      console.log(`   - Token: ${token.substring(0, 20)}...`);
    } catch (error) {
      console.log('❌ Error en login:', error.response?.status, error.response?.data?.message);
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // 2. Probar ruta principal
    console.log('\n2. Probando ruta principal /metros-superficie...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie`, { headers });
      console.log('✅ Ruta principal funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${response.data.registros?.length || 0} registros`);
    } catch (error) {
      console.log('❌ Error en ruta principal:', error.response?.status, error.response?.data?.message);
    }

    // 3. Probar ruta de estadísticas con julio 2025
    console.log('\n3. Probando /metros-superficie/estadisticas con julio 2025...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas?year=2025&month=7`, { headers });
      console.log('✅ Ruta estadísticas funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error) {
      console.log('❌ Error en estadísticas:', error.response?.status, error.response?.data?.message);
      console.log(`   - Error completo: ${JSON.stringify(error.response?.data)}`);
    }

    // 4. Probar ruta de mes anterior con julio 2025
    console.log('\n4. Probando /metros-superficie/mes-anterior con julio 2025...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/mes-anterior?year=2025&month=7`, { headers });
      console.log('✅ Ruta mes anterior funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error) {
      console.log('❌ Error en mes anterior:', error.response?.status, error.response?.data?.message);
      console.log(`   - Error completo: ${JSON.stringify(error.response?.data)}`);
    }

    // 5. Probar con un ID específico para ver si la ruta /:id funciona
    console.log('\n5. Probando /metros-superficie/1...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/1`, { headers });
      console.log('✅ Ruta con ID funciona');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Datos: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error) {
      console.log('❌ Error con ID:', error.response?.status, error.response?.data?.message);
    }

    // 6. Probar una ruta que no existe
    console.log('\n6. Probando /metros-superficie/ruta-inexistente...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/ruta-inexistente`, { headers });
      console.log('✅ Ruta inexistente devuelve respuesta');
      console.log(`   - Status: ${response.status}`);
    } catch (error) {
      console.log('❌ Error en ruta inexistente:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n✅ Debug completado!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugRutas(); 