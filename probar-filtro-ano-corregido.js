const axios = require('axios');

// Configurar axios para el entorno de desarrollo
axios.defaults.baseURL = 'http://localhost:3001';

async function probarFiltroAno() {
  console.log('🧪 Probando filtro por año corregido...\n');

  const anos = [2025, 2026, 2027];
  
  for (const ano of anos) {
    console.log(`📊 Probando año ${ano}:`);
    
    try {
      // Probar endpoint de métricas del dashboard
      const response = await axios.get(`/api/dashboard/unified/test-metrics?year=${ano}`);
      
      const data = response.data;
      console.log(`   ✅ Métricas obtenidas para ${ano}:`);
      console.log(`      - Total planillas: ${data.totalPlanillas}`);
      console.log(`      - Total pabellones: ${data.totalPabellones}`);
      console.log(`      - Planillas del mes: ${data.planillasMes}`);
      console.log(`      - Año en metadata: ${data.metadata?.year}`);
      
      // Verificar que el año en la respuesta coincide con el solicitado
      if (data.metadata?.year === ano) {
        console.log(`   ✅ Año correcto en metadata: ${data.metadata.year}`);
      } else {
        console.log(`   ❌ Año incorrecto en metadata: esperado ${ano}, obtenido ${data.metadata?.year}`);
      }
      
      // Verificar que para años futuros no hay datos (excepto 2025)
      if (ano > 2025 && data.totalPlanillas === 0) {
        console.log(`   ✅ Correcto: No hay datos para año futuro ${ano}`);
      } else if (ano === 2025 && data.totalPlanillas > 0) {
        console.log(`   ✅ Correcto: Hay datos para año actual ${ano}`);
      } else if (ano > 2025 && data.totalPlanillas > 0) {
        console.log(`   ❌ Error: Hay datos para año futuro ${ano} cuando no debería`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error obteniendo datos para ${ano}:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('🎯 Prueba completada. Verificar que:');
  console.log('   - Año 2025: Debe mostrar datos reales');
  console.log('   - Años 2026, 2027: Deben mostrar 0 datos (no datos del 2025)');
}

// Ejecutar la prueba
probarFiltroAno().catch(console.error);
