const axios = require('axios');
const BASE_URL = 'http://localhost:3001';

// Datos de 2024 extraídos de la tabla del usuario
const datos2024 = [
  { mes: 1, valor_real: 2567211, valor_ppto: 3000000 }, // ene-24: $2.567.211
  { mes: 2, valor_real: 4650373, valor_ppto: 3000000 }, // feb-24: $4.650.373
  { mes: 3, valor_real: 1631680, valor_ppto: 3000000 }, // mar-24: $1.631.680
  { mes: 4, valor_real: 4992074, valor_ppto: 3000000 }, // abr-24: $4.992.074
  { mes: 5, valor_real: 230000, valor_ppto: 3000000 },  // may-24: $230.000
  { mes: 6, valor_real: 224190, valor_ppto: 3000000 },   // jun-24: $224.190
  { mes: 7, valor_real: 0, valor_ppto: 3000000 },        // jul-24: $0
  { mes: 8, valor_real: 6742171, valor_ppto: 3000000 },  // ago-24: $6.742.171
  { mes: 9, valor_real: 0, valor_ppto: 3000000 },        // sept-24: $0
  { mes: 10, valor_real: 0, valor_ppto: 3000000 },       // oct-24: $0
  { mes: 11, valor_real: 0, valor_ppto: 3000000 },       // nov-24: $0
  { mes: 12, valor_real: 0, valor_ppto: 3000000 }        // dic-24: $0
];

async function cargarDatos2024() {
  try {
    console.log('📊 Cargando datos de 2024 desde la tabla del usuario...\n');

    let registrosCargados = 0;
    let registrosActualizados = 0;

    for (const dato of datos2024) {
      try {
        const response = await axios.post(`${BASE_URL}/api/danos-acumulados/registro`, {
          anio: 2024,
          mes: dato.mes,
          valor_real: dato.valor_real,
          valor_ppto: dato.valor_ppto
        });

        if (response.data.success) {
          if (response.data.data.creado) {
            registrosCargados++;
            console.log(`✅ Mes ${dato.mes}: Creado - Real: $${dato.valor_real.toLocaleString()}, Ppto: $${dato.valor_ppto.toLocaleString()}`);
          } else {
            registrosActualizados++;
            console.log(`🔄 Mes ${dato.mes}: Actualizado - Real: $${dato.valor_real.toLocaleString()}, Ppto: $${dato.valor_ppto.toLocaleString()}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error en mes ${dato.mes}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n📈 Resumen de carga:');
    console.log(`✅ Registros creados: ${registrosCargados}`);
    console.log(`🔄 Registros actualizados: ${registrosActualizados}`);
    console.log(`📊 Total procesados: ${registrosCargados + registrosActualizados}`);

    // Verificar datos cargados
    console.log('\n🔍 Verificando datos cargados...');
    const responseVerificacion = await axios.get(`${BASE_URL}/api/danos-acumulados?anio=2024`);
    
    if (responseVerificacion.data.success) {
      const datosCargados = responseVerificacion.data.datos_grafico.filter(d => d.real_acumulado > 0);
      console.log(`✅ Datos verificados: ${datosCargados.length} meses con datos`);
      
      // Mostrar totales
      const totalReal = datosCargados.reduce((sum, mes) => sum + (mes.real_acumulado - (datosCargados[datosCargados.indexOf(mes) - 1]?.real_acumulado || 0)), 0);
      const totalPpto = datosCargados.reduce((sum, mes) => sum + (mes.ppto_acumulado - (datosCargados[datosCargados.indexOf(mes) - 1]?.ppto_acumulado || 0)), 0);
      
      console.log(`💰 Total Real 2024: $${totalReal.toLocaleString()}`);
      console.log(`💰 Total Presupuesto 2024: $${totalPpto.toLocaleString()}`);
    }

    console.log('\n✅ Carga de datos 2024 completada exitosamente');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

cargarDatos2024(); 