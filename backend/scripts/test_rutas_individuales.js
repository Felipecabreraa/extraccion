const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRutasIndividuales() {
  try {
    console.log('🧪 Probando rutas individuales...\n');

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

    // 2. Probar cada ruta individualmente
    const rutas = [
      { nombre: 'Principal', url: '/metros-superficie' },
      { nombre: 'Estadísticas', url: '/metros-superficie/estadisticas' },
      { nombre: 'Mes Anterior', url: '/metros-superficie/mes-anterior' },
      { nombre: 'Estadísticas Quincena', url: '/metros-superficie/estadisticas/quincena' },
      { nombre: 'Estadísticas Mes Anterior', url: '/metros-superficie/estadisticas/mes-anterior' },
      { nombre: 'Reporte Detallado', url: '/metros-superficie/reporte-detallado' },
      { nombre: 'Con ID 1', url: '/metros-superficie/1' },
      { nombre: 'Con ID 999', url: '/metros-superficie/999' }
    ];

    for (const ruta of rutas) {
      console.log(`\n${ruta.nombre}: ${ruta.url}`);
      try {
        const response = await axios.get(`${BASE_URL}${ruta.url}`, { headers });
        console.log(`   ✅ Status: ${response.status}`);
        if (response.data) {
          if (Array.isArray(response.data)) {
            console.log(`   📊 Datos: ${response.data.length} elementos`);
          } else if (typeof response.data === 'object') {
            console.log(`   📊 Datos: ${Object.keys(response.data).length} propiedades`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Status: ${error.response?.status}`);
        console.log(`   ❌ Error: ${error.response?.data?.message}`);
      }
    }

    console.log('\n✅ Pruebas completadas!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testRutasIndividuales(); 