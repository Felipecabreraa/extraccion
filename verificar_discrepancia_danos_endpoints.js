const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarDiscrepanciaDanos() {
  try {
    console.log('🔍 Verificando discrepancia en daños: 608 vs 584\n');

    // 1. Verificar daños en dashboard metrics
    console.log('1. Verificando daños en dashboard metrics:');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/metrics?year=2025`);
    const dashboardData = dashboardResponse.data;
    
    console.log(`   📊 danosMes: ${dashboardData.danosMes || 'N/A'}`);
    console.log(`   📊 danosPorTipo: ${JSON.stringify(dashboardData.danosPorTipo || [])}`);

    // 2. Verificar daños en dashboard stats
    console.log('\n2. Verificando daños en dashboard stats:');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats?year=2025`);
    const statsData = statsResponse.data;
    
    console.log(`   📊 totalDanos: ${statsData.totalDanos || 'N/A'}`);
    console.log(`   📊 danosPorTipo: ${JSON.stringify(statsData.danosPorTipo || [])}`);

    // 3. Verificar daños históricos
    console.log('\n3. Verificando daños históricos:');
    const historicosResponse = await axios.get(`${BASE_URL}/dashboard/danos-historicos?year=2025`);
    const historicosData = historicosResponse.data;
    
    console.log(`   📊 totalDanos: ${historicosData.totalDanos || 'N/A'}`);
    console.log(`   📊 danosPorTipo: ${JSON.stringify(historicosData.danosPorTipo || [])}`);

    // 4. Verificar daños combinadas
    console.log('\n4. Verificando daños combinadas:');
    const combinadasResponse = await axios.get(`${BASE_URL}/dashboard/danos-combinadas?year=2025`);
    const combinadasData = combinadasResponse.data;
    
    console.log(`   📊 totalDanos: ${combinadasData.totalDanos || 'N/A'}`);
    console.log(`   📊 danosPorTipo: ${JSON.stringify(combinadasData.danosPorTipo || [])}`);

    // 5. Verificar vista unificada
    console.log('\n5. Verificando vista unificada:');
    const unificadaResponse = await axios.get(`${BASE_URL}/dashboard/unified-stats?year=2025`);
    const unificadaData = unificadaResponse.data;
    
    console.log(`   📊 totalPlanillas: ${unificadaData.totalPlanillas || 'N/A'}`);
    console.log(`   📊 totalPabellones: ${unificadaData.totalPabellones || 'N/A'}`);
    console.log(`   📊 danosMes: ${unificadaData.danosMes || 'N/A'}`);

    // 6. Verificar endpoint específico de daños
    console.log('\n6. Verificando endpoint específico de daños:');
    try {
      const danosResponse = await axios.get(`${BASE_URL}/danos/stats?year=2025`);
      const danosData = danosResponse.data;
      
      console.log(`   📊 totalDanos: ${danosData.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(danosData.danosPorTipo || [])}`);
      console.log(`   📊 danosPorSector: ${JSON.stringify(danosData.danosPorSector || [])}`);
    } catch (error) {
      console.log(`   ❌ Error en endpoint de daños: ${error.response?.status || error.message}`);
    }

    // 7. Verificar endpoint de daños test
    console.log('\n7. Verificando endpoint de daños test:');
    try {
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      console.log(`   📊 totalDanos: ${danosTestData.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(danosTestData.danosPorTipo || [])}`);
    } catch (error) {
      console.log(`   ❌ Error en endpoint de daños test: ${error.response?.status || error.message}`);
    }

    // 8. Verificar diferentes orígenes
    console.log('\n8. Verificando diferentes orígenes:');
    const origenes = ['todos', 'historico_2025', 'activo'];
    
    for (const origen of origenes) {
      try {
        const origenResponse = await axios.get(`${BASE_URL}/dashboard/metrics?year=2025&origen=${origen}`);
        const origenData = origenResponse.data;
        
        console.log(`   📊 Origen ${origen}:`);
        console.log(`      - danosMes: ${origenData.danosMes || 'N/A'}`);
        console.log(`      - totalPlanillas: ${origenData.totalPlanillas || 'N/A'}`);
      } catch (error) {
        console.log(`   ❌ Error con origen ${origen}: ${error.response?.status || error.message}`);
      }
    }

    // 9. Resumen final
    console.log('\n9. Resumen de la discrepancia:');
    console.log('   🔢 Daños esperados: 608');
    console.log('   🔢 Daños encontrados en dashboard: ' + (dashboardData.danosMes || 'N/A'));
    console.log('   🔢 Daños encontrados en stats: ' + (statsData.totalDanos || 'N/A'));
    console.log('   🔢 Daños encontrados en históricos: ' + (historicosData.totalDanos || 'N/A'));
    console.log('   🔢 Daños encontrados en combinadas: ' + (combinadasData.totalDanos || 'N/A'));
    console.log('   🔢 Daños encontrados en unificada: ' + (unificadaData.danosMes || 'N/A'));

    // 10. Análisis del problema
    console.log('\n10. Análisis del problema:');
    const danosEncontrados = [
      dashboardData.danosMes,
      statsData.totalDanos,
      historicosData.totalDanos,
      combinadasData.totalDanos,
      unificadaData.danosMes
    ].filter(val => val !== undefined && val !== 'N/A' && val > 0);

    if (danosEncontrados.length === 0) {
      console.log('   ❌ PROBLEMA: No se encontraron daños en ningún endpoint');
      console.log('   💡 Posibles causas:');
      console.log('      - Los daños no están en la vista unificada');
      console.log('      - Los endpoints no están consultando la tabla correcta');
      console.log('      - Los filtros están excluyendo los daños');
      console.log('      - Los daños están en una tabla separada');
    } else {
      console.log('   ✅ Se encontraron daños en algunos endpoints');
      console.log(`   📊 Valores encontrados: ${danosEncontrados.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error al verificar discrepancia:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarDiscrepanciaDanos();





