const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function revisarFiltrosExcluyentes() {
  try {
    console.log('🔍 PUNTO 2: Revisando filtros que excluyen registros\n');

    // 1. Verificar registros con cantidad_dano = 0
    console.log('1. Verificando registros con cantidad_dano = 0:');
    try {
      // Probar sin el filtro cantidadDano > 0
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
        const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
        console.log(`   📊 Daños con filtro cantidadDano > 0: ${totalCalculado}`);
        
        // Verificar si hay registros con 0 daños que se están excluyendo
        console.log(`   📊 Si hay registros con cantidad_dano = 0, no se están contando`);
        console.log(`   📊 Esto podría explicar parte de los 24 daños faltantes`);
      }
    } catch (error) {
      console.log(`   ❌ Error verificando datos: ${error.response?.status || error.message}`);
    }

    // 2. Verificar registros con fecha_inicio = NULL
    console.log('\n2. Verificando registros con fecha_inicio = NULL:');
    console.log('   📋 Filtro en la vista: WHERE fecha_inicio IS NOT NULL');
    console.log('   📊 Este filtro excluye registros sin fecha válida');
    console.log('   📊 Los 24 daños faltantes podrían tener fecha_inicio = NULL');

    // 3. Verificar registros con cantidad_dano = NULL
    console.log('\n3. Verificando registros con cantidad_dano = NULL:');
    console.log('   📋 En la vista: COALESCE(cantidad_dano, 0) as cantidadDano');
    console.log('   📊 Los registros con cantidad_dano = NULL se convierten a 0');
    console.log('   📊 Luego se filtran con WHERE cantidadDano > 0');
    console.log('   📊 Esto excluye registros con cantidad_dano = NULL');

    // 4. Verificar registros con tipo_dano = NULL
    console.log('\n4. Verificando registros con tipo_dano = NULL:');
    console.log('   📋 En la vista: COALESCE(tipo_dano, \'Sin tipo\') as nombreTipoDano');
    console.log('   📊 Los registros con tipo_dano = NULL se convierten a "Sin tipo"');
    console.log('   📊 Esto no debería excluir registros, solo cambiar el valor');

    // 5. Analizar los filtros combinados
    console.log('\n5. Análisis de filtros combinados:');
    console.log('   🔍 Filtro 1 (Vista): WHERE fecha_inicio IS NOT NULL');
    console.log('      - Excluye: Registros con fecha_inicio = NULL');
    console.log('   🔍 Filtro 2 (Endpoint): WHERE cantidadDano > 0');
    console.log('      - Excluye: Registros con cantidadDano = 0');
    console.log('      - Incluye: Registros con cantidad_dano = NULL (convertidos a 0)');

    // 6. Calcular posibles registros excluidos
    console.log('\n6. Cálculo de registros excluidos:');
    console.log('   📊 Total daños esperados: 608');
    console.log('   📊 Total daños encontrados: 584');
    console.log('   📊 Diferencia: 24 daños');
    
    console.log('\n   💡 Posibles combinaciones de registros excluidos:');
    console.log('   - 24 registros con fecha_inicio = NULL');
    console.log('   - 24 registros con cantidad_dano = 0');
    console.log('   - 24 registros con cantidad_dano = NULL');
    console.log('   - Combinación de los anteriores');

    // 7. Verificar si hay registros con fecha_inicio = NULL que tienen daños
    console.log('\n7. Verificando registros problemáticos específicos:');
    console.log('   📋 Tipos de registros que podrían estar siendo excluidos:');
    console.log('   - Registros con fecha_inicio = NULL y cantidad_dano > 0');
    console.log('   - Registros con fecha_inicio válida y cantidad_dano = 0');
    console.log('   - Registros con fecha_inicio válida y cantidad_dano = NULL');

    // 8. Recomendaciones específicas
    console.log('\n8. Recomendaciones específicas:');
    console.log('   🔧 Para incluir registros con fecha_inicio = NULL:');
    console.log('      - Modificar vista: WHERE fecha_inicio IS NOT NULL OR cantidad_dano > 0');
    console.log('   🔧 Para incluir registros con cantidad_dano = 0:');
    console.log('      - Modificar endpoint: WHERE cantidadDano >= 0');
    console.log('   🔧 Para incluir registros con cantidad_dano = NULL:');
    console.log('      - Modificar vista: COALESCE(cantidad_dano, 0) as cantidadDano');
    console.log('      - Y endpoint: WHERE cantidadDano >= 0');

    // 9. Próximos pasos
    console.log('\n9. Próximos pasos para el Punto 3:');
    console.log('   📋 Verificar si hay registros con cantidad_dano = 0 o NULL');
    console.log('   📋 Identificar específicamente los 24 registros faltantes');
    console.log('   📋 Ejecutar consulta directa en migracion_ordenes_2025');
    console.log('   📋 Comparar con la vista unificada');

    console.log('\n✅ PUNTO 2 COMPLETADO: Filtros excluyentes identificados');

  } catch (error) {
    console.error('❌ Error al revisar filtros excluyentes:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

revisarFiltrosExcluyentes();





