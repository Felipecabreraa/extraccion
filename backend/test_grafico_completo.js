const axios = require('axios');

async function testGraficoCompleto() {
  try {
    console.log('🧪 Probando endpoint completo para gráfico...');
    
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
    
    // Mostrar datos para el gráfico
    console.log('\n📊 DATOS PARA GRÁFICO:');
    response.data.datosMensuales.forEach(mes => {
      if (mes.tieneDatos) {
        console.log(`   ${mes.nombreMes}:`);
        console.log(`     - Meta acumulada: ${mes.acumuladoMeta}`);
        console.log(`     - Real acumulado: ${mes.acumuladoReal}`);
        console.log(`     - Año anterior: ${mes.danosAnioAnterior}`);
      }
    });
    
    // Verificar que tenemos datos del año anterior
    const mesesConDatosAnioAnterior = response.data.datosMensuales.filter(mes => mes.danosAnioAnterior > 0).length;
    console.log(`\n📊 Meses con datos del año anterior: ${mesesConDatosAnioAnterior}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGraficoCompleto(); 