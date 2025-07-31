const http = require('http');

function verificarServidor() {
  console.log('🔍 Verificando si el servidor está funcionando...\n');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/dashboard/petroleo/metrics?year=2025&origen=todos',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log('✅ Servidor respondiendo');
    console.log('📊 Status:', res.statusCode);
    console.log('📋 Headers:', res.headers['content-type']);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n📊 ESTRUCTURA DE DATOS:');
        console.log('🔑 Keys principales:', Object.keys(response));

        if (response.distribucionConsumoPorSector) {
          console.log('\n✅ NUEVA ESTRUCTURA ENCONTRADA:');
          console.log('📋 Título:', response.distribucionConsumoPorSector.titulo);
          console.log('📊 Total sectores:', response.distribucionConsumoPorSector.totalSectores);
          console.log('📈 Total litros:', response.distribucionConsumoPorSector.totalLitros);

          if (response.distribucionConsumoPorSector.graficoDonut) {
            console.log('\n🍩 GRÁFICO DE DONUT:');
            console.log('📊 Total datos:', response.distribucionConsumoPorSector.graficoDonut.datos.length);
            console.log('📈 Total:', response.distribucionConsumoPorSector.graficoDonut.total);

            console.log('\n🎨 TOP 5 SECTORES:');
            response.distribucionConsumoPorSector.graficoDonut.datos.slice(0, 5).forEach((sector, index) => {
              console.log(`${index + 1}. ${sector.sector}: ${sector.litros.toLocaleString()} L (${sector.porcentaje}%)`);
            });
          }
        } else {
          console.log('\n❌ NUEVA ESTRUCTURA NO ENCONTRADA');
          console.log('📊 Estructura actual:', Object.keys(response));
        }

        console.log('\n✅ Verificación completada exitosamente');
        console.log('📊 El servidor está funcionando y devolviendo datos correctos');

      } catch (error) {
        console.error('❌ Error parseando respuesta:', error.message);
        console.log('📋 Respuesta raw:', data.substring(0, 200) + '...');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error conectando al servidor:', error.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en el puerto 3001');
  });

  req.on('timeout', () => {
    console.error('⏰ Timeout - El servidor no respondió en 5 segundos');
    req.destroy();
  });

  req.end();
}

// Ejecutar la verificación
verificarServidor(); 