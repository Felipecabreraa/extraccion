const axios = require('axios');

async function testSimple() {
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
    console.log('📊 Meses con datos:', response.data.datosMensuales.length);
    
    // Mostrar primeros 3 meses
    response.data.datosMensuales.slice(0, 3).forEach(mes => {
      console.log(`   - ${mes.nombreMes}: ${mes.danosReales} reales vs ${mes.metaMensual} meta`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSimple(); 