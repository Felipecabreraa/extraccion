const axios = require('axios');
const BASE_URL = 'http://localhost:3001';

async function analizarMigracionDanos() {
  try {
    console.log('🔍 Analizando migración de daños...\n');

    // 1. Verificar datos en la tabla unificada
    console.log('📊 Paso 1: Verificando datos en migracion_ordenes_2025...');
    
    try {
      const responseUnificada = await axios.get(`${BASE_URL}/api/danos-acumulados/verificar-migracion`);
      
      if (responseUnificada.data.success) {
        const datos = responseUnificada.data;
        console.log(`✅ Registros en migracion_ordenes_2025: ${datos.total_registros}`);
        console.log(`✅ Daños únicos: ${datos.danos_unicos}`);
        console.log(`✅ Registros duplicados: ${datos.duplicados}`);
        console.log(`✅ Registros válidos: ${datos.registros_validos}`);
        
        if (datos.duplicados > 0) {
          console.log(`⚠️ Se encontraron ${datos.duplicados} registros duplicados`);
        }
      }
    } catch (error) {
      console.log('❌ No se pudo verificar migración:', error.response?.data?.message || error.message);
    }

    // 2. Verificar datos originales de daños
    console.log('\n📊 Paso 2: Verificando datos originales de daños...');
    
    try {
      const responseOriginal = await axios.get(`${BASE_URL}/api/danos/estadisticas`);
      
      if (responseOriginal.data.success) {
        const stats = responseOriginal.data;
        console.log(`✅ Total registros en tabla daños: ${stats.total_registros}`);
        console.log(`✅ Registros con valor > 0: ${stats.registros_con_valor}`);
        console.log(`✅ Total valor daños: $${stats.total_valor.toLocaleString()}`);
        console.log(`✅ Promedio por registro: $${stats.promedio.toLocaleString()}`);
      }
    } catch (error) {
      console.log('❌ No se pudo verificar datos originales:', error.response?.data?.message || error.message);
    }

    // 3. Comparar con datos de reporte de daños acumulados
    console.log('\n📊 Paso 3: Verificando reporte de daños acumulados...');
    
    try {
      const response2025 = await axios.get(`${BASE_URL}/api/danos-acumulados?anio=2025`);
      
      if (response2025.data.success) {
        const datos2025 = response2025.data.datos_grafico.filter(d => d.real_acumulado > 0);
        console.log(`✅ Meses con datos en 2025: ${datos2025.length}`);
        
        const totalReal2025 = datos2025.reduce((sum, mes) => {
          const valorMes = mes.real_acumulado - (datos2025[datos2025.indexOf(mes) - 1]?.real_acumulado || 0);
          return sum + valorMes;
        }, 0);
        
        console.log(`💰 Total Real 2025: $${totalReal2025.toLocaleString()}`);
        console.log(`📈 Acumulado 2025: $${datos2025[datos2025.length - 1]?.real_acumulado.toLocaleString() || 0}`);
      }
    } catch (error) {
      console.log('❌ No se pudo verificar reporte acumulado:', error.response?.data?.message || error.message);
    }

    // 4. Análisis de discrepancia
    console.log('\n📊 Paso 4: Análisis de discrepancia...');
    console.log('🔍 Problemas identificados:');
    console.log('   - Registros migrados: 1,085');
    console.log('   - Daños totales esperados: 550');
    console.log('   - Diferencia: 535 registros');
    console.log('\n💡 Posibles causas:');
    console.log('   1. Registros duplicados en la migración');
    console.log('   2. Registros con valores nulos o cero');
    console.log('   3. Filtros aplicados incorrectamente');
    console.log('   4. Criterios de selección diferentes');

    // 5. Recomendaciones
    console.log('\n🎯 Recomendaciones:');
    console.log('   1. Revisar criterios de migración');
    console.log('   2. Eliminar duplicados si existen');
    console.log('   3. Verificar filtros aplicados');
    console.log('   4. Recalcular totales después de limpieza');

    console.log('\n✅ Análisis completado');
    console.log('📋 Revisa los logs para identificar la causa de la discrepancia');

  } catch (error) {
    console.error('❌ Error en el análisis:', error.message);
  }
}

analizarMigracionDanos(); 