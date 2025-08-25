const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarDanosPorOperador() {
  try {
    console.log('🔍 VERIFICANDO DAÑOS POR OPERADOR\n');

    // 1. Obtener datos de daños por operador desde la vista unificada
    console.log('1. Obteniendo daños por operador desde la vista unificada:');
    try {
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
        const totalVistaUnificada = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
        console.log(`   📊 Total en vista unificada: ${totalVistaUnificada} daños`);
        console.log(`   📊 Total esperado (Excel): 608 daños`);
        console.log(`   📊 Diferencia: ${608 - totalVistaUnificada} daños`);
        
        console.log('\n   📋 Desglose por tipos:');
        danosTestData.danosPorTipo.forEach((tipo, index) => {
          console.log(`      ${index + 1}. ${tipo.tipo}: ${tipo.total_danos} daños (${tipo.cantidad} registros)`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error verificando vista: ${error.response?.status || error.message}`);
    }

    // 2. Consultas SQL para verificar daños por operador
    console.log('\n2. CONSULTAS SQL PARA VERIFICAR DAÑOS POR OPERADOR:');
    console.log('   📋 Consulta 1 - Daños por operador en la vista unificada:');
    console.log('   SELECT');
    console.log('     nombreOperador,');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(cantidadDano) as total_danos');
    console.log('   FROM vw_ordenes_2025_actual');
    console.log('   WHERE cantidadDano > 0');
    console.log('   GROUP BY nombreOperador');
    console.log('   ORDER BY total_danos DESC;');
    
    console.log('\n   📋 Consulta 2 - Daños por operador en tabla original:');
    console.log('   SELECT');
    console.log('     nombre_operador,');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   GROUP BY nombre_operador');
    console.log('   ORDER BY total_danos DESC;');

    // 3. Comparación con las tablas de Excel
    console.log('\n3. COMPARACIÓN CON TABLAS DE EXCEL:');
    console.log('   📊 HEMBRA ZONAS 1 Y 3 (Excel): 347 daños');
    console.log('   📊 MACHOS ZONA 2 (Excel): 261 daños');
    console.log('   📊 Total Excel: 608 daños');
    
    console.log('\n   📋 Operadores principales en Excel:');
    console.log('   - Victor Manuel Zuniga Pozo: 66 daños');
    console.log('   - Cesar: 61 daños');
    console.log('   - Eric Rodrigo Jorquera Perez: 57 daños');
    console.log('   - Patricio Galvez Galvez: 41 daños');
    console.log('   - Carlos Francisco Caroca Elgueta: 38 daños');

    // 4. Verificar si hay operadores faltantes
    console.log('\n4. VERIFICANDO OPERADORES FALTANTES:');
    console.log('   📋 Consulta 3 - Operadores en tabla original vs Excel:');
    console.log('   SELECT DISTINCT nombre_operador');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   ORDER BY nombre_operador;');

    // 5. Verificar totales por zona
    console.log('\n5. VERIFICANDO TOTALES POR ZONA:');
    console.log('   📋 Consulta 4 - Daños por zona:');
    console.log('   SELECT');
    console.log('     zona,');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   GROUP BY zona');
    console.log('   ORDER BY total_danos DESC;');

    // 6. Verificar si hay registros sin operador
    console.log('\n6. VERIFICANDO REGISTROS SIN OPERADOR:');
    console.log('   📋 Consulta 5 - Registros con nombre_operador NULL o vacío:');
    console.log('   SELECT COUNT(*) as total_registros, SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   AND (nombre_operador IS NULL OR nombre_operador = \'\');');

    // 7. Plan de verificación
    console.log('\n7. PLAN DE VERIFICACIÓN:');
    console.log('   📋 Paso 1: Ejecutar consulta 1 para obtener daños por operador en vista unificada');
    console.log('   📋 Paso 2: Ejecutar consulta 2 para obtener daños por operador en tabla original');
    console.log('   📋 Paso 3: Comparar con los operadores de las tablas de Excel');
    console.log('   📋 Paso 4: Identificar operadores faltantes o con diferencias');
    console.log('   📋 Paso 5: Verificar si hay registros sin operador asignado');

    // 8. Recomendación
    console.log('\n8. RECOMENDACIÓN:');
    console.log('   🎯 Ejecutar las consultas SQL para obtener el desglose por operador');
    console.log('   🎯 Comparar con las tablas de Excel que mostraste');
    console.log('   🎯 Identificar exactamente qué operadores faltan o tienen diferencias');
    console.log('   🎯 Esto nos dará la respuesta exacta sobre los 24 daños faltantes');

    console.log('\n✅ ANÁLISIS COMPLETO: Listo para verificar daños por operador');

  } catch (error) {
    console.error('❌ Error al verificar daños por operador:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarDanosPorOperador();





