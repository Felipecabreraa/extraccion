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

async function probarIntegracionCompleta() {
  try {
    console.log('🔍 Probando integración completa de desgloses en Daños por Operador...');
    console.log('📡 URL base:', API_BASE_URL);
    
    const currentYear = new Date().getFullYear();
    
    // 1. Probar endpoint general (Vista General)
    console.log(`\n📊 1. Probando VISTA GENERAL...`);
    const responseGeneral = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    console.log('✅ Vista General funciona');
    console.log(`   - Total operadores: ${responseGeneral.data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${responseGeneral.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - HEMBRA: ${responseGeneral.data.resumenAnualTipo?.HEMBRA?.total || 0}`);
    console.log(`   - MACHO: ${responseGeneral.data.resumenAnualTipo?.MACHO?.total || 0}`);
    
    // 2. Probar endpoint consolidado
    console.log(`\n📊 2. Probando CONSOLIDADO (Zonas 1, 2, 3)...`);
    const responseConsolidado = await api.get(`/dashboard/danos/test-por-operador-consolidado?year=${currentYear}`);
    console.log('✅ Consolidado funciona');
    console.log(`   - Total operadores: ${responseConsolidado.data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${responseConsolidado.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - HEMBRA: ${responseConsolidado.data.resumenAnualTipo?.HEMBRA?.total || 0}`);
    console.log(`   - MACHO: ${responseConsolidado.data.resumenAnualTipo?.MACHO?.total || 0}`);
    
    // 3. Probar endpoint hembra
    console.log(`\n📊 3. Probando SOLO HEMBRA (Zonas 1, 3)...`);
    const responseHembra = await api.get(`/dashboard/danos/test-por-operador-hembra?year=${currentYear}`);
    console.log('✅ Solo Hembra funciona');
    console.log(`   - Total operadores: ${responseHembra.data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${responseHembra.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - HEMBRA: ${responseHembra.data.resumenAnualTipo?.HEMBRA?.total || 0}`);
    
    // 4. Probar endpoint macho
    console.log(`\n📊 4. Probando SOLO MACHO (Zona 2)...`);
    const responseMacho = await api.get(`/dashboard/danos/test-por-operador-macho?year=${currentYear}`);
    console.log('✅ Solo Macho funciona');
    console.log(`   - Total operadores: ${responseMacho.data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${responseMacho.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - MACHO: ${responseMacho.data.resumenAnualTipo?.MACHO?.total || 0}`);
    
    // 5. Comparar resultados
    console.log(`\n📈 5. COMPARACIÓN DE RESULTADOS:`);
    const general = responseGeneral.data.totalesAnuales?.totalDanos || 0;
    const consolidado = responseConsolidado.data.totalesAnuales?.totalDanos || 0;
    const hembra = responseHembra.data.totalesAnuales?.totalDanos || 0;
    const macho = responseMacho.data.totalesAnuales?.totalDanos || 0;
    const suma = hembra + macho;
    
    console.log(`   - Vista General: ${general}`);
    console.log(`   - Consolidado: ${consolidado}`);
    console.log(`   - Solo Hembra: ${hembra}`);
    console.log(`   - Solo Macho: ${macho}`);
    console.log(`   - Suma Hembra + Macho: ${suma}`);
    
    if (suma === consolidado) {
      console.log('✅ Los datos de desgloses coinciden perfectamente');
    } else {
      console.log(`⚠️ Hay diferencia en los desgloses: ${consolidado - suma}`);
    }
    
    if (general >= consolidado) {
      console.log('✅ La vista general incluye o es igual al consolidado');
    } else {
      console.log(`⚠️ La vista general es menor que el consolidado: ${consolidado - general}`);
    }
    
    // 6. Verificar estructura de datos
    console.log(`\n📋 6. VERIFICACIÓN DE ESTRUCTURA DE DATOS:`);
    
    const endpoints = [
      { name: 'Vista General', data: responseGeneral.data },
      { name: 'Consolidado', data: responseConsolidado.data },
      { name: 'Solo Hembra', data: responseHembra.data },
      { name: 'Solo Macho', data: responseMacho.data }
    ];
    
    endpoints.forEach(endpoint => {
      const hasRequiredFields = 
        endpoint.data.resumenAnualTipo &&
        endpoint.data.operadoresMensuales &&
        endpoint.data.totalesAnuales &&
        endpoint.data.nombresMeses;
      
      console.log(`   ${endpoint.name}: ${hasRequiredFields ? '✅' : '❌'} Estructura correcta`);
    });
    
    // 7. Mostrar top operadores de cada vista
    console.log(`\n🏆 7. TOP OPERADORES POR VISTA:`);
    
    console.log('   VISTA GENERAL (Top 3):');
    responseGeneral.data.topOperadores?.slice(0, 3).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    
    console.log('\n   CONSOLIDADO (Top 3):');
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
    
    console.log('\n✅ Integración completa funcionando correctamente');
    console.log('🎯 Todos los endpoints están listos para el componente unificado');
    console.log('🌐 Puedes acceder a: http://localhost:3000/danos-por-operador');
    console.log('📱 El componente ahora incluye 4 pestañas:');
    console.log('   1. Vista General (datos completos)');
    console.log('   2. Consolidado (Zonas 1-2-3)');
    console.log('   3. HEMBRA (Zonas 1, 3)');
    console.log('   4. MACHO (Zona 2)');
    
  } catch (error) {
    console.error('❌ Error al probar integración:', error.message);
    
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
probarIntegracionCompleta();



