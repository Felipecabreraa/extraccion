const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function identificarDanosFaltantes() {
  try {
    console.log('🔍 Identificando los 24 daños faltantes en la vista unificada\n');

    // 1. Obtener datos de daños test 2025
    console.log('1. Datos de daños test 2025:');
    const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
    const danosTestData = danosTestResponse.data;
    
    // Calcular total de daños por tipo
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      console.log(`   🔢 Total calculado desde vista unificada: ${totalCalculado}`);
      console.log(`   🔢 Daños esperados: 608`);
      console.log(`   🔢 Diferencia: ${608 - totalCalculado} daños faltantes`);
    }

    // 2. Verificar daños por mes para identificar inconsistencias
    console.log('\n2. Verificando daños por mes:');
    const meses = [1, 2, 3, 4, 5, 6, 7];
    let totalPorMeses = 0;
    const danosPorMes = [];
    
    for (const mes of meses) {
      try {
        const mesResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025&month=${mes}`);
        const mesData = mesResponse.data;
        
        if (mesData.danosPorTipo && mesData.danosPorTipo.length > 0) {
          const totalMes = mesData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
          totalPorMeses += totalMes;
          danosPorMes.push({ mes, total: totalMes });
          console.log(`   📅 Mes ${mes}: ${totalMes} daños`);
        } else {
          danosPorMes.push({ mes, total: 0 });
          console.log(`   📅 Mes ${mes}: 0 daños`);
        }
      } catch (error) {
        console.log(`   ❌ Error mes ${mes}: ${error.response?.status || error.message}`);
      }
    }
    
    console.log(`   🔢 Total sumando todos los meses: ${totalPorMeses}`);

    // 3. Verificar daños por sector para identificar inconsistencias
    console.log('\n3. Verificando daños por sector:');
    if (danosTestData.danosPorSector && danosTestData.danosPorSector.length > 0) {
      const totalSectores = danosTestData.danosPorSector.reduce((sum, sector) => sum + sector.total_danos, 0);
      console.log(`   🔢 Total sumando todos los sectores: ${totalSectores}`);
      
      // Mostrar top 10 sectores con más daños
      console.log('\n   Top 10 sectores con más daños:');
      danosTestData.danosPorSector.slice(0, 10).forEach((sector, index) => {
        console.log(`   ${index + 1}. ${sector.sector}: ${sector.total_danos} daños (${sector.cantidad} registros)`);
      });
    }

    // 4. Análisis de inconsistencias
    console.log('\n4. Análisis de inconsistencias:');
    
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalPorTipos = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      
      console.log(`   📊 Total por tipos: ${totalPorTipos}`);
      console.log(`   📊 Total por meses: ${totalPorMeses}`);
      console.log(`   📊 Diferencia tipos vs meses: ${totalPorTipos - totalPorMeses}`);
      
      if (totalPorTipos !== totalPorMeses) {
        console.log('\n   ⚠️  INCONSISTENCIA DETECTADA:');
        console.log(`      - Los daños por tipo (${totalPorTipos}) no coinciden con los daños por mes (${totalPorMeses})`);
        console.log(`      - Diferencia: ${totalPorTipos - totalPorMeses} daños`);
        console.log('\n   💡 Posibles causas:');
        console.log('      - Algunos registros no tienen fecha válida');
        console.log('      - Registros con fecha NULL o inválida');
        console.log('      - Problemas en el filtro por mes');
      }
    }

    // 5. Resumen final del problema
    console.log('\n5. Resumen del problema:');
    console.log('   🔢 Daños en migracion_ordenes_2025: 608');
    
    if (danosTestData.danosPorTipo && danosTestData.danosPorTipo.length > 0) {
      const totalCalculado = danosTestData.danosPorTipo.reduce((sum, tipo) => sum + tipo.total_danos, 0);
      console.log(`   🔢 Daños en vista unificada: ${totalCalculado}`);
      console.log(`   🔢 Daños faltantes: ${608 - totalCalculado}`);
      
      console.log('\n❌ PROBLEMA PRINCIPAL:');
      console.log(`   - Faltan ${608 - totalCalculado} daños en la vista unificada`);
      console.log(`   - Esto representa un ${(((608 - totalCalculado) / 608) * 100).toFixed(2)}% de pérdida`);
      
      console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
      console.log('   1. Verificar la consulta SQL de la vista unificada');
      console.log('   2. Revisar si hay filtros WHERE que excluyen registros');
      console.log('   3. Verificar si hay registros con cantidad_dano = 0 o NULL');
      console.log('   4. Revisar si hay registros con fecha_inicio = NULL');
      console.log('   5. Identificar los 24 registros específicos que faltan');
      
      console.log('\n📋 PRÓXIMOS PASOS:');
      console.log('   1. Ejecutar consulta directa en migracion_ordenes_2025');
      console.log('   2. Comparar con la vista unificada');
      console.log('   3. Identificar los registros faltantes');
      console.log('   4. Corregir la vista unificada');
    }

  } catch (error) {
    console.error('❌ Error al identificar daños faltantes:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

identificarDanosFaltantes();





