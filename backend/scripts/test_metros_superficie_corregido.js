const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMetrosSuperficieCorregido() {
  try {
    console.log('🧪 Probando rutas de metros superficie con mes correcto...\n');

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
    } catch (error) {
      console.log('❌ Error en login:', error.response?.status, error.response?.data?.message);
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // 2. Probar estadísticas con julio 2025 (mes con datos)
    console.log('\n2. Probando /metros-superficie/estadisticas con julio 2025...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas?year=2025&month=7`, { headers });
      console.log('✅ Estadísticas obtenidas correctamente');
      console.log(`   - Año: ${response.data.year}`);
      console.log(`   - Mes: ${response.data.month}`);
      console.log(`   - Registros: ${response.data.registros}`);
      console.log(`   - Total HEMBRA: ${response.data.totales.HEMBRA.pabellones} pabellones, ${response.data.totales.HEMBRA.metros} m²`);
      console.log(`   - Total MACHO: ${response.data.totales.MACHO.pabellones} pabellones, ${response.data.totales.MACHO.metros} m²`);
    } catch (error) {
      console.log('❌ Error en estadísticas:', error.response?.status, error.response?.data?.message);
    }

    // 3. Probar mes anterior (junio 2025)
    console.log('\n3. Probando /metros-superficie/mes-anterior con junio 2025...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/mes-anterior?year=2025&month=7`, { headers });
      console.log('✅ Mes anterior obtenido correctamente');
      console.log(`   - Año: ${response.data.year}`);
      console.log(`   - Mes: ${response.data.month}`);
      console.log(`   - Total metros: ${response.data.total_metros}`);
    } catch (error) {
      console.log('❌ Error en mes anterior:', error.response?.status, error.response?.data?.message);
    }

    // 4. Probar estadísticas del mes actual (agosto 2025)
    console.log('\n4. Probando /metros-superficie/estadisticas con mes actual (agosto 2025)...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas`, { headers });
      console.log('✅ Estadísticas del mes actual obtenidas correctamente');
      console.log(`   - Año: ${response.data.year}`);
      console.log(`   - Mes: ${response.data.month}`);
      console.log(`   - Registros: ${response.data.registros}`);
      console.log(`   - Total HEMBRA: ${response.data.totales.HEMBRA.pabellones} pabellones, ${response.data.totales.HEMBRA.metros} m²`);
      console.log(`   - Total MACHO: ${response.data.totales.MACHO.pabellones} pabellones, ${response.data.totales.MACHO.metros} m²`);
    } catch (error) {
      console.log('❌ Error en estadísticas del mes actual:', error.response?.status, error.response?.data?.message);
    }

    // 5. Probar lista de registros
    console.log('\n5. Probando /metros-superficie...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie`, { headers });
      console.log('✅ Lista de registros obtenida correctamente');
      console.log(`   - Total registros: ${response.data.registros?.length || 0}`);
      console.log(`   - Total en BD: ${response.data.total || 0}`);
    } catch (error) {
      console.log('❌ Error en lista:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n✅ Pruebas completadas!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testMetrosSuperficieCorregido(); 