const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function explicarCalculosDashboard() {
  console.log('🧮 EXPLICACIÓN DE CÁLCULOS DEL DASHBOARD');
  console.log('==========================================\n');

  try {
    // Obtener datos del backend para 2025
    console.log('📡 Obteniendo datos del backend para 2025...');
    
    const [dashboardResponse, petroleoResponse, chartsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`),
      axios.get(`${BASE_URL}/dashboard/petroleo/test-metrics?year=2025`),
      axios.get(`${BASE_URL}/dashboard/unified/test-charts?year=2025`)
    ]);

    const dashboardData = dashboardResponse.data;
    const petroleoData = petroleoResponse.data;
    const chartsData = chartsResponse.data;

    console.log('✅ Datos obtenidos exitosamente\n');

    // 1. EXPLICAR CÁLCULOS DE SUPERFICIE
    console.log('🏗️ CÁLCULOS DE SUPERFICIE');
    console.log('==========================');
    
    console.log(`📊 Total Mts² desde backend: ${dashboardData.totalMts2?.toLocaleString() || 'N/A'}`);
    console.log(`📊 Total Planillas desde backend: ${dashboardData.totalPlanillas?.toLocaleString() || 'N/A'}`);
    
    if (dashboardData.totalMts2 && dashboardData.totalPlanillas) {
      const promedioMts2PorPlanilla = Math.round(dashboardData.totalMts2 / dashboardData.totalPlanillas);
      console.log(`📏 Cálculo promedio m²/planilla: ${dashboardData.totalMts2.toLocaleString()} ÷ ${dashboardData.totalPlanillas.toLocaleString()} = ${promedioMts2PorPlanilla.toLocaleString()} m²/planilla`);
      
      const eficienciaPorSector = Math.round(dashboardData.totalMts2 / dashboardData.totalPlanillas / 8);
      console.log(`⚡ Cálculo eficiencia por sector: ${dashboardData.totalMts2.toLocaleString()} ÷ ${dashboardData.totalPlanillas.toLocaleString()} ÷ 8 horas = ${eficienciaPorSector.toLocaleString()} m²/hora`);
    }
    console.log('');

    // 2. EXPLICAR CÁLCULOS DE COMBUSTIBLE
    console.log('⛽ CÁLCULOS DE COMBUSTIBLE');
    console.log('==========================');
    
    if (petroleoData.kpis) {
      console.log(`🛢️ Total litros desde backend: ${petroleoData.kpis.totalLitrosConsumidos?.toLocaleString() || 'N/A'} L`);
      console.log(`📊 Total pabellones procesados: ${petroleoData.kpis.totalPabellonesProcesados?.toLocaleString() || 'N/A'}`);
      
      if (petroleoData.kpis.totalLitrosConsumidos && petroleoData.kpis.totalPabellonesProcesados) {
        const promedioLitroPorPabellon = Math.round(petroleoData.kpis.totalLitrosConsumidos / petroleoData.kpis.totalPabellonesProcesados);
        console.log(`📈 Cálculo promedio L/pabellón: ${petroleoData.kpis.totalLitrosConsumidos.toLocaleString()} ÷ ${petroleoData.kpis.totalPabellonesProcesados.toLocaleString()} = ${promedioLitroPorPabellon} L/pabellón`);
      }
      
      console.log(`📊 Eficiencia combustible: ${petroleoData.kpis.promedioLitrosPorRegistro || 'N/A'} L/registro`);
    }
    console.log('');

    // 3. EXPLICAR CÁLCULOS DE DAÑOS
    console.log('⚠️ CÁLCULOS DE DAÑOS');
    console.log('=====================');
    
    console.log(`🚨 Daños del mes desde backend: ${dashboardData.danosMes || 'N/A'}`);
    console.log(`📊 Total planillas desde backend: ${dashboardData.totalPlanillas?.toLocaleString() || 'N/A'}`);
    
    if (dashboardData.danosMes && dashboardData.totalPlanillas) {
      const porcentajePlanillasConDanos = Math.round((dashboardData.danosMes / dashboardData.totalPlanillas) * 100);
      console.log(`📊 Cálculo % planillas con daños: (${dashboardData.danosMes} ÷ ${dashboardData.totalPlanillas.toLocaleString()}) × 100 = ${porcentajePlanillasConDanos}%`);
    }
    console.log('');

    // 4. EXPLICAR DATOS DE GRÁFICOS
    console.log('📈 DATOS DE GRÁFICOS');
    console.log('====================');
    
    if (chartsData.tendenciasMensuales) {
      console.log(`📊 Tendencias mensuales disponibles: ${chartsData.tendenciasMensuales.length} meses`);
      chartsData.tendenciasMensuales.forEach((mes, index) => {
        console.log(`   ${index + 1}. ${mes.mes}: ${mes.planillas} planillas, ${mes.pabellones} pabellones`);
      });
    } else {
      console.log('❌ No hay datos de tendencias mensuales');
    }
    
    if (chartsData.rendimientoPorSector) {
      console.log(`📊 Sectores con rendimiento: ${chartsData.rendimientoPorSector.length} sectores`);
      chartsData.rendimientoPorSector.slice(0, 3).forEach((sector, index) => {
        console.log(`   ${index + 1}. ${sector.sector}: ${sector.planillas} planillas, ${sector.pabellones} pabellones`);
      });
    } else {
      console.log('❌ No hay datos de rendimiento por sector');
    }
    console.log('');

    // 5. EXPLICAR VARIACIONES
    console.log('📈 CÁLCULOS DE VARIACIONES');
    console.log('==========================');
    
    console.log(`📊 Variación planillas: ${dashboardData.variacionPlanillas || 'N/A'}%`);
    console.log(`📊 Variación pabellones: ${dashboardData.variacionPabellones || 'N/A'}%`);
    console.log(`📊 Variación mts²: ${dashboardData.variacionMts2 || 'N/A'}%`);
    console.log('');

    // 6. RESUMEN DE FÓRMULAS
    console.log('🧮 FÓRMULAS UTILIZADAS');
    console.log('======================');
    
    console.log('📏 Superficie:');
    console.log('   • Promedio m²/planilla = Total m² ÷ Total planillas');
    console.log('   • Eficiencia por sector = Total m² ÷ Total planillas ÷ 8 horas');
    console.log('');
    
    console.log('⛽ Combustible:');
    console.log('   • Promedio L/pabellón = Total litros ÷ Total pabellones procesados');
    console.log('   • Eficiencia = Promedio litros por registro (desde backend)');
    console.log('');
    
    console.log('⚠️ Daños:');
    console.log('   • % Planillas con daños = (Daños del mes ÷ Total planillas) × 100');
    console.log('');
    
    console.log('📈 Variaciones:');
    console.log('   • Calculadas automáticamente por el backend');
    console.log('   • Comparación mes actual vs mes anterior');
    console.log('');

    // 7. VERIFICAR PROBLEMAS POTENCIALES
    console.log('🔍 VERIFICACIÓN DE PROBLEMAS');
    console.log('============================');
    
    const problemas = [];
    
    if (!chartsData.tendenciasMensuales || chartsData.tendenciasMensuales.length === 0) {
      problemas.push('❌ No hay datos de tendencias mensuales');
    }
    
    if (!chartsData.rendimientoPorSector || chartsData.rendimientoPorSector.length === 0) {
      problemas.push('❌ No hay datos de rendimiento por sector');
    }
    
    if (dashboardData.totalPlanillas === 0) {
      problemas.push('❌ Total planillas es 0');
    }
    
    if (dashboardData.totalMts2 === 0) {
      problemas.push('❌ Total mts² es 0');
    }
    
    if (problemas.length === 0) {
      console.log('✅ No se detectaron problemas en los datos');
    } else {
      console.log('⚠️ Problemas detectados:');
      problemas.forEach(problema => console.log(`   ${problema}`));
    }

  } catch (error) {
    console.error('❌ Error explicando cálculos:', error.message);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// Ejecutar explicación
explicarCalculosDashboard();
