const axios = require('axios');
const BASE_URL = 'http://localhost:3001';

async function limpiarMigracionDanos() {
  try {
    console.log('🧹 Iniciando limpieza de migración de daños...\n');

    // 1. Verificar estado actual
    console.log('📊 Paso 1: Verificando estado actual...');
    
    try {
      const responseEstado = await axios.get(`${BASE_URL}/api/danos-acumulados/estado-migracion`);
      
      if (responseEstado.data.success) {
        const estado = responseEstado.data;
        console.log(`📈 Estado actual:`);
        console.log(`   - Registros totales: ${estado.total_registros}`);
        console.log(`   - Registros válidos: ${estado.registros_validos}`);
        console.log(`   - Registros duplicados: ${estado.duplicados}`);
        console.log(`   - Registros con valor 0: ${estado.registros_cero}`);
        console.log(`   - Registros nulos: ${estado.registros_nulos}`);
      }
    } catch (error) {
      console.log('❌ No se pudo verificar estado:', error.response?.data?.message || error.message);
    }

    // 2. Limpiar duplicados
    console.log('\n📊 Paso 2: Limpiando duplicados...');
    
    try {
      const responseLimpiar = await axios.post(`${BASE_URL}/api/danos-acumulados/limpiar-duplicados`);
      
      if (responseLimpiar.data.success) {
        const resultado = responseLimpiar.data;
        console.log(`✅ Duplicados eliminados: ${resultado.duplicados_eliminados}`);
        console.log(`✅ Registros restantes: ${resultado.registros_restantes}`);
      }
    } catch (error) {
      console.log('❌ No se pudieron limpiar duplicados:', error.response?.data?.message || error.message);
    }

    // 3. Eliminar registros con valor 0 o nulos
    console.log('\n📊 Paso 3: Eliminando registros inválidos...');
    
    try {
      const responseEliminar = await axios.post(`${BASE_URL}/api/danos-acumulados/eliminar-invalidos`);
      
      if (responseEliminar.data.success) {
        const resultado = responseEliminar.data;
        console.log(`✅ Registros inválidos eliminados: ${resultado.registros_eliminados}`);
        console.log(`✅ Registros válidos restantes: ${resultado.registros_validos}`);
      }
    } catch (error) {
      console.log('❌ No se pudieron eliminar registros inválidos:', error.response?.data?.message || error.message);
    }

    // 4. Recalcular totales
    console.log('\n📊 Paso 4: Recalculando totales...');
    
    try {
      const responseRecalcular = await axios.post(`${BASE_URL}/api/danos-acumulados/recalcular-totales`);
      
      if (responseRecalcular.data.success) {
        const resultado = responseRecalcular.data;
        console.log(`✅ Totales recalculados:`);
        console.log(`   - Total real: $${resultado.total_real.toLocaleString()}`);
        console.log(`   - Total presupuesto: $${resultado.total_presupuesto.toLocaleString()}`);
        console.log(`   - Registros procesados: ${resultado.registros_procesados}`);
      }
    } catch (error) {
      console.log('❌ No se pudieron recalcular totales:', error.response?.data?.message || error.message);
    }

    // 5. Verificar estado final
    console.log('\n📊 Paso 5: Verificando estado final...');
    
    try {
      const responseFinal = await axios.get(`${BASE_URL}/api/danos-acumulados/estado-migracion`);
      
      if (responseFinal.data.success) {
        const estadoFinal = responseFinal.data;
        console.log(`📈 Estado final:`);
        console.log(`   - Registros totales: ${estadoFinal.total_registros}`);
        console.log(`   - Registros válidos: ${estadoFinal.registros_validos}`);
        console.log(`   - Total valor: $${estadoFinal.total_valor.toLocaleString()}`);
        console.log(`   - Promedio por registro: $${estadoFinal.promedio.toLocaleString()}`);
      }
    } catch (error) {
      console.log('❌ No se pudo verificar estado final:', error.response?.data?.message || error.message);
    }

    // 6. Actualizar reporte de daños acumulados
    console.log('\n📊 Paso 6: Actualizando reporte de daños acumulados...');
    
    try {
      const responseActualizar = await axios.post(`${BASE_URL}/api/danos-acumulados/actualizar-desde-migracion`, {
        anio: 2025
      });
      
      if (responseActualizar.data.success) {
        const resultado = responseActualizar.data;
        console.log(`✅ Reporte actualizado:`);
        console.log(`   - Registros procesados: ${resultado.registros_procesados}`);
        console.log(`   - Total actualizado: $${resultado.total_actualizado.toLocaleString()}`);
        console.log(`   - Meses actualizados: ${resultado.meses_actualizados}`);
      }
    } catch (error) {
      console.log('❌ No se pudo actualizar reporte:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 ¡Limpieza completada exitosamente!');
    console.log('📊 Ahora puedes verificar los datos en: http://localhost:3000/danos-acumulados');

  } catch (error) {
    console.error('❌ Error en la limpieza:', error.message);
  }
}

limpiarMigracionDanos(); 