const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarDanosConNull() {
  try {
    console.log('🔍 VERIFICANDO SI LOS 608 DAÑOS INCLUYEN REGISTROS CON cantidad_dano = NULL\n');

    // 1. Analizar los resultados de las consultas
    console.log('1. ANÁLISIS DE LOS RESULTADOS:');
    console.log('   📊 Consulta 1 (fecha_inicio = NULL): 0 registros');
    console.log('   📊 Consulta 2 (cantidad_dano = 0): 0 registros');
    console.log('   📊 Consulta 3 (cantidad_dano = NULL): 11,073 registros');
    console.log('   📊 Consulta 4 (total original): 455 registros - 584 daños');
    console.log('   📊 Consulta 5 (total vista): 455 registros - 584 daños');

    // 2. Verificar si los 608 daños incluyen registros con NULL
    console.log('\n2. VERIFICANDO SI LOS 608 DAÑOS INCLUYEN REGISTROS CON NULL:');
    console.log('   📋 Consulta adicional necesaria:');
    console.log('   SELECT COUNT(*) as total, SUM(COALESCE(cantidad_dano, 0)) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL');
    
    console.log('\n   📋 O esta consulta más específica:');
    console.log('   SELECT');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(CASE WHEN cantidad_dano IS NOT NULL THEN cantidad_dano ELSE 0 END) as danos_no_null,');
    console.log('     SUM(CASE WHEN cantidad_dano IS NULL THEN 1 ELSE 0 END) as registros_con_null,');
    console.log('     SUM(COALESCE(cantidad_dano, 0)) as total_danos_con_coalesce');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL');

    // 3. Hipótesis sobre los 608 daños
    console.log('\n3. HIPÓTESIS SOBRE LOS 608 DAÑOS:');
    console.log('   💡 Posibilidad 1: Los 608 incluyen registros con cantidad_dano = NULL');
    console.log('      - Si usamos COALESCE(cantidad_dano, 0), los NULL se convierten a 0');
    console.log('      - Esto explicaría por qué la vista muestra 584 (solo registros con daños > 0)');
    
    console.log('\n   💡 Posibilidad 2: Los 608 son solo registros con cantidad_dano > 0');
    console.log('      - Pero hay una discrepancia en el conteo');
    console.log('      - 608 vs 584 = 24 daños faltantes');
    
    console.log('\n   💡 Posibilidad 3: Los 608 incluyen algún otro tipo de registro');
    console.log('      - Quizás registros con fecha_inicio = NULL');
    console.log('      - O registros de otra tabla relacionada');

    // 4. Verificar la vista unificada actual
    console.log('\n4. VERIFICANDO LA VISTA UNIFICADA ACTUAL:');
    try {
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
        const totalVistaUnificada = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
        console.log(`   📊 Total en vista unificada: ${totalVistaUnificada} daños`);
        console.log(`   📊 Total esperado: 608 daños`);
        console.log(`   📊 Diferencia: ${608 - totalVistaUnificada} daños`);
        
        console.log('\n   📋 Desglose por tipos:');
        danosTestData.danosPorTipo.forEach((tipo, index) => {
          console.log(`      ${index + 1}. ${tipo.tipo}: ${tipo.total_danos} daños (${tipo.cantidad} registros)`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error verificando vista: ${error.response?.status || error.message}`);
    }

    // 5. Recomendación específica
    console.log('\n5. RECOMENDACIÓN ESPECÍFICA:');
    console.log('   🎯 Ejecutar esta consulta SQL para confirmar:');
    console.log('   SELECT');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(CASE WHEN cantidad_dano IS NOT NULL THEN cantidad_dano ELSE 0 END) as danos_no_null,');
    console.log('     SUM(CASE WHEN cantidad_dano IS NULL THEN 1 ELSE 0 END) as registros_con_null,');
    console.log('     SUM(COALESCE(cantidad_dano, 0)) as total_danos_con_coalesce');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL;');

    // 6. Próximos pasos
    console.log('\n6. PRÓXIMOS PASOS:');
    console.log('   📋 1. Ejecutar la consulta SQL anterior');
    console.log('   📋 2. Verificar si total_danos_con_coalesce = 608');
    console.log('   📋 3. Si es así, el problema está en que la vista excluye registros con NULL');
    console.log('   📋 4. Si no es así, buscar en otras tablas o fuentes de datos');

    console.log('\n✅ ANÁLISIS COMPLETO: Ejecuta la consulta SQL para confirmar');

  } catch (error) {
    console.error('❌ Error al verificar daños con NULL:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarDanosConNull();





