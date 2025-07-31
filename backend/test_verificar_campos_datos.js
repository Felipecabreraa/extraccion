const axios = require('axios');

async function verificarCamposDatos() {
  try {
    console.log('🔍 Verificando campos de datos de daños...');
    
    const response = await axios.get('http://localhost:3001/api/danos/stats/test?year=2025');
    
    console.log('✅ Datos recibidos del backend:');
    console.log('📊 Estructura completa:', JSON.stringify(response.data, null, 2));
    
    console.log('\n📋 Análisis de campos:');
    
    // Verificar resumen
    if (response.data.resumen) {
      console.log('✅ Resumen:', Object.keys(response.data.resumen));
    }
    
    // Verificar danosPorTipo
    if (response.data.danosPorTipo && response.data.danosPorTipo.length > 0) {
      console.log('✅ DanosPorTipo campos:', Object.keys(response.data.danosPorTipo[0]));
      console.log('📊 Ejemplo danosPorTipo:', response.data.danosPorTipo[0]);
    }
    
    // Verificar danosPorSector
    if (response.data.danosPorSector && response.data.danosPorSector.length > 0) {
      console.log('✅ DanosPorSector campos:', Object.keys(response.data.danosPorSector[0]));
      console.log('📊 Ejemplo danosPorSector:', response.data.danosPorSector[0]);
    }
    
    // Verificar danosPorSupervisor
    if (response.data.danosPorSupervisor && response.data.danosPorSupervisor.length > 0) {
      console.log('✅ DanosPorSupervisor campos:', Object.keys(response.data.danosPorSupervisor[0]));
      console.log('📊 Ejemplo danosPorSupervisor:', response.data.danosPorSupervisor[0]);
    }
    
    // Verificar evolucion
    if (response.data.evolucion && response.data.evolucion.length > 0) {
      console.log('✅ Evolucion campos:', Object.keys(response.data.evolucion[0]));
      console.log('📊 Ejemplo evolucion:', response.data.evolucion[0]);
    }
    
    console.log('\n🎯 Campos esperados por el frontend:');
    console.log('   porTipo: [{ tipo, cantidad, total_danos }]');
    console.log('   porZona: [{ zona, cantidad, total }]');
    console.log('   porSupervisor: [{ supervisor, cantidad, total }]');
    console.log('   porMes: [{ nombreMes, cantidad, total }]');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarCamposDatos(); 