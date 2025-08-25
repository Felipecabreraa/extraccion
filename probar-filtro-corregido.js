const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function probarFiltroCorregido() {
  console.log('🧪 PROBANDO FILTRO DE AÑO CORREGIDO');
  console.log('=====================================\n');

  try {
    // 1. Probar con años que no deberían tener datos
    console.log('1. Probando con años que no deberían tener datos...');
    
    const anosSinDatos = [1999, 2026, 2027, 2028, 2029, 2030];
    
    for (const year of anosSinDatos) {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=${year}`);
        console.log(`\n📊 Año ${year}:`);
        console.log('   - Total Planillas:', response.data.totalPlanillas);
        console.log('   - Total mts2:', response.data.totalMts2);
        console.log('   - Planillas Mes:', response.data.planillasMes);
        console.log('   - mts2 Mes:', response.data.mts2Mes);
        
        if (response.data.totalPlanillas > 0 || response.data.totalMts2 > 0) {
          console.log(`   ❌ ¡PROBLEMA! Año ${year} aún tiene datos cuando debería ser 0`);
        } else {
          console.log(`   ✅ Año ${year} correctamente muestra 0`);
        }
      } catch (error) {
        console.log(`❌ Error al consultar año ${year}:`, error.message);
      }
    }
    
    // 2. Probar con año 2025 (debería tener datos)
    console.log('\n2. Probando con año 2025 (debería tener datos)...');
    
    try {
      const response2025 = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=2025`);
      console.log('\n📊 Año 2025:');
      console.log('   - Total Planillas:', response2025.data.totalPlanillas);
      console.log('   - Total mts2:', response2025.data.totalMts2);
      console.log('   - Planillas Mes:', response2025.data.planillasMes);
      console.log('   - mts2 Mes:', response2025.data.mts2Mes);
      
      if (response2025.data.totalPlanillas > 0) {
        console.log('   ✅ Año 2025 correctamente muestra datos');
      } else {
        console.log('   ❌ Año 2025 no muestra datos cuando debería');
      }
    } catch (error) {
      console.log('❌ Error al consultar año 2025:', error.message);
    }
    
    // 3. Probar otros endpoints
    console.log('\n3. Probando otros endpoints...');
    
    const endpoints = [
      '/dashboard/unified/test-stats',
      '/dashboard/petroleo/test-metrics'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔗 Probando ${endpoint}:`);
      
      // Probar con año 2026 (debería ser 0)
      try {
        const response2026 = await axios.get(`${BASE_URL}${endpoint}?year=2026`);
        const hasData = response2026.data.totalPlanillas > 0 || response2026.data.totalMts2 > 0 || 
                       response2026.data.kpis?.totalLitrosConsumidos > 0;
        
        if (hasData) {
          console.log(`   ❌ ${endpoint} - Año 2026 tiene datos cuando debería ser 0`);
        } else {
          console.log(`   ✅ ${endpoint} - Año 2026 correctamente muestra 0`);
        }
      } catch (error) {
        console.log(`   ❌ Error en ${endpoint}:`, error.message);
      }
    }
    
    console.log('\n🎯 RESUMEN:');
    console.log('===========');
    console.log('Si todos los años posteriores al 2025 muestran 0, el filtro está funcionando correctamente.');
    console.log('Si algún año posterior al 2025 aún muestra datos, hay que revisar más consultas.');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

probarFiltroCorregido();
