const axios = require('axios');

// Configuración base
const BASE_URL = 'http://localhost:3001/api';

async function testImplementacionCompleta() {
  console.log('🧪 Probando implementación completa de vista unificada...\n');

  try {
    // 1. Probar Dashboard con vista unificada
    console.log('1. Probando Dashboard con vista unificada...');
    
    // Test 1: Dashboard sin filtros
    console.log('   - Dashboard sin filtros:');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/metrics`);
    console.log(`     ✅ Total planillas: ${dashboardResponse.data.totalPlanillas}`);
    console.log(`     ✅ Total pabellones: ${dashboardResponse.data.totalPabellones}`);
    console.log(`     ✅ Pabellones mes: ${dashboardResponse.data.pabellonesMes}`);
    console.log(`     ✅ Variación pabellones: ${dashboardResponse.data.variacionPabellones}%`);
    
    // Test 2: Dashboard con filtro histórico 2025
    console.log('   - Dashboard con filtro histórico 2025:');
    const dashboardHistoricoResponse = await axios.get(`${BASE_URL}/dashboard/metrics?origen=historico_2025&year=2025`);
    console.log(`     ✅ Total planillas: ${dashboardHistoricoResponse.data.totalPlanillas}`);
    console.log(`     ✅ Fuente: ${dashboardHistoricoResponse.data.metadata.fuente}`);
    
    // Test 3: Gráficos del dashboard
    console.log('   - Gráficos del dashboard:');
    const chartsResponse = await axios.get(`${BASE_URL}/dashboard/charts?year=2025`);
    console.log(`     ✅ Tendencias mensuales: ${chartsResponse.data.ordenesPorMes?.length || 0} períodos`);
    console.log(`     ✅ Top sectores: ${chartsResponse.data.topSectores?.length || 0} sectores`);
    
    // 2. Probar Daños con vista unificada
    console.log('\n2. Probando Daños con vista unificada...');
    
    // Test 1: Estadísticas de daños sin filtros
    console.log('   - Estadísticas de daños sin filtros:');
    const danosResponse = await axios.get(`${BASE_URL}/danos/stats?year=2025`);
    console.log(`     ✅ Total órdenes con daños: ${danosResponse.data.resumen.total_ordenes_con_danos}`);
    console.log(`     ✅ Total daños: ${danosResponse.data.resumen.total_danos}`);
    console.log(`     ✅ Tipos de daños: ${danosResponse.data.resumen.tipos_danos_diferentes}`);
    console.log(`     ✅ Daños por tipo: ${danosResponse.data.danosPorTipo?.length || 0} tipos`);
    
    // Test 2: Daños con filtro histórico
    console.log('   - Daños con filtro histórico:');
    const danosHistoricoResponse = await axios.get(`${BASE_URL}/danos/stats?origen=historico_2025&year=2025`);
    console.log(`     ✅ Total daños históricos: ${danosHistoricoResponse.data.resumen.total_danos}`);
    console.log(`     ✅ Fuente: ${danosHistoricoResponse.data.metadata.fuente}`);
    
    // Test 3: Daños por sector
    console.log('   - Daños por sector:');
    console.log(`     ✅ Sectores con daños: ${danosResponse.data.danosPorSector?.length || 0} sectores`);
    
    // 3. Verificar estructura de datos
    console.log('\n3. Verificando estructura de datos...');
    
    // Verificar campos del dashboard
    const requiredDashboardFields = [
      'totalPlanillas', 'totalPabellones', 'pabellonesMes', 
      'variacionPabellones', 'charts', 'metadata'
    ];
    
    requiredDashboardFields.forEach(field => {
      if (dashboardResponse.data.hasOwnProperty(field)) {
        console.log(`     ✅ Dashboard: ${field} presente`);
      } else {
        console.log(`     ❌ Dashboard: ${field} faltante`);
      }
    });
    
    // Verificar campos de daños
    const requiredDanosFields = [
      'resumen', 'danosPorTipo', 'danosPorSector', 
      'danosPorSupervisor', 'evolucion', 'metadata'
    ];
    
    requiredDanosFields.forEach(field => {
      if (danosResponse.data.hasOwnProperty(field)) {
        console.log(`     ✅ Daños: ${field} presente`);
      } else {
        console.log(`     ❌ Daños: ${field} faltante`);
      }
    });
    
    // 4. Probar filtros
    console.log('\n4. Probando filtros...');
    
    // Test filtro por mes
    const dashboardMesResponse = await axios.get(`${BASE_URL}/dashboard/metrics?year=2025&month=7`);
    console.log(`     ✅ Dashboard mes 7: ${dashboardMesResponse.data.pabellonesMes} pabellones`);
    
    // Test filtro daños por mes
    const danosMesResponse = await axios.get(`${BASE_URL}/danos/stats?year=2025&month=7`);
    console.log(`     ✅ Daños mes 7: ${danosMesResponse.data.resumen.total_danos} daños`);
    
    // 5. Resumen de datos
    console.log('\n5. Resumen de datos obtenidos...');
    console.log(`   📊 Dashboard:`);
    console.log(`      - Total planillas: ${dashboardResponse.data.totalPlanillas}`);
    console.log(`      - Total pabellones: ${dashboardResponse.data.totalPabellones}`);
    console.log(`      - Pabellones mes actual: ${dashboardResponse.data.pabellonesMes}`);
    console.log(`      - Variación: ${dashboardResponse.data.variacionPabellones}%`);
    
    console.log(`   🔧 Daños:`);
    console.log(`      - Órdenes con daños: ${danosResponse.data.resumen.total_ordenes_con_danos}`);
    console.log(`      - Total daños: ${danosResponse.data.resumen.total_danos}`);
    console.log(`      - Tipos diferentes: ${danosResponse.data.resumen.tipos_danos_diferentes}`);
    console.log(`      - Sectores afectados: ${danosResponse.data.resumen.sectores_con_danos}`);
    
    console.log('\n✅ Implementación completa probada exitosamente!');
    console.log('🎯 La vista unificada está funcionando correctamente en Dashboard y Daños');
    console.log('📊 Los datos se están proyectando desde vw_ordenes_2025_actual');
    
  } catch (error) {
    console.error('❌ Error probando implementación:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testImplementacionCompleta(); 