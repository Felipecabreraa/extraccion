const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarDanosMigracionDirecto() {
  try {
    console.log('🔍 Verificando daños directamente en migracion_ordenes_2025\n');

    // 1. Verificar endpoint de daños test 2025 (que consulta la vista unificada)
    console.log('1. Datos de daños test 2025 (vista unificada):');
    const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
    const danosTestData = danosTestResponse.data;
    
    console.log(`   📊 totalDanos: ${danosTestData.totalDanos || 'N/A'}`);
    console.log(`   📊 danosPorTipo: ${JSON.stringify(danosTestData.danosPorTipo || [])}`);
    
    // Calcular total de daños por tipo desde la vista unificada
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalVistaUnificada = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      console.log(`   🔢 Total calculado desde vista unificada: ${totalVistaUnificada}`);
    }

    // 2. Verificar daños por sector desde la vista unificada
    console.log('\n2. Total por sectores (vista unificada):');
    if (danosTestData.danosPorSector && danosTestData.danosPorSector.length > 0) {
      const totalSectores = danosTestData.danosPorSector.reduce((sum, sector) => sum + sector.total_danos, 0);
      console.log(`   🔢 Total sumando todos los sectores: ${totalSectores}`);
    }

    // 3. Verificar diferentes orígenes para entender la discrepancia
    console.log('\n3. Verificando diferentes orígenes:');
    const origenes = ['todos', 'historico_2025', 'activo'];
    
    for (const origen of origenes) {
      try {
        const origenResponse = await axios.get(`${BASE_URL}/dashboard/metrics?year=2025&origen=${origen}`);
        const origenData = origenResponse.data;
        
        console.log(`   📊 Origen ${origen}:`);
        console.log(`      - danosMes: ${origenData.danosMes || 'N/A'}`);
        console.log(`      - totalPlanillas: ${origenData.totalPlanillas || 'N/A'}`);
        console.log(`      - totalPabellones: ${origenData.totalPabellones || 'N/A'}`);
      } catch (error) {
        console.log(`   ❌ Error con origen ${origen}: ${error.response?.status || error.message}`);
      }
    }

    // 4. Verificar daños por mes para identificar dónde están los faltantes
    console.log('\n4. Verificando daños por mes:');
    const meses = [1, 2, 3, 4, 5, 6, 7];
    let totalPorMeses = 0;
    
    for (const mes of meses) {
      try {
        const mesResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025&month=${mes}`);
        const mesData = mesResponse.data;
        
        if (mesData.danosPorTipo && mesData.danosPorTipo.length > 0) {
          const totalMes = mesData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
          totalPorMeses += totalMes;
          console.log(`   📅 Mes ${mes}: ${totalMes} daños`);
        } else {
          console.log(`   📅 Mes ${mes}: 0 daños`);
        }
      } catch (error) {
        console.log(`   ❌ Error mes ${mes}: ${error.response?.status || error.message}`);
      }
    }
    
    console.log(`   🔢 Total sumando todos los meses: ${totalPorMeses}`);

    // 5. Resumen de la discrepancia
    console.log('\n5. Resumen de la discrepancia:');
    console.log('   🔢 Daños esperados en migracion_ordenes_2025: 608');
    
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      console.log(`   🔢 Daños encontrados en vista unificada: ${totalCalculado}`);
      console.log(`   🔢 Diferencia: ${608 - totalCalculado} daños faltantes`);
      
      if (totalCalculado !== 608) {
        console.log('\n❌ PROBLEMA DETECTADO:');
        console.log(`   - Se esperaban 608 daños de migracion_ordenes_2025`);
        console.log(`   - Se encontraron ${totalCalculado} daños en la vista unificada`);
        console.log(`   - Faltan ${608 - totalCalculado} daños`);
        console.log('\n💡 Posibles causas:');
        console.log('   - Algunos registros de migracion_ordenes_2025 no están en la vista unificada');
        console.log('   - Filtros en la vista que excluyen registros válidos');
        console.log('   - Problemas en el mapeo de campos entre tablas');
        console.log('   - Registros con valores NULL o 0 que se excluyen');
        console.log('   - Condiciones WHERE en la vista que filtran datos válidos');
        
        console.log('\n🔧 Acciones recomendadas:');
        console.log('   1. Verificar la consulta SQL de la vista unificada');
        console.log('   2. Revisar si hay filtros que excluyen registros');
        console.log('   3. Verificar el mapeo de campos entre migracion_ordenes_2025 y la vista');
        console.log('   4. Identificar los 24 registros faltantes específicos');
      } else {
        console.log('\n✅ No hay discrepancia en los daños');
      }
    }

    // 6. Detalle por tipo de daño
    console.log('\n6. Detalle por tipo de daño:');
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      danosTestData.danosPorTipo.forEach((tipo, index) => {
        console.log(`   ${index + 1}. ${tipo.tipo}: ${tipo.total_danos} daños (${tipo.cantidad} registros)`);
      });
    }

    // 7. Verificar si hay registros con cantidad_dano = 0 o NULL
    console.log('\n7. Verificar registros problemáticos:');
    console.log('   💡 Los 24 daños faltantes podrían ser:');
    console.log('      - Registros con cantidad_dano = 0');
    console.log('      - Registros con cantidad_dano = NULL');
    console.log('      - Registros con fecha_inicio = NULL');
    console.log('      - Registros excluidos por filtros en la vista');

  } catch (error) {
    console.error('❌ Error al verificar daños de migración:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarDanosMigracionDirecto();





