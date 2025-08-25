const axios = require('axios');
const BASE_URL = 'http://localhost:3001/api';

async function probarFiltroAno() {
  console.log('🔍 Probando filtro por año corregido...\n');
  
  const years = [2025, 2026, 2027, 2028];
  
  for (const year of years) {
    console.log(`📊 Probando año ${year}:`);
    
    try {
      // Probar Dashboard Metrics con timeout más largo
      const response = await axios.get(`${BASE_URL}/dashboard/unified/test-metrics?year=${year}`, { 
        timeout: 20000 
      });
      
      const data = response.data;
      console.log(`   ✅ Dashboard Metrics (${year}):`);
      console.log(`      - Total Planillas: ${data.totalPlanillas || 0}`);
      console.log(`      - Total Mts2: ${data.totalMts2 || 0}`);
      console.log(`      - Superficie Limpiada: ${data.superficieLimpiada || 0}`);
      console.log(`      - Eficiencia Operativa: ${data.eficienciaOperativa || 0}%`);
      console.log(`      - Daños Registrados: ${data.danosMes || 0}`);
      console.log(`      - Planillas Activas: ${data.planillasActivas || 0}`);
      console.log(`      - Planillas Completadas: ${data.planillasCompletadas || 0}`);
      
      // Verificar si debería ser 0
      if (year > 2025) {
        const shouldBeZero = [
          data.totalPlanillas,
          data.totalMts2, 
          data.superficieLimpiada,
          data.danosMes,
          data.planillasActivas,
          data.planillasCompletadas
        ];
        
        const hasNonZero = shouldBeZero.some(val => val > 0);
        if (hasNonZero) {
          console.log(`      ⚠️  PROBLEMA: Debería ser 0 para ${year} pero tiene datos`);
          console.log(`      🔍 Valores no cero:`, shouldBeZero.filter(val => val > 0));
        } else {
          console.log(`      ✅ CORRECTO: Todos los valores son 0 para ${year}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error en Dashboard Metrics (${year}):`, error.response?.status, error.message);
      if (error.response?.data?.error) {
        console.log(`   🔍 Error detallado:`, error.response.data.error);
      }
    }
    
    console.log('');
  }
  
  console.log('✅ Prueba completada');
}

probarFiltroAno().catch(console.error);
