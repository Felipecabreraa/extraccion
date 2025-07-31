const axios = require('axios');
const BASE_URL = 'http://localhost:3001';

// Datos de 2024 extraídos de la tabla del usuario (valores reales corregidos)
const datos2024 = [
  { mes: 1, valor_real: 5423159, valor_ppto: 3000000 }, // ene-24: $5.423.159
  { mes: 2, valor_real: 1915828, valor_ppto: 3000000 }, // feb-24: $1.915.828
  { mes: 3, valor_real: 4701026, valor_ppto: 3000000 }, // mar-24: $4.701.026
  { mes: 4, valor_real: 5808479, valor_ppto: 3000000 }, // abr-24: $5.808.479
  { mes: 5, valor_real: 1237170, valor_ppto: 3000000 }, // may-24: $1.237.170
  { mes: 6, valor_real: 224190, valor_ppto: 3000000 },  // jun-24: $224.190
  { mes: 7, valor_real: 1219156, valor_ppto: 3000000 }, // jul-24: $1.219.156
  { mes: 8, valor_real: 6742171, valor_ppto: 3000000 }, // ago-24: $6.742.171
  { mes: 9, valor_real: 630650, valor_ppto: 3000000 },  // sept-24: $630.650
  { mes: 10, valor_real: 3392808, valor_ppto: 3000000 }, // oct-24: $3.392.808
  { mes: 11, valor_real: 2663040, valor_ppto: 3000000 }, // nov-24: $2.663.040
  { mes: 12, valor_real: 4163992, valor_ppto: 3000000 } // dic-24: $4.163.992
];

// Datos de 2025 extraídos de la tabla del usuario
const datos2025 = [
  { mes: 1, valor_real: 2567211, valor_ppto: 3000000 }, // ene-25: $2.567.211
  { mes: 2, valor_real: 4650373, valor_ppto: 3000000 }, // feb-25: $4.650.373
  { mes: 3, valor_real: 1631680, valor_ppto: 3000000 }, // mar-25: $1.631.680
  { mes: 4, valor_real: 4992074, valor_ppto: 3000000 }, // abr-25: $4.992.074
  { mes: 5, valor_real: 230000, valor_ppto: 3000000 },  // may-25: $230.000
  { mes: 6, valor_real: 0, valor_ppto: 3000000 },       // jun-25: $0
  { mes: 7, valor_real: 0, valor_ppto: 3000000 },       // jul-25: $0
  { mes: 8, valor_real: 0, valor_ppto: 3000000 },       // ago-25: $0
  { mes: 9, valor_real: 0, valor_ppto: 3000000 },       // sept-25: $0
  { mes: 10, valor_real: 0, valor_ppto: 3000000 },      // oct-25: $0
  { mes: 11, valor_real: 0, valor_ppto: 3000000 },      // nov-25: $0
  { mes: 12, valor_real: 0, valor_ppto: 3000000 }       // dic-25: $0
];

async function cargarDatosCompletos() {
  try {
    console.log('🚀 Iniciando carga completa de datos de daños acumulados...\n');

    // 1. Cargar datos de 2024
    console.log('📊 Paso 1: Cargando datos de 2024...');
    let registros2024 = 0;
    
    for (const dato of datos2024) {
      try {
        const response = await axios.post(`${BASE_URL}/api/danos-acumulados/registro`, {
          anio: 2024,
          mes: dato.mes,
          valor_real: dato.valor_real,
          valor_ppto: dato.valor_ppto
        });

        if (response.data.success) {
          registros2024++;
          console.log(`✅ 2024 Mes ${dato.mes}: $${dato.valor_real.toLocaleString()}`);
        }
      } catch (error) {
        console.log(`❌ Error 2024 mes ${dato.mes}:`, error.response?.data?.message || error.message);
      }
    }

    console.log(`✅ Datos 2024 cargados: ${registros2024} registros\n`);

    // 2. Cargar datos de 2025
    console.log('📊 Paso 2: Cargando datos de 2025...');
    let registros2025 = 0;
    
    for (const dato of datos2025) {
      try {
        const response = await axios.post(`${BASE_URL}/api/danos-acumulados/registro`, {
          anio: 2025,
          mes: dato.mes,
          valor_real: dato.valor_real,
          valor_ppto: dato.valor_ppto
        });

        if (response.data.success) {
          registros2025++;
          console.log(`✅ 2025 Mes ${dato.mes}: $${dato.valor_real.toLocaleString()}`);
        }
      } catch (error) {
        console.log(`❌ Error 2025 mes ${dato.mes}:`, error.response?.data?.message || error.message);
      }
    }

    console.log(`✅ Datos 2025 cargados: ${registros2025} registros\n`);

    // 3. Configurar 2024 como año anterior para 2025
    console.log('📊 Paso 3: Configurando 2024 como año anterior para 2025...');
    try {
      const responseAnioAnterior = await axios.post(`${BASE_URL}/api/danos-acumulados/cargar-anio-anterior`, {
        anio_origen: 2024,
        anio_destino: 2025
      });

      if (responseAnioAnterior.data.success) {
        console.log(`✅ Año anterior configurado: ${responseAnioAnterior.data.data.registros_procesados} registros`);
      }
    } catch (error) {
      console.log(`❌ Error configurando año anterior:`, error.response?.data?.message || error.message);
    }

    // 4. Verificar datos finales
    console.log('\n📊 Paso 4: Verificando datos finales...');
    
    // Verificar 2024
    const response2024 = await axios.get(`${BASE_URL}/api/danos-acumulados?anio=2024`);
    if (response2024.data.success) {
      const datosCargados2024 = response2024.data.datos_grafico.filter(d => d.real_acumulado > 0);
      const totalReal2024 = datosCargados2024.reduce((sum, mes) => sum + (mes.real_acumulado - (datosCargados2024[datosCargados2024.indexOf(mes) - 1]?.real_acumulado || 0)), 0);
      console.log(`✅ 2024: ${datosCargados2024.length} meses con datos, Total: $${totalReal2024.toLocaleString()}`);
    }

    // Verificar 2025
    const response2025 = await axios.get(`${BASE_URL}/api/danos-acumulados?anio=2025`);
    if (response2025.data.success) {
      const datosCargados2025 = response2025.data.datos_grafico.filter(d => d.real_acumulado > 0);
      const totalReal2025 = datosCargados2025.reduce((sum, mes) => sum + (mes.real_acumulado - (datosCargados2025[datosCargados2025.indexOf(mes) - 1]?.real_acumulado || 0)), 0);
      console.log(`✅ 2025: ${datosCargados2025.length} meses con datos, Total: $${totalReal2025.toLocaleString()}`);
    }

    // 5. Calcular variación anual
    console.log('\n📊 Paso 5: Calculando variación anual...');
    try {
      const responseVariacion = await axios.post(`${BASE_URL}/api/danos-acumulados/calcular-variacion`, {
        anio_actual: 2025,
        anio_anterior: 2024
      });

      if (responseVariacion.data.success) {
        console.log(`✅ Variación anual calculada: ${responseVariacion.data.variacion.porcentual}%`);
        console.log(`📈 Interpretación: ${responseVariacion.data.variacion.interpretacion}`);
      }
    } catch (error) {
      console.log(`❌ Error calculando variación:`, error.response?.data?.message || error.message);
    }

    console.log('\n🎉 ¡Carga completa finalizada exitosamente!');
    console.log('📊 Ahora puedes acceder al sistema en: http://localhost:3000/danos-acumulados');
    console.log('📈 Los datos están listos para análisis y reportes');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

cargarDatosCompletos(); 