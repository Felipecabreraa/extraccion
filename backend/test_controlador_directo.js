const sequelize = require('./src/config/database');

async function testControladorDirecto() {
  try {
    console.log('🧪 Probando controlador directamente...');
    
    // Simular parámetros de request
    const req = {
      query: {
        year: '2025',
        porcentaje: '5.0'
      }
    };
    
    const res = {
      json: (data) => {
        console.log('✅ Respuesta del controlador:');
        console.log('📊 Configuración:', data.configuracion);
        console.log('📊 Datos año actual:', data.datosAnioActual);
        
        console.log('\n📊 DATOS MENSUALES:');
        data.datosMensuales.forEach(mes => {
          if (mes.tieneDatos) {
                     console.log(`   ${mes.nombreMes}:`);
         console.log(`     - Daños reales: ${mes.danosReales} (tipo: ${typeof mes.danosReales})`);
         console.log(`     - Acumulado real: ${mes.acumuladoReal} (tipo: ${typeof mes.acumuladoReal})`);
         console.log(`     - Daños año anterior: ${mes.danosAnioAnterior} (tipo: ${typeof mes.danosAnioAnterior})`);
         console.log(`     - Acumulado año anterior: ${mes.acumuladoAnioAnterior} (tipo: ${typeof mes.acumuladoAnioAnterior})`);
         console.log(`     - Meta mensual: ${mes.metaMensual} (tipo: ${typeof mes.metaMensual})`);
         console.log(`     - Acumulado meta: ${mes.acumuladoMeta} (tipo: ${typeof mes.acumuladoMeta})`);
          }
        });
      }
    };
    
    // Importar y ejecutar el controlador directamente
    const danoMetaController = require('./src/controllers/danoMetaController');
    await danoMetaController.getDanoMetaStats(req, res);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testControladorDirecto(); 