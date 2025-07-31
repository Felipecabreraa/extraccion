const axios = require('axios');

// Configuración para pruebas locales
const BASE_URL = 'http://localhost:3001/api';

async function testDanoMetaStats() {
  try {
    console.log('🧪 Probando endpoint de metas de daños...\n');
    
    // Probar endpoint sin autenticación (ruta de prueba)
    console.log('1. Probando endpoint sin autenticación...');
    const response = await axios.get(`${BASE_URL}/danos/meta/stats/test`, {
      params: {
        year: 2025,
        porcentaje: 5.0
      },
      timeout: 15000
    });
    
    console.log('✅ Respuesta exitosa:');
    console.log('   - Status:', response.status);
    console.log('   - Configuración:', response.data.configuracion);
    console.log('   - Datos año actual:', response.data.datosAnioActual);
    console.log('   - Datos año anterior:', response.data.datosAnioAnterior);
    console.log('   - Meses con datos:', response.data.datosMensuales?.length || 0);
    
    if (response.data.datosMensuales) {
      console.log('\n📊 Primeros 3 meses:');
      response.data.datosMensuales.slice(0, 3).forEach(mes => {
        console.log(`   - ${mes.nombreMes}: ${mes.danosReales} reales vs ${mes.metaMensual} meta`);
      });
    }
    
    console.log('\n🎯 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
    
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verificar que el servidor backend esté ejecutándose');
    console.log('   2. Verificar que la vista vw_danos_mes_anio existe');
    console.log('   3. Verificar la conexión a la base de datos');
  }
}

async function testDanoMetaResumen() {
  try {
    console.log('\n🧪 Probando endpoint de resumen de metas...\n');
    
    const response = await axios.get(`${BASE_URL}/danos/meta/resumen/test`, {
      params: {
        year: 2025,
        porcentaje: 5.0
      },
      timeout: 10000
    });
    
    console.log('✅ Resumen obtenido:');
    console.log('   - Status:', response.status);
    console.log('   - Datos:', response.data);
    
  } catch (error) {
    console.error('❌ Error en resumen:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  await testDanoMetaStats();
  await testDanoMetaResumen();
  
  console.log('\n🏁 Todas las pruebas completadas');
  process.exit(0);
}

if (require.main === module) {
  runTests();
}

module.exports = { testDanoMetaStats, testDanoMetaResumen }; 