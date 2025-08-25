const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

async function corregirDatosDanos() {
  try {
    console.log('🔧 Corrigiendo datos de daños acumulados...\n');
    
    // Datos correctos según la explicación del usuario
    const datosCorrectos = [
      { anio: 2025, mes: 1, valor_real: 2567211, valor_ppto: 3000000 },
      { anio: 2025, mes: 2, valor_real: 4650373, valor_ppto: 3000000 },
      { anio: 2025, mes: 3, valor_real: 1631680, valor_ppto: 3000000 },
      { anio: 2025, mes: 4, valor_real: 4992074, valor_ppto: 3000000 },
      { anio: 2025, mes: 5, valor_real: 230000, valor_ppto: 3000000 },
      { anio: 2025, mes: 6, valor_real: 0, valor_ppto: 3000000 }, // Sin notas de cobro
      { anio: 2025, mes: 7, valor_real: 420203, valor_ppto: 3000000 },
      { anio: 2025, mes: 8, valor_real: 0, valor_ppto: 3000000 }, // Sin notas de cobro
      { anio: 2025, mes: 9, valor_real: 0, valor_ppto: 3000000 }, // Sin notas de cobro
      { anio: 2025, mes: 10, valor_real: 0, valor_ppto: 3000000 },
      { anio: 2025, mes: 11, valor_real: 0, valor_ppto: 3000000 },
      { anio: 2025, mes: 12, valor_real: 0, valor_ppto: 3000000 }
    ];
    
    console.log('📋 Datos correctos a aplicar:');
    datosCorrectos.forEach(dato => {
      console.log(`  Mes ${dato.mes}: Real = $${dato.valor_real.toLocaleString()}, Ppto = $${dato.valor_ppto.toLocaleString()}`);
    });
    
    console.log('\n🔄 Actualizando datos en la base de datos...');
    
    // Actualizar cada mes
    for (const dato of datosCorrectos) {
      try {
        const response = await axios.post(`${API_BASE_URL}/danos-acumulados/registro`, {
          anio: dato.anio,
          mes: dato.mes,
          valor_real: dato.valor_real,
          valor_ppto: dato.valor_ppto
        });
        
        console.log(`✅ Mes ${dato.mes}: ${response.data.message}`);
        
      } catch (error) {
        console.error(`❌ Error actualizando mes ${dato.mes}:`, error.message);
      }
    }
    
    console.log('\n🧪 Verificando datos corregidos...');
    
    // Verificar los datos actualizados
    const response = await axios.get(`${API_BASE_URL}/danos-acumulados?anio=2025`);
    
    console.log('\n📊 Datos verificados:');
    response.data.datos_grafico.forEach(dato => {
      console.log(`  ${dato.nombreMes}:`);
      console.log(`    - Valor Real: ${dato.valor_real_formateado}`);
      console.log(`    - Valor Ppto: ${dato.valor_ppto_formateado}`);
      console.log(`    - Real Acumulado: ${dato.real_acumulado_formateado}`);
      console.log(`    - Ppto Acumulado: ${dato.ppto_acumulado_formateado}`);
    });
    
    console.log('\n✅ Corrección de datos completada exitosamente');
    console.log('\n🎯 Resumen de la lógica aplicada:');
    console.log('   ✅ Valor Real: Se ingresa manualmente con las notas de cobro');
    console.log('   ✅ Real Acumulado: Se va sumando mes a mes, manteniendo el valor anterior si no hay datos nuevos');
    console.log('   ✅ Presupuesto: Fijo de $3M mensual');
    console.log('   ✅ Línea del gráfico: Se extiende hasta el mes actual del calendario');
    
  } catch (error) {
    console.error('❌ Error corrigiendo datos:', error.message);
    if (error.response) {
      console.error('📋 Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar corrección
corregirDatosDanos();

