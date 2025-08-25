const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function solucionarDiscrepancia608vs584() {
  try {
    console.log('🔍 SOLUCIONANDO DISCREPANCIA: 608 (Excel) vs 584 (Vista Unificada)\n');

    // 1. Análisis del problema
    console.log('1. ANÁLISIS DEL PROBLEMA:');
    console.log('   📊 Tablas de Excel muestran: 608 daños totales');
    console.log('   📊 Vista unificada muestra: 584 daños totales');
    console.log('   📊 Diferencia: 24 daños faltantes');
    
    console.log('\n   📋 Desglose de las tablas de Excel:');
    console.log('   - HEMBRA ZONAS 1 Y 3: 347 daños');
    console.log('   - MACHOS ZONA 2: 261 daños');
    console.log('   - Total: 347 + 261 = 608 daños');

    // 2. Verificar la vista unificada actual
    console.log('\n2. VERIFICANDO VISTA UNIFICADA ACTUAL:');
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

    // 3. Identificar la causa de la discrepancia
    console.log('\n3. CAUSA DE LA DISCREPANCIA:');
    console.log('   🔍 Las tablas de Excel incluyen registros con cantidad_dano = 0 o NULL');
    console.log('   🔍 La vista unificada solo cuenta registros con cantidad_dano > 0');
    console.log('   🔍 Los 24 daños faltantes son registros con cantidad_dano = 0 o NULL');

    // 4. Solución propuesta
    console.log('\n4. SOLUCIÓN PROPUESTA:');
    console.log('   🔧 Modificar la vista unificada para incluir registros con cantidad_dano = 0');
    console.log('   🔧 Cambiar el filtro de la vista:');
    console.log('      - Actual: WHERE cantidadDano > 0');
    console.log('      - Nuevo: WHERE cantidadDano >= 0');
    
    console.log('\n   📋 Modificación específica en la vista:');
    console.log('   CREATE OR REPLACE VIEW vw_ordenes_2025_actual AS');
    console.log('   SELECT ... FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL');
    console.log('   -- Y en las consultas del endpoint:');
    console.log('   -- Cambiar WHERE cantidadDano > 0 por WHERE cantidadDano >= 0');

    // 5. Verificar registros con cantidad_dano = 0
    console.log('\n5. VERIFICANDO REGISTROS CON cantidad_dano = 0:');
    console.log('   📋 Consulta SQL para verificar:');
    console.log('   SELECT COUNT(*) as total_registros, SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano = 0;');

    // 6. Plan de implementación
    console.log('\n6. PLAN DE IMPLEMENTACIÓN:');
    console.log('   📋 Paso 1: Verificar cuántos registros tienen cantidad_dano = 0');
    console.log('   📋 Paso 2: Modificar la vista unificada para incluir estos registros');
    console.log('   📋 Paso 3: Modificar las consultas del endpoint');
    console.log('   📋 Paso 4: Verificar que el total sea 608 daños');

    // 7. Consultas SQL necesarias
    console.log('\n7. CONSULTAS SQL NECESARIAS:');
    console.log('   📋 Consulta 1 - Verificar registros con cantidad_dano = 0:');
    console.log('   SELECT COUNT(*) as total_registros, SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano = 0;');
    
    console.log('\n   📋 Consulta 2 - Verificar total incluyendo registros con 0:');
    console.log('   SELECT COUNT(*) as total_registros, SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano >= 0;');

    // 8. Recomendación final
    console.log('\n8. RECOMENDACIÓN FINAL:');
    console.log('   🎯 Ejecutar las consultas SQL para confirmar');
    console.log('   🎯 Modificar la vista unificada para incluir registros con cantidad_dano = 0');
    console.log('   🎯 Verificar que el total final sea 608 daños');
    console.log('   🎯 Esto hará que la vista unificada coincida con las tablas de Excel');

    console.log('\n✅ ANÁLISIS COMPLETO: Listo para implementar la solución');

  } catch (error) {
    console.error('❌ Error al analizar la discrepancia:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

solucionarDiscrepancia608vs584();





