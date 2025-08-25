const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function consultasSQLIdentificarFaltantes() {
  try {
    console.log('🔍 EJECUTANDO CONSULTAS SQL PARA IDENTIFICAR LOS 24 REGISTROS FALTANTES\n');

    // 1. Consulta 1: Registros con fecha_inicio = NULL y cantidad_dano > 0
    console.log('1. CONSULTA 1 - Registros con fecha_inicio = NULL y cantidad_dano > 0:');
    console.log('   📋 SQL: SELECT COUNT(*) as total, SUM(cantidad_dano) as total_danos');
    console.log('        FROM migracion_ordenes_2025');
    console.log('        WHERE fecha_inicio IS NULL AND cantidad_dano > 0');
    
    try {
      const consulta1Response = await axios.get(`${BASE_URL}/danos/consulta-sql?query=null_fecha`);
      console.log(`   📊 Resultado: ${JSON.stringify(consulta1Response.data)}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible`);
      console.log(`   💡 Esta consulta identificaría registros excluidos por el filtro fecha_inicio IS NOT NULL`);
    }

    // 2. Consulta 2: Registros con cantidad_dano = 0
    console.log('\n2. CONSULTA 2 - Registros con cantidad_dano = 0:');
    console.log('   📋 SQL: SELECT COUNT(*) as total');
    console.log('        FROM migracion_ordenes_2025');
    console.log('        WHERE cantidad_dano = 0 AND fecha_inicio IS NOT NULL');
    
    try {
      const consulta2Response = await axios.get(`${BASE_URL}/danos/consulta-sql?query=cero_danos`);
      console.log(`   📊 Resultado: ${JSON.stringify(consulta2Response.data)}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible`);
      console.log(`   💡 Esta consulta identificaría registros excluidos por el filtro cantidadDano > 0`);
    }

    // 3. Consulta 3: Registros con cantidad_dano = NULL
    console.log('\n3. CONSULTA 3 - Registros con cantidad_dano = NULL:');
    console.log('   📋 SQL: SELECT COUNT(*) as total');
    console.log('        FROM migracion_ordenes_2025');
    console.log('        WHERE cantidad_dano IS NULL AND fecha_inicio IS NOT NULL');
    
    try {
      const consulta3Response = await axios.get(`${BASE_URL}/danos/consulta-sql?query=null_danos`);
      console.log(`   📊 Resultado: ${JSON.stringify(consulta3Response.data)}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible`);
      console.log(`   💡 Esta consulta identificaría registros convertidos a 0 por COALESCE`);
    }

    // 4. Consulta 4: Total de registros en migracion_ordenes_2025
    console.log('\n4. CONSULTA 4 - Total de registros en migracion_ordenes_2025:');
    console.log('   📋 SQL: SELECT COUNT(*) as total, SUM(cantidad_dano) as total_danos');
    console.log('        FROM migracion_ordenes_2025');
    console.log('        WHERE cantidad_dano > 0');
    
    try {
      const consulta4Response = await axios.get(`${BASE_URL}/danos/consulta-sql?query=total_original`);
      console.log(`   📊 Resultado: ${JSON.stringify(consulta4Response.data)}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible`);
      console.log(`   💡 Esta consulta confirmaría el total de 608 daños`);
    }

    // 5. Consulta 5: Registros en la vista unificada
    console.log('\n5. CONSULTA 5 - Total de registros en la vista unificada:');
    console.log('   📋 SQL: SELECT COUNT(*) as total, SUM(cantidadDano) as total_danos');
    console.log('        FROM vw_ordenes_2025_actual');
    console.log('        WHERE cantidadDano > 0');
    
    try {
      const consulta5Response = await axios.get(`${BASE_URL}/danos/consulta-sql?query=total_vista`);
      console.log(`   📊 Resultado: ${JSON.stringify(consulta5Response.data)}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible`);
      console.log(`   💡 Esta consulta confirmaría el total de 584 daños en la vista`);
    }

    // 6. Análisis de las consultas
    console.log('\n6. ANÁLISIS DE LAS CONSULTAS:');
    console.log('   🔍 Consulta 1: Identifica registros excluidos por fecha_inicio = NULL');
    console.log('   🔍 Consulta 2: Identifica registros excluidos por cantidad_dano = 0');
    console.log('   🔍 Consulta 3: Identifica registros excluidos por cantidad_dano = NULL');
    console.log('   🔍 Consulta 4: Confirma el total de 608 daños en la tabla original');
    console.log('   🔍 Consulta 5: Confirma el total de 584 daños en la vista unificada');

    // 7. Recomendación final
    console.log('\n7. RECOMENDACIÓN FINAL:');
    console.log('   🎯 MI RECOMENDACIÓN: Opción 3 + Opción 1');
    console.log('   📋 Paso 1: Ejecutar estas consultas SQL en tu base de datos');
    console.log('   📋 Paso 2: Identificar exactamente qué registros faltan');
    console.log('   📋 Paso 3: Modificar la vista unificada según los hallazgos');
    
    console.log('\n   💡 Modificación sugerida para la vista:');
    console.log('   - Cambiar WHERE fecha_inicio IS NOT NULL por:');
    console.log('     WHERE (fecha_inicio IS NOT NULL OR cantidad_dano > 0)');
    console.log('   - Esto incluiría registros con fecha NULL pero con daños válidos');

    // 8. Próximos pasos específicos
    console.log('\n8. PRÓXIMOS PASOS ESPECÍFICOS:');
    console.log('   📋 1. Ejecutar las 5 consultas SQL en tu base de datos');
    console.log('   📋 2. Sumar los resultados de las consultas 1, 2 y 3');
    console.log('   📋 3. Verificar que la suma sea 24 (registros faltantes)');
    console.log('   📋 4. Modificar la vista unificada según los hallazgos');
    console.log('   📋 5. Verificar que el total final sea 608 daños');

    console.log('\n✅ CONSULTAS SQL LISTAS: Ejecuta estas consultas en tu base de datos');

  } catch (error) {
    console.error('❌ Error al ejecutar consultas SQL:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

consultasSQLIdentificarFaltantes();





