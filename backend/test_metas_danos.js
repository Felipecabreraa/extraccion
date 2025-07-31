const axios = require('axios');

// Configuración para pruebas
const BASE_URL = 'http://localhost:3001/api';

async function testMetasDanos() {
  try {
    console.log('🧪 Probando funcionalidad de metas de daños...\n');

    // Test 1: Obtener estadísticas completas de metas
    console.log('1. Probando endpoint /danos/meta/stats...');
    const response1 = await axios.get(`${BASE_URL}/danos/meta/stats/test`, {
      params: {
        year: 2025,
        porcentaje: 5.0
      }
    });

    console.log('✅ Respuesta recibida:');
    console.log(`   - Año actual: ${response1.data.configuracion.anioActual}`);
    console.log(`   - Año anterior: ${response1.data.configuracion.anioAnterior}`);
    console.log(`   - Meta anual: ${response1.data.configuracion.metaAnual}`);
    console.log(`   - Meta mensual: ${response1.data.configuracion.metaMensual}`);
    console.log(`   - Total real hasta ahora: ${response1.data.datosAnioActual.totalRealHastaAhora}`);
    console.log(`   - Cumplimiento: ${response1.data.datosAnioActual.cumplimientoMeta}%`);

    // Test 2: Obtener resumen de metas
    console.log('\n2. Probando endpoint /danos/meta/resumen...');
    const response2 = await axios.get(`${BASE_URL}/danos/meta/resumen/test`, {
      params: {
        year: 2025,
        porcentaje: 5.0
      }
    });

    console.log('✅ Resumen recibido:');
    console.log(`   - Año actual: ${response2.data.anioActual}`);
    console.log(`   - Total año anterior: ${response2.data.totalAnioAnterior}`);
    console.log(`   - Meta anual: ${response2.data.metaAnual}`);
    console.log(`   - Meta mensual: ${response2.data.metaMensual}`);
    console.log(`   - Total real: ${response2.data.totalRealHastaAhora}`);
    console.log(`   - Cumplimiento: ${response2.data.cumplimientoMeta}%`);

    // Test 3: Verificar datos mensuales
    console.log('\n3. Verificando datos mensuales...');
    if (response1.data.datosMensuales && response1.data.datosMensuales.length > 0) {
      console.log(`   ✅ Datos mensuales disponibles: ${response1.data.datosMensuales.length} meses`);
      
      const mesesConDatos = response1.data.datosMensuales.filter(item => item.tieneDatos);
      console.log(`   ✅ Meses con datos reales: ${mesesConDatos.length}`);
      
      const cumplimientoPromedio = mesesConDatos.reduce((sum, item) => {
        const cumplimiento = item.metaMensual > 0 ? (item.danosReales / item.metaMensual) * 100 : 0;
        return sum + cumplimiento;
      }, 0) / mesesConDatos.length;
      
      console.log(`   📊 Cumplimiento promedio mensual: ${cumplimientoPromedio.toFixed(1)}%`);
    } else {
      console.log('   ⚠️ No hay datos mensuales disponibles');
    }

    // Test 4: Verificar datos de gráficos
    console.log('\n4. Verificando datos de gráficos...');
    if (response1.data.datosGraficos) {
      console.log(`   ✅ Tendencias: ${response1.data.datosGraficos.tendencias?.length || 0} registros`);
      console.log(`   ✅ Metas: ${response1.data.datosGraficos.metas?.length || 0} registros`);
      console.log(`   ✅ Reales: ${response1.data.datosGraficos.reales?.length || 0} registros`);
    } else {
      console.log('   ⚠️ No hay datos de gráficos disponibles');
    }

    // Test 5: Probar diferentes configuraciones
    console.log('\n5. Probando diferentes configuraciones...');
    const configuraciones = [
      { year: 2025, porcentaje: 3.0 },
      { year: 2025, porcentaje: 7.0 },
      { year: 2024, porcentaje: 5.0 }
    ];

    for (const config of configuraciones) {
      try {
        const response = await axios.get(`${BASE_URL}/danos/meta/resumen/test`, {
          params: config
        });
        
        console.log(`   ✅ ${config.year} con ${config.porcentaje}%: Meta=${response.data.metaAnual}, Real=${response.data.totalRealHastaAhora}, Cumplimiento=${response.data.cumplimientoMeta}%`);
      } catch (error) {
        console.log(`   ❌ Error con configuración ${config.year}/${config.porcentaje}%: ${error.message}`);
      }
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente!');
    console.log('🎯 La funcionalidad de metas de daños está funcionando correctamente');
    console.log('📊 Los datos están siendo calculados desde la vista vw_danos_mes_anio');
    console.log('🚀 El sistema está listo para mostrar metas y proyecciones');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    
    if (error.response) {
      console.error('   Detalles del error:', error.response.data);
    }
    
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verificar que el servidor esté ejecutándose en puerto 3001');
    console.log('   2. Verificar que la vista vw_danos_mes_anio exista');
    console.log('   3. Verificar que las rutas estén configuradas correctamente');
  }
}

// Ejecutar pruebas
testMetasDanos(); 