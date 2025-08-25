const axios = require('axios');

async function probarDebugAno() {
  const anos = [2025, 2026, 2027];
  
  for (const ano of anos) {
    console.log(`\n🔍 DEBUG - Probando año ${ano}:`);
    console.log(`📤 Enviando request a: /api/dashboard/unified/test-metrics?year=${ano}`);
    
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/unified/test-metrics?year=${ano}`);
      
      console.log(`📥 Respuesta recibida:`);
      console.log(`   - Parámetro year enviado: ${ano}`);
      console.log(`   - Metadata.year en respuesta: ${response.data.metadata?.year}`);
      console.log(`   - Tipo de metadata.year: ${typeof response.data.metadata?.year}`);
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
}

probarDebugAno();
