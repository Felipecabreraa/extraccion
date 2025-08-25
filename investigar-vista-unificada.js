const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function investigarVistaUnificada() {
  console.log('🔍 INVESTIGANDO VISTA UNIFICADA COMPLETA');
  console.log('==========================================\n');

  try {
    // 1. Verificar qué años están disponibles en la vista
    console.log('1. Verificando años disponibles en vw_ordenes_unificada_completa...');
    
    const responseAnos = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`);
    console.log('✅ Respuesta para 2025:', JSON.stringify(responseAnos.data, null, 2));
    
    // 2. Probar con años posteriores
    console.log('\n2. Probando con años posteriores...');
    
    for (let year = 2026; year <= 2030; year++) {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=${year}`);
        console.log(`\n📊 Año ${year}:`);
        console.log('   - Total Planillas:', response.data.totalPlanillas);
        console.log('   - Total Pabellones:', response.data.totalPabellones);
        console.log('   - Total mts2:', response.data.totalMts2);
        console.log('   - Planillas Mes:', response.data.planillasMes);
        console.log('   - Pabellones Mes:', response.data.pabellonesMes);
        console.log('   - mts2 Mes:', response.data.mts2Mes);
        
        if (response.data.totalPlanillas > 0 || response.data.totalMts2 > 0) {
          console.log(`   ⚠️  ¡ATENCIÓN! Año ${year} tiene datos cuando debería ser 0`);
        } else {
          console.log(`   ✅ Año ${year} correctamente muestra 0`);
        }
      } catch (error) {
        console.log(`❌ Error al consultar año ${year}:`, error.message);
      }
    }
    
    // 3. Verificar estructura de la vista directamente
    console.log('\n3. Verificando estructura de datos por año...');
    
    const anosConDatos = [];
    for (let year = 2025; year <= 2030; year++) {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=${year}`);
        if (response.data.totalPlanillas > 0 || response.data.totalMts2 > 0) {
          anosConDatos.push({
            year,
            totalPlanillas: response.data.totalPlanillas,
            totalMts2: response.data.totalMts2,
            planillasMes: response.data.planillasMes,
            mts2Mes: response.data.mts2Mes
          });
        }
      } catch (error) {
        console.log(`❌ Error en año ${year}:`, error.message);
      }
    }
    
    console.log('\n📋 RESUMEN DE AÑOS CON DATOS:');
    console.log('==============================');
    if (anosConDatos.length === 0) {
      console.log('✅ No hay datos para ningún año (correcto)');
    } else {
      anosConDatos.forEach(item => {
        console.log(`   ${item.year}: ${item.totalPlanillas} planillas, ${item.totalMts2} mts2`);
      });
    }
    
    // 4. Verificar si el problema está en el filtro WHERE
    console.log('\n4. Verificando si el filtro WHERE se aplica correctamente...');
    
    // Probar sin filtro de año para ver qué datos hay en total
    try {
      const responseSinFiltro = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics`);
      console.log('\n📊 Datos sin filtro de año:');
      console.log('   - Total Planillas:', responseSinFiltro.data.totalPlanillas);
      console.log('   - Total mts2:', responseSinFiltro.data.totalMts2);
      console.log('   - Planillas Mes:', responseSinFiltro.data.planillasMes);
      console.log('   - mts2 Mes:', responseSinFiltro.data.mts2Mes);
    } catch (error) {
      console.log('❌ Error al consultar sin filtro:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

investigarVistaUnificada();
