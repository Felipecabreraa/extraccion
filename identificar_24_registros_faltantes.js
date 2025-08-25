const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function identificar24RegistrosFaltantes() {
  try {
    console.log('🔍 IDENTIFICANDO LOS 24 REGISTROS FALTANTES\n');

    // 1. Obtener datos de la vista unificada (584 daños)
    console.log('1. Obteniendo datos de la vista unificada:');
    const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
    const danosTestData = danosTestResponse.data;
    
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalVistaUnificada = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      console.log(`   📊 Total en vista unificada: ${totalVistaUnificada} daños`);
      console.log(`   📊 Total esperado: 608 daños`);
      console.log(`   📊 Diferencia: ${608 - totalVistaUnificada} daños faltantes`);
      
      console.log('\n   📋 Desglose por tipos:');
      danosTestData.danosPorTipo.forEach((tipo, index) => {
        console.log(`      ${index + 1}. ${tipo.tipo}: ${tipo.total_danos} daños (${tipo.cantidad} registros)`);
      });
    }

    // 2. Verificar registros con fecha_inicio = NULL
    console.log('\n2. Verificando registros con fecha_inicio = NULL:');
    try {
      const registrosSinFechaResponse = await axios.get(`${BASE_URL}/danos/registros-sin-fecha?year=2025`);
      console.log(`   📊 Registros con fecha_inicio = NULL: ${registrosSinFechaResponse.data.total || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible, creando consulta alternativa`);
    }

    // 3. Verificar registros con cantidad_dano = 0
    console.log('\n3. Verificando registros con cantidad_dano = 0:');
    try {
      const registrosCeroResponse = await axios.get(`${BASE_URL}/danos/registros-cero?year=2025`);
      console.log(`   📊 Registros con cantidad_dano = 0: ${registrosCeroResponse.data.total || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible, creando consulta alternativa`);
    }

    // 4. Verificar registros con cantidad_dano = NULL
    console.log('\n4. Verificando registros con cantidad_dano = NULL:');
    try {
      const registrosNullResponse = await axios.get(`${BASE_URL}/danos/registros-null?year=2025`);
      console.log(`   📊 Registros con cantidad_dano = NULL: ${registrosNullResponse.data.total || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Endpoint no disponible, creando consulta alternativa`);
    }

    // 5. Crear consultas SQL para identificar los registros faltantes
    console.log('\n5. Consultas SQL para identificar registros faltantes:');
    console.log('   📋 Consulta 1 - Registros con fecha_inicio = NULL:');
    console.log('   SELECT COUNT(*) as total, SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NULL AND cantidad_dano > 0');
    
    console.log('\n   📋 Consulta 2 - Registros con cantidad_dano = 0:');
    console.log('   SELECT COUNT(*) as total');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE cantidad_dano = 0 AND fecha_inicio IS NOT NULL');
    
    console.log('\n   📋 Consulta 3 - Registros con cantidad_dano = NULL:');
    console.log('   SELECT COUNT(*) as total');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE cantidad_dano IS NULL AND fecha_inicio IS NOT NULL');

    // 6. Recomendación específica
    console.log('\n6. RECOMENDACIÓN ESPECÍFICA:');
    console.log('   🔧 Paso 1: Ejecutar las consultas SQL anteriores');
    console.log('   🔧 Paso 2: Identificar exactamente qué registros faltan');
    console.log('   🔧 Paso 3: Modificar la vista unificada según los hallazgos');
    
    console.log('\n   💡 Modificaciones sugeridas para la vista:');
    console.log('   - Cambiar WHERE fecha_inicio IS NOT NULL por:');
    console.log('     WHERE (fecha_inicio IS NOT NULL OR cantidad_dano > 0)');
    console.log('   - Esto incluiría registros con fecha NULL pero con daños');

    // 7. Próximos pasos
    console.log('\n7. PRÓXIMOS PASOS:');
    console.log('   📋 1. Ejecutar consultas SQL en la base de datos');
    console.log('   📋 2. Identificar los 24 registros específicos');
    console.log('   📋 3. Modificar la vista unificada');
    console.log('   📋 4. Verificar que el total sea 608 daños');

    console.log('\n✅ ANÁLISIS COMPLETO: Listo para identificar los 24 registros faltantes');

  } catch (error) {
    console.error('❌ Error al identificar registros faltantes:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

identificar24RegistrosFaltantes();





