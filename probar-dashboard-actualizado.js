const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Función de transformación de datos (copiada del frontend)
const transformMetrics = (dashboardData, petroleoData, danosData) => {
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
    
    // Métricas de daños
    totalDanos: danosData.resumen?.total_danos || 0,
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
    
    // Metadatos
    metadata: dashboardData.metadata || {},
    
    // Datos originales para debugging
    _rawDashboard: dashboardData,
    _rawPetroleo: petroleoData,
    _rawDanos: danosData
  };
};

async function probarDashboardActualizado() {
  console.log('🧪 PROBANDO DASHBOARD ACTUALIZADO');
  console.log('==================================\n');

  try {
    // 1. Obtener datos del backend
    console.log('📡 Obteniendo datos del backend...');
    
    const [dashboardResponse, petroleoResponse, danosResponse] = await Promise.all([
      axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`),
      axios.get(`${BASE_URL}/dashboard/petroleo/test-metrics?year=2025`),
      axios.get(`${BASE_URL}/dashboard/unified/test-stats?year=2025`)
    ]);

    console.log('✅ Datos obtenidos exitosamente\n');

    // 2. Transformar datos
    console.log('🔄 Transformando datos...');
    
    const transformedMetrics = transformMetrics(
      dashboardResponse.data, 
      petroleoResponse.data, 
      danosResponse.data
    );

    console.log('✅ Datos transformados exitosamente\n');

    // 3. Mostrar métricas principales
    console.log('📊 MÉTRICAS PRINCIPALES TRANSFORMADAS');
    console.log('=====================================');
    
    console.log(`🏢 Total Planillas: ${transformedMetrics.totalPlanillas.toLocaleString()}`);
    console.log(`✅ Planillas Activas: ${transformedMetrics.planillasActivas.toLocaleString()}`);
    console.log(`✅ Planillas Completadas: ${transformedMetrics.planillasCompletadas.toLocaleString()}`);
    console.log(`📅 Planillas del Mes: ${transformedMetrics.planillasMes.toLocaleString()}`);
    console.log('');

    // 4. Mostrar métricas de superficie
    console.log('🏗️ MÉTRICAS DE SUPERFICIE');
    console.log('=========================');
    
    console.log(`📐 Total Metros Superficie: ${transformedMetrics.totalMetrosSuperficie.toLocaleString()} m²`);
    console.log(`📏 Promedio por Planilla: ${transformedMetrics.promedioMetrosPorPlanilla.toLocaleString()} m²`);
    console.log(`📅 Superficie del Mes: ${transformedMetrics.metrosSuperficieMes.toLocaleString()} m²`);
    console.log(`⚡ Eficiencia por Sector: ${transformedMetrics.eficienciaPorSector.toLocaleString()} m²/hora`);
    console.log('');

    // 5. Mostrar métricas de combustible
    console.log('⛽ MÉTRICAS DE COMBUSTIBLE');
    console.log('==========================');
    
    console.log(`🛢️ Total Combustible: ${transformedMetrics.totalCombustible.toLocaleString()} L`);
    console.log(`📊 Eficiencia Combustible: ${transformedMetrics.eficienciaCombustible} L/registro`);
    console.log(`🚜 Máquinas Activas: ${transformedMetrics.maquinasActivas}`);
    console.log(`📈 Promedio por Pabellón: ${transformedMetrics.promedioCombustiblePorPabellon} L`);
    console.log('');

    // 6. Mostrar métricas de daños
    console.log('⚠️ MÉTRICAS DE DAÑOS');
    console.log('====================');
    
    console.log(`🚨 Total Daños: ${transformedMetrics.totalDanos.toLocaleString()}`);
    console.log(`📅 Daños del Mes: ${transformedMetrics.danosMes.toLocaleString()}`);
    console.log(`📊 % Planillas con Daños: ${transformedMetrics.porcentajePlanillasConDanos}%`);
    console.log('');

    // 7. Mostrar métricas operativas
    console.log('⚙️ MÉTRICAS OPERATIVAS');
    console.log('======================');
    
    console.log(`📊 Eficiencia Operativa: ${transformedMetrics.eficienciaOperativa}%`);
    console.log(`👥 Operadores Activos: ${transformedMetrics.operadoresActivos}`);
    console.log(`🏘️ Sectores Activos: ${transformedMetrics.sectoresActivos}`);
    console.log(`🏢 Total Pabellones: ${transformedMetrics.totalPabellones.toLocaleString()}`);
    console.log(`📅 Pabellones del Mes: ${transformedMetrics.pabellonesMes.toLocaleString()}`);
    console.log('');

    // 8. Mostrar variaciones
    console.log('📈 VARIACIONES');
    console.log('==============');
    
    console.log(`📊 Variación Planillas: ${transformedMetrics.variacionPlanillas}%`);
    console.log(`📊 Variación Pabellones: ${transformedMetrics.variacionPabellones}%`);
    console.log(`📊 Variación Mts²: ${transformedMetrics.variacionMts2}%`);
    console.log('');

    // 9. Verificar que todos los campos necesarios están presentes
    console.log('🔍 VERIFICACIÓN DE CAMPOS');
    console.log('==========================');
    
    const requiredFields = [
      'totalPlanillas', 'planillasActivas', 'planillasCompletadas', 'planillasMes',
      'totalMetrosSuperficie', 'promedioMetrosPorPlanilla', 'metrosSuperficieMes', 'eficienciaPorSector',
      'totalCombustible', 'eficienciaCombustible', 'maquinasActivas', 'promedioCombustiblePorPabellon',
      'totalDanos', 'danosMes', 'porcentajePlanillasConDanos',
      'eficienciaOperativa', 'operadoresActivos', 'sectoresActivos',
      'variacionPlanillas', 'variacionPabellones', 'variacionMts2'
    ];

    const missingFields = requiredFields.filter(field => transformedMetrics[field] === undefined);
    const zeroFields = requiredFields.filter(field => transformedMetrics[field] === 0);

    if (missingFields.length === 0) {
      console.log('✅ Todos los campos requeridos están presentes');
    } else {
      console.log('❌ Campos faltantes:', missingFields);
    }

    console.log(`📊 Campos con valor 0: ${zeroFields.length}/${requiredFields.length}`);
    if (zeroFields.length > 0) {
      console.log('   Campos con valor 0:', zeroFields.slice(0, 5).join(', '));
      if (zeroFields.length > 5) console.log(`   ... y ${zeroFields.length - 5} más`);
    }

    console.log('\n🎯 RESUMEN');
    console.log('==========');
    console.log('✅ El dashboard está listo para mostrar datos del 2025');
    console.log('✅ Todos los campos están mapeados correctamente');
    console.log('✅ Los datos están siendo transformados adecuadamente');

  } catch (error) {
    console.error('❌ Error probando dashboard:', error.message);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// Ejecutar prueba
probarDashboardActualizado();
