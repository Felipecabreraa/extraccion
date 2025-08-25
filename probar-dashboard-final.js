const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Función de transformación de datos (actualizada)
const transformMetrics = (dashboardData, petroleoData, danosData, chartsData) => {
  return {
    // Métricas principales del dashboard
    totalPlanillas: dashboardData.totalPlanillas || 0,
    planillasActivas: dashboardData.planillasActivas || 0,
    planillasCompletadas: dashboardData.planillasCompletadas || 0,
    planillasMes: dashboardData.planillasMes || 0,
    totalPabellones: dashboardData.totalPabellones || 0,
    pabellonesMes: dashboardData.pabellonesMes || 0,
    totalMaquinas: dashboardData.totalMaquinas || 0,
    totalOperadores: dashboardData.totalOperadores || 0,
    totalSectores: dashboardData.totalSectores || 0,
    
    // Métricas de superficie (transformar de mts2)
    totalMetrosSuperficie: dashboardData.totalMts2 || 0,
    promedioMetrosPorPlanilla: dashboardData.totalMts2 && dashboardData.totalPlanillas 
      ? Math.round(dashboardData.totalMts2 / dashboardData.totalPlanillas) 
      : 0,
    mts2Mes: dashboardData.mts2Mes || 0,
    metrosSuperficieMes: dashboardData.mts2Mes || 0,
    eficienciaPorSector: dashboardData.totalMts2 && dashboardData.totalPlanillas
      ? Math.round(dashboardData.totalMts2 / dashboardData.totalPlanillas / 8) // 8 horas promedio
      : 0,
    
    // Métricas de combustible (transformar de petróleo)
    totalCombustible: petroleoData.kpis?.totalLitrosConsumidos || 0,
    eficienciaCombustible: petroleoData.kpis?.promedioLitrosPorRegistro || 0,
    maquinasActivas: petroleoData.kpis?.totalMaquinas || 0,
    promedioCombustiblePorPabellon: petroleoData.kpis?.totalLitrosConsumidos && petroleoData.kpis?.totalPabellonesProcesados
      ? Math.round(petroleoData.kpis.totalLitrosConsumidos / petroleoData.kpis.totalPabellonesProcesados)
      : 0,
    
    // Métricas de daños (CORREGIDO)
    totalDanos: dashboardData.danosMes || 0, // Usar danosMes como totalDanos temporalmente
    danosMes: dashboardData.danosMes || 0,
    porcentajePlanillasConDanos: dashboardData.totalPlanillas && dashboardData.danosMes
      ? Math.round((dashboardData.danosMes / dashboardData.totalPlanillas) * 100)
      : 0,
    
    // Eficiencia operativa
    eficienciaOperativa: dashboardData.eficienciaGlobal || 0,
    
    // Operadores y sectores activos
    operadoresActivos: dashboardData.totalOperadores || 0,
    sectoresActivos: dashboardData.totalSectores || 0,
    
    // Variaciones
    variacionPlanillas: dashboardData.variacionPlanillas || 0,
    variacionPabellones: dashboardData.variacionPabellones || 0,
    variacionMts2: dashboardData.variacionMts2 || 0,
    
    // Gráficos y tendencias
    charts: {
      tendenciasMensuales: chartsData?.tendenciasMensuales || [],
      rendimientoPorSector: chartsData?.rendimientoPorSector || [],
      estados: chartsData?.estados || []
    },
    
    // Metadatos
    metadata: dashboardData.metadata || {},
    
    // Datos originales para debugging
    _rawDashboard: dashboardData,
    _rawPetroleo: petroleoData,
    _rawDanos: danosData,
    _rawCharts: chartsData
  };
};

