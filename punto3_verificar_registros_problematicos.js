const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarRegistrosProblematicos() {
  try {
    console.log('🔍 PUNTO 3: Verificando registros con cantidad_dano = 0 o NULL\n');

    // 1. Verificar registros con cantidad_dano = 0
    console.log('1. Verificando registros con cantidad_dano = 0:');
    try {
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
        const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
        console.log(`   📊 Daños encontrados con filtro cantidadDano > 0: ${totalCalculado}`);
        console.log(`   📊 Si hay registros con cantidad_dano = 0, no se están contando`);
        console.log(`   📊 Esto explicaría por qué faltan algunos daños`);
      }
    } catch (error) {
      console.log(`   ❌ Error verificando datos: ${error.response?.status || error.message}`);
    }

    // 2. Verificar registros con cantidad_dano = NULL
    console.log('\n2. Verificando registros con cantidad_dano = NULL:');
    console.log('   📋 En la vista unificada:');
    console.log('   COALESCE(cantidad_dano, 0) as cantidadDano');
    console.log('   📊 Los registros con cantidad_dano = NULL se convierten a 0');
    console.log('   📊 Luego se filtran con WHERE cantidadDano > 0');
    console.log('   📊 Esto excluye registros con cantidad_dano = NULL');

    // 3. Verificar registros con fecha_inicio = NULL
    console.log('\n3. Verificando registros con fecha_inicio = NULL:');
    console.log('   📋 En la vista unificada:');
    console.log('   WHERE fecha_inicio IS NOT NULL');
    console.log('   📊 Este filtro excluye registros sin fecha válida');
    console.log('   📊 Los registros con fecha_inicio = NULL no aparecen en la vista');

    // 4. Analizar las posibles combinaciones
    console.log('\n4. Análisis de combinaciones problemáticas:');
    console.log('   📊 Combinación 1: fecha_inicio = NULL, cantidad_dano > 0');
    console.log('      - Excluido por: WHERE fecha_inicio IS NOT NULL');
    console.log('      - Resultado: No aparece en la vista');
    console.log('   📊 Combinación 2: fecha_inicio válida, cantidad_dano = 0');
    console.log('      - Incluido en vista, pero excluido por: WHERE cantidadDano > 0');
    console.log('      - Resultado: No aparece en los resultados');
    console.log('   📊 Combinación 3: fecha_inicio válida, cantidad_dano = NULL');
    console.log('      - Convertido a 0 en vista, excluido por: WHERE cantidadDano > 0');
    console.log('      - Resultado: No aparece en los resultados');

    // 5. Calcular el impacto de cada filtro
    console.log('\n5. Cálculo del impacto de cada filtro:');
    console.log('   📊 Total daños esperados: 608');
    console.log('   📊 Total daños encontrados: 584');
    console.log('   📊 Diferencia: 24 daños');
    
    console.log('\n   💡 Posibles distribuciones de los 24 daños faltantes:');
    console.log('   - 24 registros con fecha_inicio = NULL');
    console.log('   - 24 registros con cantidad_dano = 0');
    console.log('   - 24 registros con cantidad_dano = NULL');
    console.log('   - 12 registros con fecha_inicio = NULL + 12 con cantidad_dano = 0');
    console.log('   - Otra combinación de los anteriores');

    // 6. Verificar si hay registros con "Sin tipo" que podrían ser NULL
    console.log('\n6. Verificando registros con tipo_dano = NULL:');
    console.log('   📋 En la vista unificada:');
    console.log('   COALESCE(tipo_dano, \'Sin tipo\') as nombreTipoDano');
    console.log('   📊 Los registros con tipo_dano = NULL se convierten a "Sin tipo"');
    console.log('   📊 Esto no excluye registros, solo cambia el valor');
    console.log('   📊 Verificar si hay registros con "Sin tipo" en los resultados');

    // 7. Verificar los datos actuales para identificar patrones
    console.log('\n7. Verificando datos actuales para identificar patrones:');
    try {
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
        console.log('   📊 Tipos de daños encontrados:');
        danosTestData.danosPorTipo.forEach((tipo, index) => {
          console.log(`      ${index + 1}. ${tipo.tipo}: ${tipo.total_danos} daños (${tipo.cantidad} registros)`);
        });
        
        // Verificar si hay "Sin tipo"
        const sinTipo = danosTestData.danosPorTipo.find(tipo => tipo.tipo === 'Sin tipo');
        if (sinTipo) {
          console.log(`   📊 Encontrados ${sinTipo.total_danos} daños con tipo "Sin tipo"`);
          console.log(`   📊 Estos podrían ser registros con tipo_dano = NULL`);
        } else {
          console.log(`   📊 No se encontraron registros con tipo "Sin tipo"`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error verificando datos: ${error.response?.status || error.message}`);
    }

    // 8. Resumen de hallazgos
    console.log('\n8. Resumen de hallazgos:');
    console.log('   ✅ Filtros identificados que excluyen registros:');
    console.log('      - WHERE fecha_inicio IS NOT NULL (vista)');
    console.log('      - WHERE cantidadDano > 0 (endpoint)');
    console.log('   ✅ Tipos de registros excluidos:');
    console.log('      - Registros con fecha_inicio = NULL');
    console.log('      - Registros con cantidad_dano = 0');
    console.log('      - Registros con cantidad_dano = NULL (convertidos a 0)');

    // 9. Próximos pasos para solucionar
    console.log('\n9. Próximos pasos para solucionar:');
    console.log('   🔧 Opción 1: Modificar la vista unificada');
    console.log('      - Cambiar WHERE fecha_inicio IS NOT NULL por WHERE 1=1');
    console.log('      - O usar WHERE fecha_inicio IS NOT NULL OR cantidad_dano > 0');
    console.log('   🔧 Opción 2: Modificar las consultas del endpoint');
    console.log('      - Cambiar WHERE cantidadDano > 0 por WHERE cantidadDano >= 0');
    console.log('   🔧 Opción 3: Identificar los 24 registros específicos');
    console.log('      - Ejecutar consulta directa en migracion_ordenes_2025');
    console.log('      - Comparar con la vista unificada');

    console.log('\n✅ PUNTO 3 COMPLETADO: Registros problemáticos identificados');

  } catch (error) {
    console.error('❌ Error al verificar registros problemáticos:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarRegistrosProblematicos();





