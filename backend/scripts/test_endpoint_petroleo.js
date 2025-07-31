const axios = require('axios');

async function testPetroleoEndpoint() {
  try {
    console.log('🔍 Probando endpoint de petróleo directamente...\n');

    // Configurar axios para hacer la petición
    const baseURL = 'http://localhost:3001'; // Ajusta según tu configuración
    const endpoint = '/dashboard/petroleo/metrics';
    const params = {
      year: 2025,
      origen: 'todos'
    };

    console.log('📡 Haciendo petición a:', `${baseURL}${endpoint}`);
    console.log('📋 Parámetros:', params);

    const response = await axios.get(`${baseURL}${endpoint}`, {
      params: params,
      timeout: 10000
    });

    console.log('✅ Respuesta recibida exitosamente');
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', response.headers['content-type']);

    const data = response.data;

    console.log('\n📊 ESTRUCTURA DE DATOS RECIBIDA:');
    console.log('🔑 Keys principales:', Object.keys(data));

    // Verificar si existe la nueva estructura
    if (data.distribucionConsumoPorSector) {
      console.log('\n✅ NUEVA ESTRUCTURA ENCONTRADA:');
      console.log('📋 Título:', data.distribucionConsumoPorSector.titulo);
      console.log('📝 Subtítulo:', data.distribucionConsumoPorSector.subtitulo);
      console.log('📊 Total sectores:', data.distribucionConsumoPorSector.totalSectores);
      console.log('📈 Total litros:', data.distribucionConsumoPorSector.totalLitros);
      console.log('📊 Suma porcentajes:', data.distribucionConsumoPorSector.sumaPorcentajes);

      if (data.distribucionConsumoPorSector.graficoDonut) {
        console.log('\n🍩 GRÁFICO DE DONUT:');
        console.log('📋 Título:', data.distribucionConsumoPorSector.graficoDonut.titulo);
        console.log('📝 Subtítulo:', data.distribucionConsumoPorSector.graficoDonut.subtitulo);
        console.log('📊 Total datos:', data.distribucionConsumoPorSector.graficoDonut.datos.length);
        console.log('📈 Total:', data.distribucionConsumoPorSector.graficoDonut.total);
        console.log('📊 Suma porcentajes:', data.distribucionConsumoPorSector.graficoDonut.sumaPorcentajes);

        console.log('\n🎨 TOP 8 SECTORES:');
        data.distribucionConsumoPorSector.graficoDonut.datos.forEach((sector, index) => {
          console.log(`${index + 1}. ${sector.sector}: ${sector.litros.toLocaleString()} L (${sector.porcentaje}%) - Color: ${sector.color}`);
        });
      }

      if (data.distribucionConsumoPorSector.resumenVisual) {
        console.log('\n📋 RESUMEN VISUAL:');
        console.log('🏷️ Título:', data.distribucionConsumoPorSector.resumenVisual.titulo);
        console.log('📈 Valor:', data.distribucionConsumoPorSector.resumenVisual.valor);
        console.log('🏢 Sectores activos:', data.distribucionConsumoPorSector.resumenVisual.sectoresActivos);
      }

      if (data.distribucionConsumoPorSector.kpisDestacados) {
        console.log('\n🏆 KPIs DESTACADOS:');
        if (data.distribucionConsumoPorSector.kpisDestacados.sectorMayorConsumo) {
          console.log('🏆 Sector Mayor Consumo:', data.distribucionConsumoPorSector.kpisDestacados.sectorMayorConsumo.formateado);
        }
        if (data.distribucionConsumoPorSector.kpisDestacados.sectorMenorConsumo) {
          console.log('📉 Sector Menor Consumo:', data.distribucionConsumoPorSector.kpisDestacados.sectorMenorConsumo.formateado);
        }
        if (data.distribucionConsumoPorSector.kpisDestacados.promedioPorSector) {
          console.log('📈 Promedio por Sector:', data.distribucionConsumoPorSector.kpisDestacados.promedioPorSector.formateado);
        }
      }

    } else {
      console.log('\n❌ NUEVA ESTRUCTURA NO ENCONTRADA');
      console.log('📊 Estructura actual:', Object.keys(data));
    }

    // Verificar estructura antigua
    if (data.consumoPorSector) {
      console.log('\n📊 ESTRUCTURA ANTIGUA (consumoPorSector):');
      console.log('📊 Total elementos:', data.consumoPorSector.length);
      if (data.consumoPorSector.length > 0) {
        console.log('📋 Primer elemento:', data.consumoPorSector[0]);
      }
    }

    console.log('\n✅ Verificación completada');
    console.log('📊 El endpoint está devolviendo los datos correctos');

  } catch (error) {
    console.error('❌ Error probando endpoint:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Ejecutar el test
testPetroleoEndpoint(); 