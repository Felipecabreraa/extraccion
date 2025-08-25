const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function probarDanosCorregidos() {
  console.log('🧪 Probando corrección de daños registrados...\n');

  try {
    // Probar año actual (2025)
    console.log('📅 Probando año actual (2025):');
    const response2025 = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`);
    console.log(`   Daños registrados: ${response2025.data.danosMes}`);
    console.log(`   Total planillas: ${response2025.data.totalPlanillas}`);
    if (response2025.data._debugDanos) {
      console.log(`   DEBUG: ${JSON.stringify(response2025.data._debugDanos)}`);
    }
    console.log('');

    // Probar año futuro (2026)
    console.log('📅 Probando año futuro (2026):');
    const response2026 = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2026`);
    console.log(`   Daños registrados: ${response2026.data.danosMes}`);
    console.log(`   Total planillas: ${response2026.data.totalPlanillas}`);
    if (response2026.data._debugDanos) {
      console.log(`   DEBUG: ${JSON.stringify(response2026.data._debugDanos)}`);
    }
    console.log('');

    // Probar año futuro (2027)
    console.log('📅 Probando año futuro (2027):');
    const response2027 = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2027`);
    console.log(`   Daños registrados: ${response2027.data.danosMes}`);
    console.log(`   Total planillas: ${response2027.data.totalPlanillas}`);
    if (response2027.data._debugDanos) {
      console.log(`   DEBUG: ${JSON.stringify(response2027.data._debugDanos)}`);
    }
    console.log('');

    // Verificar que los daños son 0 para años futuros
    const danos2026 = response2026.data.danosMes;
    const danos2027 = response2027.data.danosMes;

    if (danos2026 === 0 && danos2027 === 0) {
      console.log('✅ CORRECCIÓN EXITOSA: Los daños registrados aparecen como 0 para años futuros');
    } else {
      console.log('❌ ERROR: Los daños registrados no son 0 para años futuros');
      console.log(`   Daños 2026: ${danos2026}`);
      console.log(`   Daños 2027: ${danos2027}`);
    }

    console.log('\n📊 Resumen:');
    console.log(`   Año 2025: ${response2025.data.danosMes} daños`);
    console.log(`   Año 2026: ${response2026.data.danosMes} daños`);
    console.log(`   Año 2027: ${response2027.data.danosMes} daños`);

  } catch (error) {
    console.error('❌ Error al probar la corrección:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
probarDanosCorregidos();
