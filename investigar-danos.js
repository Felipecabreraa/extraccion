const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function investigarDanos() {
  console.log('🔍 INVESTIGACIÓN DE DAÑOS REGISTRADOS');
  console.log('=====================================\n');

  try {
    // 1. Verificar datos de daños desde diferentes endpoints
    console.log('📡 1. VERIFICANDO DIFERENTES ENDPOINTS DE DAÑOS');
    console.log('================================================');
    
    const endpoints = [
      { name: 'Dashboard Metrics', url: '/dashboard/unified/test-metrics?year=2025' },
      { name: 'Dashboard Stats', url: '/dashboard/unified/test-stats?year=2025' },
      { name: 'Daños Históricos', url: '/dashboard/danos/test-historicos?year=2025' },
      { name: 'Daños Combinadas', url: '/dashboard/danos/test-combinadas?year=2025' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Probando: ${endpoint.name}`);
        const response = await axios.get(`${BASE_URL}${endpoint.url}`);
        const data = response.data;
        
        // Buscar campos relacionados con daños
        const danosFields = {};
        
        // Buscar en diferentes estructuras de datos
        if (data.danosMes !== undefined) danosFields.danosMes = data.danosMes;
        if (data.totalDanos !== undefined) danosFields.totalDanos = data.totalDanos;
        if (data.danosPorTipo !== undefined) danosFields.danosPorTipo = data.danosPorTipo;
        
        // Buscar en resumen si existe
        if (data.resumen && data.resumen.total_danos !== undefined) {
          danosFields.total_danos_resumen = data.resumen.total_danos;
        }
        
        // Buscar en charts si existe
        if (data.charts && data.charts.danosPorTipo !== undefined) {
          danosFields.danosPorTipo_charts = data.charts.danosPorTipo;
        }
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Campos de daños encontrados:`, danosFields);
        
        if (Object.keys(danosFields).length === 0) {
          console.log(`   ⚠️ No se encontraron campos específicos de daños`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.status || error.message}`);
      }
    }

    // 2. Verificar datos específicos de daños
    console.log('\n📊 2. ANÁLISIS DETALLADO DE DATOS DE DAÑOS');
    console.log('============================================');
    
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`);
    const dashboardData = dashboardResponse.data;
    
    console.log('📋 Datos del dashboard:');
    console.log(`   • danosMes: ${dashboardData.danosMes || 'N/A'}`);
    console.log(`   • totalDanos: ${dashboardData.totalDanos || 'N/A'}`);
    console.log(`   • danosPorTipo: ${JSON.stringify(dashboardData.danosPorTipo || 'N/A')}`);
    
    // 3. Verificar datos de daños históricos
    console.log('\n📈 3. VERIFICANDO DAÑOS HISTÓRICOS');
    console.log('===================================');
    
    try {
      const danosHistoricosResponse = await axios.get(`${BASE_URL}/dashboard/danos/test-historicos?year=2025`);
      const danosHistoricos = danosHistoricosResponse.data;
      
      console.log('📊 Datos de daños históricos:');
      console.log(`   • Total daños: ${danosHistoricos.totalDanos || 'N/A'}`);
      console.log(`   • Daños por tipo: ${JSON.stringify(danosHistoricos.danosPorTipo || 'N/A')}`);
      console.log(`   • Daños del mes: ${danosHistoricos.danosMes || 'N/A'}`);
      
    } catch (error) {
      console.log(`   ❌ Error obteniendo daños históricos: ${error.message}`);
    }

    // 4. Verificar datos de daños combinadas
    console.log('\n🔄 4. VERIFICANDO DAÑOS COMBINADAS');
    console.log('==================================');
    
    try {
      const danosCombinadasResponse = await axios.get(`${BASE_URL}/dashboard/danos/test-combinadas?year=2025`);
      const danosCombinadas = danosCombinadasResponse.data;
      
      console.log('📊 Datos de daños combinadas:');
      console.log(`   • Total daños: ${danosCombinadas.totalDanos || 'N/A'}`);
      console.log(`   • Daños por tipo: ${JSON.stringify(danosCombinadas.danosPorTipo || 'N/A')}`);
      console.log(`   • Daños del mes: ${danosCombinadas.danosMes || 'N/A'}`);
      
    } catch (error) {
      console.log(`   ❌ Error obteniendo daños combinadas: ${error.message}`);
    }

    // 5. Verificar la vista unificada directamente
    console.log('\n🔍 5. VERIFICANDO VISTA UNIFICADA');
    console.log('==================================');
    
    try {
      // Verificar si hay datos de daños en la vista unificada
      const vistaResponse = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`);
      const vistaData = vistaResponse.data;
      
      console.log('📊 Datos de la vista unificada:');
      console.log(`   • Total planillas: ${vistaData.totalPlanillas || 'N/A'}`);
      console.log(`   • Total pabellones: ${vistaData.totalPabellones || 'N/A'}`);
      console.log(`   • Daños del mes: ${vistaData.danosMes || 'N/A'}`);
      
      // Verificar si hay datos de daños en los metadatos
      if (vistaData.metadata) {
        console.log(`   • Origen: ${vistaData.metadata.origen || 'N/A'}`);
        console.log(`   • Fuente: ${vistaData.metadata.fuente || 'N/A'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error verificando vista unificada: ${error.message}`);
    }

    // 6. Resumen y diagnóstico
    console.log('\n📋 6. RESUMEN Y DIAGNÓSTICO');
    console.log('============================');
    
    const problemas = [];
    
    if (dashboardData.danosMes === 0 || dashboardData.danosMes === undefined) {
      problemas.push('❌ danosMes es 0 o undefined en dashboard metrics');
    }
    
    if (dashboardData.totalDanos === 0 || dashboardData.totalDanos === undefined) {
      problemas.push('❌ totalDanos es 0 o undefined en dashboard metrics');
    }
    
    if (!dashboardData.danosPorTipo || dashboardData.danosPorTipo.length === 0) {
      problemas.push('❌ danosPorTipo está vacío o undefined');
    }
    
    if (problemas.length === 0) {
      console.log('✅ Los datos de daños parecen estar correctos');
    } else {
      console.log('⚠️ Problemas detectados:');
      problemas.forEach(problema => console.log(`   ${problema}`));
    }
    
    console.log('\n🎯 POSIBLES CAUSAS:');
    console.log('1. La vista unificada no incluye datos de daños');
    console.log('2. Los datos de daños están en una tabla separada');
    console.log('3. El endpoint de daños no está funcionando correctamente');
    console.log('4. Los datos de daños están filtrados incorrectamente');

  } catch (error) {
    console.error('❌ Error investigando daños:', error.message);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// Ejecutar investigación
investigarDanos();
