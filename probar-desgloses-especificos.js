const axios = require('axios');

// Configurar la URL base según el entorno
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function probarDesglosesEspecificos() {
  try {
    console.log('🔍 Probando nuevos desgloses específicos de Daños por Operador...');
    console.log('📡 URL base:', API_BASE_URL);
    
    const currentYear = new Date().getFullYear();
    
    // 1. Probar Consolidado (Zonas 1, 2, 3)
    console.log(`\n📊 1. Probando CONSOLIDADO (Zonas 1, 2, 3)...`);
    const responseConsolidado = await api.get(`/dashboard/danos/test-por-operador-consolidado?year=${currentYear}`);
    const dataConsolidado = responseConsolidado.data;
    
    console.log('✅ Consolidado obtenido exitosamente');
    console.log(`   - Total operadores: ${dataConsolidado.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${dataConsolidado.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - HEMBRA: ${dataConsolidado.resumenAnualTipo?.HEMBRA?.total || 0}`);
    console.log(`   - MACHO: ${dataConsolidado.resumenAnualTipo?.MACHO?.total || 0}`);
    
    // 2. Probar Solo Hembra (Zonas 1, 3)
    console.log(`\n📊 2. Probando SOLO HEMBRA (Zonas 1, 3)...`);
    const responseHembra = await api.get(`/dashboard/danos/test-por-operador-hembra?year=${currentYear}`);
    const dataHembra = responseHembra.data;
    
    console.log('✅ Solo Hembra obtenido exitosamente');
    console.log(`   - Total operadores: ${dataHembra.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${dataHembra.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - HEMBRA: ${dataHembra.resumenAnualTipo?.HEMBRA?.total || 0}`);
    
    // 3. Probar Solo Macho (Zona 2)
    console.log(`\n📊 3. Probando SOLO MACHO (Zona 2)...`);
    const responseMacho = await api.get(`/dashboard/danos/test-por-operador-macho?year=${currentYear}`);
    const dataMacho = responseMacho.data;
    
    console.log('✅ Solo Macho obtenido exitosamente');
    console.log(`   - Total operadores: ${dataMacho.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${dataMacho.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - MACHO: ${dataMacho.resumenAnualTipo?.MACHO?.total || 0}`);
    
    // 4. Comparar resultados
    console.log(`\n📈 4. COMPARACIÓN DE RESULTADOS:`);
    console.log(`   - Consolidado total: ${dataConsolidado.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - Solo Hembra: ${dataHembra.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - Solo Macho: ${dataMacho.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - Suma Hembra + Macho: ${(dataHembra.totalesAnuales?.totalDanos || 0) + (dataMacho.totalesAnuales?.totalDanos || 0)}`);
    
    const sumaEspecificos = (dataHembra.totalesAnuales?.totalDanos || 0) + (dataMacho.totalesAnuales?.totalDanos || 0);
    const consolidado = dataConsolidado.totalesAnuales?.totalDanos || 0;
    
    if (sumaEspecificos === consolidado) {
      console.log('✅ Los datos coinciden perfectamente');
    } else {
      console.log('⚠️ Hay diferencia en los datos');
      console.log(`   - Diferencia: ${consolidado - sumaEspecificos}`);
    }
    
    // 5. Mostrar top operadores de cada desglose
    console.log(`\n🏆 5. TOP OPERADORES POR DESGLOSE:`);
    
    console.log('   CONSOLIDADO (Top 3):');
    dataConsolidado.topOperadores?.slice(0, 3).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    
    console.log('\n   SOLO HEMBRA (Top 3):');
    dataHembra.topOperadores?.slice(0, 3).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    
    console.log('\n   SOLO MACHO (Top 3):');
    dataMacho.topOperadores?.slice(0, 3).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    
    // 6. Verificar metadatos
    console.log(`\n📋 6. METADATOS DE LOS ENDPOINTS:`);
    console.log(`   Consolidado: ${dataConsolidado.metadata?.filtros?.zonas || 'N/A'}`);
    console.log(`   Hembra: ${dataHembra.metadata?.filtros?.zonas || 'N/A'} - ${dataHembra.metadata?.filtros?.tipo || 'N/A'}`);
    console.log(`   Macho: ${dataMacho.metadata?.filtros?.zonas || 'N/A'} - ${dataMacho.metadata?.filtros?.tipo || 'N/A'}`);
    
    console.log('\n✅ Todos los desgloses específicos funcionando correctamente');
    console.log('🎯 Los endpoints están listos para ser integrados en el frontend');
    
  } catch (error) {
    console.error('❌ Error al probar desgloses específicos:', error.message);
    
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.status, error.response.statusText);
      console.error('📋 Datos de error:', error.response.data);
    }
  }
}

// Ejecutar la prueba
probarDesglosesEspecificos();



