const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function analizarDanos2025() {
  try {
    console.log('🔍 Analizando daños específicos de 2025\n');

    // 1. Obtener datos de daños test 2025
    console.log('1. Datos de daños test 2025:');
    const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
    const danosTestData = danosTestResponse.data;
    
    console.log(`   📊 totalDanos: ${danosTestData.totalDanos || 'N/A'}`);
    console.log(`   📊 danosPorTipo: ${JSON.stringify(danosTestData.danosPorTipo || [])}`);
    
    // Calcular total de daños por tipo
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      console.log(`   🔢 Total calculado sumando tipos: ${totalCalculado}`);
    }

    // 2. Verificar daños por sector
    console.log('\n2. Top 10 sectores con más daños:');
    if (danosTestData.danosPorSector && danosTestData.danosPorSector.length > 0) {
      danosTestData.danosPorSector.slice(0, 10).forEach((sector, index) => {
        console.log(`   ${index + 1}. ${sector.sector}: ${sector.total_danos} daños (${sector.cantidad} registros)`);
      });
      
      const totalSectores = danosTestData.danosPorSector.reduce((sum, sector) => sum + sector.total_danos, 0);
      console.log(`   🔢 Total sumando todos los sectores: ${totalSectores}`);
    }

    // 3. Verificar diferentes orígenes para 2025
    console.log('\n3. Verificando diferentes orígenes para 2025:');
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

    // 4. Verificar daños por mes
    console.log('\n4. Verificando daños por mes:');
    const meses = [1, 2, 3, 4, 5, 6, 7];
    
    for (const mes of meses) {
      try {
        const mesResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025&month=${mes}`);
        const mesData = mesResponse.data;
        
        if (mesData.danosPorTipo && mesData.danosPorTipo.length > 0) {
          const totalMes = mesData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
          console.log(`   📅 Mes ${mes}: ${totalMes} daños`);
        } else {
          console.log(`   📅 Mes ${mes}: 0 daños`);
        }
      } catch (error) {
        console.log(`   ❌ Error mes ${mes}: ${error.response?.status || error.message}`);
      }
    }

    // 5. Resumen final
    console.log('\n5. Resumen de la discrepancia:');
    console.log('   🔢 Daños esperados en 2025: 584');
    
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      console.log(`   🔢 Daños encontrados en test: ${totalCalculado}`);
      console.log(`   🔢 Diferencia: ${584 - totalCalculado}`);
      
      if (totalCalculado !== 584) {
        console.log('\n❌ PROBLEMA DETECTADO:');
        console.log(`   - Se esperaban 584 daños`);
        console.log(`   - Se encontraron ${totalCalculado} daños`);
        console.log(`   - Faltan ${584 - totalCalculado} daños`);
        console.log('\n💡 Posibles causas:');
        console.log('   - Algunos registros no están en la vista unificada');
        console.log('   - Filtros que excluyen registros válidos');
        console.log('   - Problemas en el mapeo de campos');
        console.log('   - Registros con valores NULL o 0');
      } else {
        console.log('\n✅ No hay discrepancia en los daños de 2025');
      }
    }

    // 6. Detalle por tipo de daño
    console.log('\n6. Detalle por tipo de daño:');
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      danosTestData.danosPorTipo.forEach((tipo, index) => {
        console.log(`   ${index + 1}. ${tipo.tipo}: ${tipo.total_danos} daños (${tipo.cantidad} registros)`);
      });
    }

  } catch (error) {
    console.error('❌ Error al analizar daños 2025:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

analizarDanos2025();





