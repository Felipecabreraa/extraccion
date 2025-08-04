const axios = require('axios');

async function limpiarCache() {
  try {
    console.log('🧹 Limpiando cache del dashboard...');
    
    // Hacer una petición para forzar la recarga
    const response = await axios.get('http://localhost:3001/api/dashboard/frontend-metrics?year=2025&origen=todos&nocache=true');
    
    console.log('✅ Cache limpiado');
    console.log('📊 Tendencias mensuales:', response.data.charts.tendenciasMensuales.length);
    console.log('📈 Datos de tendencias:', JSON.stringify(response.data.charts.tendenciasMensuales, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

limpiarCache(); 