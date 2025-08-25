const axios = require('axios');

async function limpiarCacheYProbar() {
  console.log('🧹 Limpiando cache del dashboard...');
  
  try {
    // Limpiar cache
    await axios.post('http://localhost:3001/api/dashboard/clear-cache');
    console.log('✅ Cache limpiado exitosamente');
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🔍 Probando años después de limpiar cache:');
    
    const anos = [2025, 2026, 2027];
    
    for (const ano of anos) {
      console.log(`\n📤 Probando año ${ano}:`);
      
      try {
        const response = await axios.get(`http://localhost:3001/api/dashboard/unified/test-metrics?year=${ano}`);
        
        console.log(`📥 Respuesta:`);
        console.log(`   - Parámetro year enviado: ${ano}`);
        console.log(`   - Metadata.year en respuesta: ${response.data.metadata?.year}`);
        console.log(`   - Total planillas: ${response.data.totalPlanillas}`);
        console.log(`   - Total pabellones: ${response.data.totalPabellones}`);
        
        // Verificar si coinciden
        if (response.data.metadata?.year === ano) {
          console.log(`   ✅ COINCIDE: El año en metadata es correcto`);
        } else {
          console.log(`   ❌ NO COINCIDE: Esperado ${ano}, obtenido ${response.data.metadata?.year}`);
        }
        
      } catch (error) {
        console.log(`❌ Error para año ${ano}:`, error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Error limpiando cache:', error.message);
  }
}

limpiarCacheYProbar();
