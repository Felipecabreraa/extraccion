const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMetrosSuperficie() {
  try {
    console.log('🧪 Iniciando pruebas de Metros Superficie...\n');

    // 1. Probar endpoint de listar registros
    console.log('1. Probando endpoint de listar registros...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie`);
      console.log('✅ Listar registros:', response.data);
    } catch (error) {
      console.log('❌ Error listando registros:', error.response?.data || error.message);
    }

    // 2. Probar endpoint de estadísticas por quincena
    console.log('\n2. Probando endpoint de estadísticas por quincena...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas/quincena?year=2025&month=7`);
      console.log('✅ Estadísticas por quincena:', response.data);
    } catch (error) {
      console.log('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
    }

    // 3. Probar endpoint de mes anterior
    console.log('\n3. Probando endpoint de mes anterior...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas/mes-anterior?year=2025&month=7`);
      console.log('✅ Mes anterior:', response.data);
    } catch (error) {
      console.log('❌ Error obteniendo mes anterior:', error.response?.data || error.message);
    }

    // 4. Probar endpoint de sectores por zona
    console.log('\n4. Probando endpoint de sectores por zona...');
    try {
      const response = await axios.get(`${BASE_URL}/metros-superficie/sectores/1`);
      console.log('✅ Sectores por zona:', response.data);
    } catch (error) {
      console.log('❌ Error obteniendo sectores:', error.response?.data || error.message);
    }

    // 5. Probar endpoint de zonas
    console.log('\n5. Probando endpoint de zonas...');
    try {
      const response = await axios.get(`${BASE_URL}/zonas`);
      console.log('✅ Zonas:', response.data);
    } catch (error) {
      console.log('❌ Error obteniendo zonas:', error.response?.data || error.message);
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('- Si ves "✅" significa que el endpoint funciona correctamente');
    console.log('- Si ves "❌" significa que hay un error que necesita ser corregido');
    console.log('\n🌐 Para probar la interfaz web, ve a: http://localhost:3000/metros-superficie');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

testMetrosSuperficie();