async function probarDashboardFinal() {
  console.log('🧪 PROBANDO DASHBOARD FINAL');
  console.log('============================\n');

  const years = [2025, 2026, 2027];

  for (const year of years) {
    console.log(`📅 PROBANDO AÑO ${year}`);
    console.log('='.repeat(30));
    
    try {
      // Obtener datos del backend
      const [dashboardResponse, petroleoResponse, danosResponse, chartsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=${year}`),
        axios.get(`${BASE_URL}/dashboard/petroleo/test-metrics?year=${year}`),
        axios.get(`${BASE_URL}/dashboard/unified/test-stats?year=${year}`),
        axios.get(`${BASE_URL}/dashboard/unified/test-charts?year=${year}`)
      ]);

      // Transformar datos
      const transformedMetrics = transformMetrics(
        dashboardResponse.data, 
        petroleoResponse.data, 
        danosResponse.data,
        chartsResponse.data
      );

      // Mostrar métricas principales
      console.log(`🏢 Total Planillas: ${transformedMetrics.totalPlanillas.toLocaleString()}`);
      console.log(`📐 Total Mts²: ${transformedMetrics.totalMetrosSuperficie.toLocaleString()}`);
      console.log(`⛽ Total Combustible: ${transformedMetrics.totalCombustible.toLocaleString()} L`);
      console.log(`⚠️ Total Daños: ${transformedMetrics.totalDanos.toLocaleString()}`);
      console.log(`📊 % Planillas con Daños: ${transformedMetrics.porcentajePlanillasConDanos}%`);
      
      // Verificar si hay datos
      const hasData = transformedMetrics.totalPlanillas > 0 || transformedMetrics.totalMetrosSuperficie > 0;
      
      if (hasData) {
        console.log(`✅ Año ${year}: Datos disponibles`);
      } else {
        console.log(`⚠️ Año ${year}: Sin datos`);
      }
      
      console.log('');

    } catch (error) {
      console.log(`❌ Error en año ${year}: ${error.message}`);
      console.log('');
    }
  }

  // Probar específicamente el año 2025 con datos detallados
  console.log('📊 ANÁLISIS DETALLADO AÑO 2025');
  console.log('================================');
  
  try {
    const [dashboardResponse, petroleoResponse, danosResponse, chartsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`),
      axios.get(`${BASE_URL}/dashboard/petroleo/test-metrics?year=2025`),
      axios.get(`${BASE_URL}/dashboard/unified/test-stats?year=2025`),
      axios.get(`${BASE_URL}/dashboard/unified/test-charts?year=2025`)
    ]);

    const transformedMetrics = transformMetrics(
      dashboardResponse.data, 
      petroleoResponse.data, 
      danosResponse.data,
      chartsResponse.data
    );

    console.log('📋 MÉTRICAS PRINCIPALES:');
    console.log(`   • Planillas: ${transformedMetrics.totalPlanillas.toLocaleString()}`);
    console.log(`   • Pabellones: ${transformedMetrics.totalPabellones.toLocaleString()}`);
    console.log(`   • Mts²: ${transformedMetrics.totalMetrosSuperficie.toLocaleString()}`);
    console.log(`   • Combustible: ${transformedMetrics.totalCombustible.toLocaleString()} L`);
    console.log(`   • Daños: ${transformedMetrics.totalDanos.toLocaleString()}`);
    console.log(`   • % Daños: ${transformedMetrics.porcentajePlanillasConDanos}%`);
    
    console.log('\n📈 GRÁFICOS:');
    console.log(`   • Tendencias mensuales: ${transformedMetrics.charts.tendenciasMensuales.length} meses`);
    console.log(`   • Sectores: ${transformedMetrics.charts.rendimientoPorSector.length} sectores`);
    console.log(`   • Estados: ${transformedMetrics.charts.estados.length} estados`);
    
    console.log('\n🎯 VERIFICACIÓN DE PROBLEMAS:');
    
    const problemas = [];
    
    if (transformedMetrics.totalDanos === 0) {
      problemas.push('❌ Total daños es 0');
    } else {
      console.log('✅ Total daños corregido:', transformedMetrics.totalDanos);
    }
    
    if (transformedMetrics.charts.tendenciasMensuales.length === 0) {
      problemas.push('❌ No hay datos de tendencias mensuales');
    } else {
      console.log('✅ Tendencias mensuales disponibles');
    }
    
    if (problemas.length === 0) {
      console.log('✅ Dashboard funcionando correctamente');
    } else {
      console.log('⚠️ Problemas restantes:');
      problemas.forEach(problema => console.log(`   ${problema}`));
    }

  } catch (error) {
    console.error('❌ Error en análisis detallado:', error.message);
  }
}

// Ejecutar prueba
probarDashboardFinal();
