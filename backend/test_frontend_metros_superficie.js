const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMetrosSuperficieCompleto() {
  try {
    console.log('🧪 Iniciando pruebas completas de Metros Superficie...\n');

    // 1. Verificar que el servidor esté funcionando
    console.log('1. Verificando servidor...');
    try {
      const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
      console.log('✅ Servidor funcionando:', response.data.message);
    } catch (error) {
      console.log('❌ Error de conexión al servidor:', error.message);
      return;
    }

    // 2. Probar endpoint de zonas (sin autenticación)
    console.log('\n2. Probando endpoint de zonas...');
    try {
      const response = await axios.get(`${BASE_URL}/zonas`);
      console.log('✅ Zonas obtenidas:', response.data.length, 'zonas encontradas');
    } catch (error) {
      console.log('❌ Error obteniendo zonas:', error.response?.data || error.message);
    }

    // 3. Probar endpoint de sectores por zona
    console.log('\n3. Probando endpoint de sectores por zona...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/sectores/1`);
      console.log('✅ Sectores por zona obtenidos:', response.data.length, 'sectores encontrados');
    } catch (error) {
      console.log('❌ Error obteniendo sectores:', error.response?.data || error.message);
    }

    // 4. Probar endpoint de estadísticas por quincena
    console.log('\n4. Probando endpoint de estadísticas por quincena...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas/quincena?year=2025&month=7`);
      console.log('✅ Estadísticas por quincena obtenidas');
      console.log('   - Primera quincena:', response.data.quincena1?.totales?.HEMBRA?.metros || 0, 'm² Hembra');
      console.log('   - Primera quincena:', response.data.quincena1?.totales?.MACHO?.metros || 0, 'm² Macho');
    } catch (error) {
      console.log('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
    }

    // 5. Probar endpoint de mes anterior
    console.log('\n5. Probando endpoint de mes anterior...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas/mes-anterior?year=2025&month=7`);
      console.log('✅ Mes anterior obtenido:', response.data.total_metros || 0, 'm²');
    } catch (error) {
      console.log('❌ Error obteniendo mes anterior:', error.response?.data || error.message);
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('- Si ves "✅" significa que el endpoint funciona correctamente');
    console.log('- Si ves "❌" significa que hay un error que necesita ser corregido');
    console.log('\n🌐 Para probar la interfaz web, ve a: http://localhost:3000/metros-superficie');
    console.log('🔧 Funcionalidades implementadas:');
    console.log('   - Vista de tabla completa');
    console.log('   - Vista separada por Hembra/Macho');
    console.log('   - Estadísticas quincenales');
    console.log('   - Cálculo automático de metros cuadrados');
    console.log('   - Formulario de registro (solo administradores)');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

testMetrosSuperficieCompleto();