const axios = require('axios');

async function testBarChartData() {
  try {
    console.log('🔍 Probando datos para gráfico de barras...\n');
    
    const params = new URLSearchParams({
      year: 2025,
      origen: 'todos'
    });
    
    const response = await axios.get(`http://localhost:3001/api/dashboard/petroleo/test-metrics?${params}`);
    
    console.log('✅ Datos recibidos del backend');
    
    if (response.data.litrosPorMaquina && response.data.litrosPorMaquina.length > 0) {
      console.log('\n📊 Top 10 máquinas por consumo:');
      const top10 = response.data.litrosPorMaquina.slice(0, 10);
      
      top10.forEach((maquina, index) => {
        console.log(`  ${index + 1}. ${maquina.nroMaquina}: ${maquina.totalLitros.toLocaleString()} L`);
      });
      
      console.log('\n🔧 Datos transformados para gráfico:');
      const transformedData = top10.map(maquina => ({
        name: maquina.nroMaquina,
        value: maquina.totalLitros
      }));
      
      transformedData.forEach((item, index) => {
        console.log(`  ${index + 1}. name: "${item.name}", value: ${item.value.toLocaleString()}`);
      });
      
      console.log('\n✅ Los datos están listos para el gráfico de barras');
      
    } else {
      console.log('❌ No hay datos de litrosPorMaquina');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBarChartData(); 