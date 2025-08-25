const axios = require('axios');

async function investigarSeptiembre() {
  try {
    console.log('🔍 Investigando por qué septiembre muestra $-14.491.541...\n');
    
    // 1. Verificar datos de la API
    console.log('📊 1. Datos de la API:');
    const response = await axios.get('http://localhost:3001/api/danos-acumulados?anio=2025');
    
    // Mostrar todos los meses para ver el patrón
    response.data.datos_grafico.forEach(dato => {
      console.log(`${dato.nombreMes}:`);
      console.log(`  - Valor Real: ${dato.valor_real_formateado} (${dato.valor_real})`);
      console.log(`  - Real Acumulado: ${dato.real_acumulado_formateado} (${dato.real_acumulado})`);
    });
    
    // 2. Verificar datos de la vista directamente
    console.log('\n📊 2. Datos de la vista:');
    try {
      const responseVista = await axios.get('http://localhost:3001/api/danos-acumulados/vista-raw?anio=2025');
      if (responseVista.data && responseVista.data.datos) {
        responseVista.data.datos.forEach(dato => {
          console.log(`  Mes ${dato.mes}: Real=${dato.valor_real}, Acumulado=${dato.real_acumulado}`);
        });
      }
    } catch (error) {
      console.log('  ❌ No se pudo acceder a la vista:', error.message);
    }
    
    // 3. Verificar datos de la tabla base
    console.log('\n📊 3. Datos de la tabla:');
    try {
      const responseTabla = await axios.get('http://localhost:3001/api/danos-acumulados/tabla-raw?anio=2025');
      if (responseTabla.data && responseTabla.data.datos) {
        responseTabla.data.datos.forEach(dato => {
          console.log(`  Mes ${dato.mes}: Real=${dato.valor_real}, Ppto=${dato.valor_ppto}`);
        });
      }
    } catch (error) {
      console.log('  ❌ No se pudo acceder a la tabla:', error.message);
    }
    
    // 4. Análisis específico de septiembre
    console.log('\n🔍 4. Análisis específico de septiembre:');
    const septiembre = response.data.datos_grafico.find(d => d.mes === 9);
    if (septiembre) {
      console.log(`  - Valor Real: ${septiembre.valor_real_formateado} (${septiembre.valor_real})`);
      console.log(`  - Real Acumulado: ${septiembre.real_acumulado_formateado} (${septiembre.real_acumulado})`);
      
      if (septiembre.valor_real < 0) {
        console.log('  ❌ PROBLEMA: Valor real es negativo');
      }
      
      if (septiembre.real_acumulado < 0) {
        console.log('  ❌ PROBLEMA: Real acumulado es negativo');
      }
    }
    
    // 5. Verificar estado de datos
    console.log('\n📋 5. Estado de datos:');
    console.log(`  - Mes actual: ${response.data.estado_datos?.nombre_mes_actual}`);
    console.log(`  - Mes límite: ${response.data.estado_datos?.nombre_mes_limite}`);
    console.log(`  - Descripción: ${response.data.estado_datos?.descripcion}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar investigación
investigarSeptiembre();

