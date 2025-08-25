const axios = require('axios');

// Configurar la URL base según el entorno
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function probarEndpointsFinal() {
  try {
    console.log('🔍 Probando endpoints finales de desgloses específicos...');
    console.log('📡 URL base:', API_BASE_URL);
    
    const currentYear = new Date().getFullYear();
    
    // 1. Probar endpoint original (que sabemos que funciona)
    console.log(`\n📊 1. Probando endpoint original...`);
    const responseOriginal = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    console.log('✅ Endpoint original funciona');
    console.log(`   - Total daños: ${responseOriginal.data.totalesAnuales?.totalDanos || 0}`);
    
    // 2. Probar endpoint consolidado
    console.log(`\n📊 2. Probando CONSOLIDADO (Zonas 1, 2, 3)...`);
    const responseConsolidado = await api.get(`/dashboard/danos/test-por-operador-consolidado?year=${currentYear}`);
    console.log('✅ Endpoint consolidado funciona');
    console.log(`   - Total operadores: ${responseConsolidado.data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${responseConsolidado.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - HEMBRA: ${responseConsolidado.data.resumenAnualTipo?.HEMBRA?.total || 0}`);
    console.log(`   - MACHO: ${responseConsolidado.data.resumenAnualTipo?.MACHO?.total || 0}`);
    
    // 3. Probar endpoint hembra
    console.log(`\n📊 3. Probando SOLO HEMBRA (Zonas 1, 3)...`);
    const responseHembra = await api.get(`/dashboard/danos/test-por-operador-hembra?year=${currentYear}`);
    console.log('✅ Endpoint hembra funciona');
    console.log(`   - Total operadores: ${responseHembra.data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${responseHembra.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - HEMBRA: ${responseHembra.data.resumenAnualTipo?.HEMBRA?.total || 0}`);
    
    // 4. Probar endpoint macho
    console.log(`\n📊 4. Probando SOLO MACHO (Zona 2)...`);
    const responseMacho = await api.get(`/dashboard/danos/test-por-operador-macho?year=${currentYear}`);
    console.log('✅ Endpoint macho funciona');
    console.log(`   - Total operadores: ${responseMacho.data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${responseMacho.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - MACHO: ${responseMacho.data.resumenAnualTipo?.MACHO?.total || 0}`);
    
    // 5. Comparar resultados
    console.log(`\n📈 5. COMPARACIÓN DE RESULTADOS:`);
    const consolidado = responseConsolidado.data.totalesAnuales?.totalDanos || 0;
    const hembra = responseHembra.data.totalesAnuales?.totalDanos || 0;
    const macho = responseMacho.data.totalesAnuales?.totalDanos || 0;
    const suma = hembra + macho;
    
    console.log(`   - Consolidado total: ${consolidado}`);
    console.log(`   - Solo Hembra: ${hembra}`);
    console.log(`   - Solo Macho: ${macho}`);
    console.log(`   - Suma Hembra + Macho: ${suma}`);
    
    if (suma === consolidado) {
      console.log('✅ Los datos coinciden perfectamente');
    } else {
      console.log(`⚠️ Hay diferencia en los datos: ${consolidado - suma}`);
    }
    
    // 6. Mostrar top operadores de cada desglose
    console.log(`\n🏆 6. TOP OPERADORES POR DESGLOSE:`);
    
    console.log('   CONSOLIDADO (Top 3):');
    responseConsolidado.data.topOperadores?.slice(0, 3).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    
    console.log('\n   SOLO HEMBRA (Top 3):');
    responseHembra.data.topOperadores?.slice(0, 3).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    
    console.log('\n   SOLO MACHO (Top 3):');
    responseMacho.data.topOperadores?.slice(0, 3).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    
    // 7. Verificar metadatos
    console.log(`\n📋 7. METADATOS DE LOS ENDPOINTS:`);
    console.log(`   Consolidado: ${responseConsolidado.data.metadata?.filtros?.zonas || 'N/A'}`);
    console.log(`   Hembra: ${responseHembra.data.metadata?.filtros?.zonas || 'N/A'} - ${responseHembra.data.metadata?.filtros?.tipo || 'N/A'}`);
    console.log(`   Macho: ${responseMacho.data.metadata?.filtros?.zonas || 'N/A'} - ${responseMacho.data.metadata?.filtros?.tipo || 'N/A'}`);
    
    console.log('\n✅ Todos los endpoints funcionando correctamente');
    console.log('🎯 Los desgloses están listos para ser visualizados en el frontend');
    console.log('🌐 Puedes acceder a: http://localhost:3000/danos-por-operador-desgloses');
    
  } catch (error) {
    console.error('❌ Error al probar endpoints:', error.message);
    
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ No se puede conectar al servidor. Verifica que esté ejecutándose en el puerto 3001');
      console.log('💡 Ejecuta: node reiniciar-servidor.js');
    }
  }
}

// Ejecutar la prueba
probarEndpointsFinal();



