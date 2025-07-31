const axios = require('axios');

async function testKPIRendimiento() {
  try {
    console.log('🔍 Verificando KPI de Rendimiento Global...');
    
    const response = await axios.get('http://localhost:3001/api/dashboard/petroleo/test-metrics?year=2025&month=todos&origen=todos');
    
    console.log('\n📊 KPIs DISPONIBLES:');
    console.log('=====================');
    console.log(`promedioLitroKm: ${response.data.kpis.promedioLitroKm}`);
    console.log(`rendimientoGlobalLitroKm: ${response.data.kpis.rendimientoGlobalLitroKm}`);
    console.log(`totalKmRecorridos: ${response.data.kpis.totalKmRecorridos}`);
    console.log(`totalLitrosConsumidos: ${response.data.kpis.totalLitrosConsumidos}`);
    
    // Calcular manualmente
    const totalLitros = parseFloat(response.data.kpis.totalLitrosConsumidos);
    const totalKm = parseFloat(response.data.kpis.totalKmRecorridos);
    const calculoManual = totalKm > 0 ? (totalLitros / totalKm).toFixed(4) : 0;
    
    console.log(`\n🔍 Cálculo Manual:`);
    console.log(`   Total litros: ${totalLitros} L`);
    console.log(`   Total km: ${totalKm} km`);
    console.log(`   L/km calculado: ${calculoManual} L/km`);
    console.log(`   Coincide con promedioLitroKm: ${calculoManual === response.data.kpis.promedioLitroKm?.toString() ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

testKPIRendimiento(); 