const axios = require('axios');

async function testEndpointSimple() {
  try {
    console.log('🧪 Probando endpoint simple...');
    
    const response = await axios.get('http://localhost:3001/api/danos/meta/stats/test', {
      params: {
        year: 2025,
        porcentaje: 5.0
      }
    });
    
    console.log('✅ Respuesta exitosa!');
    console.log('📊 Configuración:', response.data.configuracion);
    console.log('📊 Datos año actual:', response.data.datosAnioActual);
    
    // Verificar datos mensuales
    console.log('\n📊 DATOS MENSUALES:');
    response.data.datosMensuales.forEach(mes => {
      if (mes.tieneDatos) {
        console.log(`   ${mes.nombreMes}:`);
        console.log(`     - Daños reales: ${mes.danosReales} (tipo: ${typeof mes.danosReales})`);
        console.log(`     - Acumulado real: ${mes.acumuladoReal} (tipo: ${typeof mes.acumuladoReal})`);
        console.log(`     - Meta mensual: ${mes.metaMensual} (tipo: ${typeof mes.metaMensual})`);
        console.log(`     - Acumulado meta: ${mes.acumuladoMeta} (tipo: ${typeof mes.acumuladoMeta})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testEndpointSimple(); 