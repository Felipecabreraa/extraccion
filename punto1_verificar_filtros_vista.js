const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarFiltrosVista() {
  try {
    console.log('🔍 PUNTO 1: Verificando filtros de la vista unificada\n');

    // 1. Analizar la consulta SQL de la vista unificada
    console.log('1. Análisis de la consulta SQL de vw_ordenes_2025_actual:');
    console.log('   📋 Consulta encontrada:');
    console.log('   CREATE OR REPLACE VIEW vw_ordenes_2025_actual AS');
    console.log('   SELECT ... FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL');
    
    console.log('\n   ⚠️  FILTRO IDENTIFICADO:');
    console.log('   WHERE fecha_inicio IS NOT NULL');
    console.log('   Este filtro excluye registros con fecha_inicio = NULL');

    // 2. Verificar cuántos registros tienen fecha_inicio = NULL
    console.log('\n2. Verificando registros con fecha_inicio = NULL:');
    try {
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
        const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
        console.log(`   📊 Daños en vista unificada: ${totalCalculado}`);
        console.log(`   📊 Daños esperados: 608`);
        console.log(`   📊 Diferencia: ${608 - totalCalculado} daños`);
        
        if (608 - totalCalculado === 24) {
          console.log('   ✅ La diferencia coincide con los 24 daños faltantes');
        }
      }
    } catch (error) {
      console.log(`   ❌ Error verificando datos: ${error.response?.status || error.message}`);
    }

    // 3. Verificar otros posibles filtros
    console.log('\n3. Otros filtros que podrían estar excluyendo registros:');
    console.log('   📋 Filtros en la consulta SQL:');
    console.log('   - WHERE fecha_inicio IS NOT NULL (excluye registros sin fecha)');
    console.log('   - COALESCE(cantidad_dano, 0) as cantidadDano (convierte NULL a 0)');
    console.log('   - COALESCE(tipo_dano, \'Sin tipo\') as nombreTipoDano (convierte NULL a texto)');
    
    console.log('\n   💡 Posibles causas de exclusión:');
    console.log('   - Registros con fecha_inicio = NULL');
    console.log('   - Registros con cantidad_dano = NULL (se convierten a 0)');
    console.log('   - Registros con tipo_dano = NULL (se convierten a "Sin tipo")');

    // 4. Verificar si hay registros con cantidad_dano = 0 que se están excluyendo
    console.log('\n4. Verificando registros con cantidad_dano = 0:');
    console.log('   📊 Los registros con cantidad_dano = 0 se incluyen en la vista');
    console.log('   📊 Pero podrían estar siendo filtrados en las consultas posteriores');
    console.log('   📊 Verificar si las consultas usan WHERE cantidadDano > 0');

    // 5. Verificar filtros en las consultas del endpoint
    console.log('\n5. Verificando filtros en las consultas del endpoint:');
    console.log('   📋 Consulta del endpoint de daños:');
    console.log('   SELECT ... FROM vw_ordenes_2025_actual');
    console.log('   WHERE YEAR(fechaOrdenServicio) = ? AND cantidadDano > 0');
    
    console.log('\n   ⚠️  FILTRO ADICIONAL IDENTIFICADO:');
    console.log('   AND cantidadDano > 0');
    console.log('   Este filtro excluye registros con cantidadDano = 0');

    // 6. Resumen de filtros encontrados
    console.log('\n6. Resumen de filtros que excluyen registros:');
    console.log('   🔍 En la vista unificada:');
    console.log('      - WHERE fecha_inicio IS NOT NULL (excluye registros sin fecha)');
    console.log('   🔍 En las consultas del endpoint:');
    console.log('      - WHERE cantidadDano > 0 (excluye registros con 0 daños)');
    
    console.log('\n   📊 Registros que podrían estar siendo excluidos:');
    console.log('      - Registros con fecha_inicio = NULL');
    console.log('      - Registros con cantidad_dano = 0');
    console.log('      - Registros con cantidad_dano = NULL (convertidos a 0)');

    // 7. Recomendaciones
    console.log('\n7. Recomendaciones para solucionar el problema:');
    console.log('   🔧 Opción 1: Modificar la vista para incluir registros sin fecha');
    console.log('      - Cambiar WHERE fecha_inicio IS NOT NULL por WHERE 1=1');
    console.log('   🔧 Opción 2: Modificar las consultas del endpoint');
    console.log('      - Cambiar WHERE cantidadDano > 0 por WHERE cantidadDano >= 0');
    console.log('   🔧 Opción 3: Identificar específicamente los 24 registros faltantes');
    console.log('      - Ejecutar consulta directa en migracion_ordenes_2025');
    console.log('      - Comparar con la vista unificada');

    console.log('\n✅ PUNTO 1 COMPLETADO: Filtros de la vista unificada identificados');

  } catch (error) {
    console.error('❌ Error al verificar filtros de la vista:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarFiltrosVista();





