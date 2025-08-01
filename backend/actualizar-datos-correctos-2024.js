const axios = require('axios');
const BASE_URL = 'http://localhost:3001';

// Datos CORRECTOS de 2024 según la tabla del usuario
const datosCorrectos2024 = [
  { mes: 1, valor_real: 5423159, valor_ppto: 3000000 }, // ene-24: $5.423.159
  { mes: 2, valor_real: 1915828, valor_ppto: 3000000 }, // feb-24: $1.915.828
  { mes: 3, valor_real: 4701026, valor_ppto: 3000000 }, // mar-24: $4.701.026
  { mes: 4, valor_real: 5808479, valor_ppto: 3000000 }, // abr-24: $5.808.479
  { mes: 5, valor_real: 1237170, valor_ppto: 3000000 }, // may-24: $1.237.170
  { mes: 6, valor_real: 224190, valor_ppto: 3000000 },   // jun-24: $224.190
  { mes: 7, valor_real: 1219156, valor_ppto: 3000000 },  // jul-24: $1.219.156
  { mes: 8, valor_real: 6742171, valor_ppto: 3000000 },  // ago-24: $6.742.171
  { mes: 9, valor_real: 630650, valor_ppto: 3000000 },   // sept-24: $630.650
  { mes: 10, valor_real: 3392808, valor_ppto: 3000000 }, // oct-24: $3.392.808
  { mes: 11, valor_real: 2663040, valor_ppto: 3000000 }, // nov-24: $2.663.040
  { mes: 12, valor_real: 4163992, valor_ppto: 3000000 }  // dic-24: $4.163.992
];

async function actualizarDatosCorrectos2024() {
  try {
    console.log('🔄 Actualizando datos de 2024 con valores CORRECTOS...\n');

    let registrosActualizados = 0;
    let totalReal = 0;

    for (const dato of datosCorrectos2024) {
      try {
        const response = await axios.post(`${BASE_URL}/api/danos-acumulados/registro`, {
          anio: 2024,
          mes: dato.mes,
          valor_real: dato.valor_real,
          valor_ppto: dato.valor_ppto
        });

        if (response.data.success) {
          registrosActualizados++;
          totalReal += dato.valor_real;
          console.log(`✅ Mes ${dato.mes}: Actualizado - Real: $${dato.valor_real.toLocaleString()}`);
        }
      } catch (error) {
        console.log(`❌ Error en mes ${dato.mes}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n📈 Resumen de actualización:');
    console.log(`✅ Registros actualizados: ${registrosActualizados}`);
    console.log(`💰 Total Real 2024: $${totalReal.toLocaleString()}`);
    console.log(`💰 Total esperado según tabla: $38,121,669`);

    // Verificar datos actualizados
    console.log('\n🔍 Verificando datos actualizados...');
    const responseVerificacion = await axios.get(`${BASE_URL}/api/danos-acumulados?anio=2024`);
    
    if (responseVerificacion.data.success) {
      const datosCargados = responseVerificacion.data.datos_grafico.filter(d => d.real_acumulado > 0);
      console.log(`✅ Datos verificados: ${datosCargados.length} meses con datos`);
      
      // Mostrar totales
      const totalRealVerificado = datosCargados.reduce((sum, mes) => sum + (mes.real_acumulado - (datosCargados[datosCargados.indexOf(mes) - 1]?.real_acumulado || 0)), 0);
      
      console.log(`💰 Total Real 2024 (verificado): $${totalRealVerificado.toLocaleString()}`);
      console.log(`💰 Total esperado: $38,121,669`);
      
      if (totalRealVerificado === 38121669) {
        console.log('✅ ¡Datos actualizados correctamente!');
      } else {
        console.log('❌ Los datos no coinciden con lo esperado');
      }
    }

    console.log('\n✅ Actualización de datos 2024 completada');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

actualizarDatosCorrectos2024(); 