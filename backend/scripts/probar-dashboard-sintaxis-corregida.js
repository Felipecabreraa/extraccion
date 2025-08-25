const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function probarDashboard() {
  console.log('🔧 Probando Dashboard después de corregir error de sintaxis...\n');

  try {
    // Probar años 2025, 2026, 2027
    const años = [2025, 2026, 2027];
    
    for (const año of años) {
      console.log(`📊 Probando año ${año}:`);
      
      // 1. Dashboard Metrics
      try {
        const responseMetrics = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=${año}`);
        console.log(`   ✅ Dashboard Metrics (${año}):`);
        console.log(`      - Total Planillas: ${responseMetrics.data.totalPlanillas || 0}`);
        console.log(`      - Total Mts2: ${responseMetrics.data.totalMts2 || 0}`);
        console.log(`      - Total Daños: ${responseMetrics.data.danosMes || 0}`);
        console.log(`      - Pabellones Únicos: ${responseMetrics.data.pabellonesUnicos || 0}`);
      } catch (error) {
        console.log(`   ❌ Error en Dashboard Metrics (${año}): ${error.message}`);
      }

      // 2. Dashboard Stats
      try {
        const responseStats = await axios.get(`${BASE_URL}/dashboard/unified/test-stats?year=${año}`);
        console.log(`   ✅ Dashboard Stats (${año}):`);
        console.log(`      - Total Ordenes: ${responseStats.data.totalOrdenes || 0}`);
        console.log(`      - Total Mts2: ${responseStats.data.totalMts2 || 0}`);
        console.log(`      - Total Daños: ${responseStats.data.totalDanos || 0}`);
      } catch (error) {
        console.log(`   ❌ Error en Dashboard Stats (${año}): ${error.message}`);
      }

      // 3. Petroleo Metrics
      try {
        const responsePetroleo = await axios.get(`${BASE_URL}/dashboard/petroleo/test-metrics?year=${año}`);
        console.log(`   ✅ Petroleo Metrics (${año}):`);
        console.log(`      - Total Litros: ${responsePetroleo.data.totalLitrosConsumidos || 0}`);
        console.log(`      - Total Mts2: ${responsePetroleo.data.totalMts2 || 0}`);
        console.log(`      - Total Pabellones: ${responsePetroleo.data.totalPabellones || 0}`);
      } catch (error) {
        console.log(`   ❌ Error en Petroleo Metrics (${año}): ${error.message}`);
      }

      console.log('');
    }

    console.log('🎯 Verificación del filtro por año:');
    console.log('- Año 2025: Debe mostrar datos reales');
    console.log('- Años 2026-2027: Debe mostrar 0 en métricas de superficie y otros datos');
    console.log('- El filtro debe funcionar correctamente en todos los endpoints');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la prueba
probarDashboard();
