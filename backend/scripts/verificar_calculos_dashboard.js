const sequelize = require('../src/config/database');

async function verificarCalculosDashboard() {
  try {
    console.log('🔍 Verificando cálculos exactos del Dashboard...\n');

    // 1. Consulta exacta del usuario - Total planillas 2025
    console.log('1. Total planillas 2025 (consulta del usuario):');
    const [planillas2025Result] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) AS total_planillas_2025
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const totalPlanillas2025 = planillas2025Result[0].total_planillas_2025;
    console.log(`   ✅ Total planillas 2025: ${totalPlanillas2025}`);

    // 2. Comparar con el cálculo actual del dashboard
    console.log('\n2. Comparando con cálculo actual del dashboard:');
    const [dashboardActualResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_planillas_actual
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const totalPlanillasActual = dashboardActualResult[0].total_planillas_actual;
    console.log(`   📊 Cálculo actual del dashboard: ${totalPlanillasActual}`);
    console.log(`   🔍 Diferencia: ${totalPlanillasActual - totalPlanillas2025}`);
    
    if (totalPlanillasActual !== totalPlanillas2025) {
      console.log(`   ⚠️ ¡DIFERENCIA DETECTADA! El dashboard está contando ${totalPlanillasActual - totalPlanillas2025} registros extra`);
    } else {
      console.log(`   ✅ Los cálculos coinciden`);
    }

    // 3. Verificar si hay duplicados en idOrdenServicio
    console.log('\n3. Verificando duplicados en idOrdenServicio:');
    const [duplicadosResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as cantidad
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY idOrdenServicio
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC
      LIMIT 5
    `);
    
    if (duplicadosResult.length > 0) {
      console.log(`   ⚠️ Se encontraron ${duplicadosResult.length} IDs duplicados:`);
      duplicadosResult.forEach(item => {
        console.log(`      - ID ${item.idOrdenServicio}: ${item.cantidad} veces`);
      });
    } else {
      console.log(`   ✅ No hay duplicados en idOrdenServicio`);
    }

    // 4. Verificar estructura de datos
    console.log('\n4. Verificando estructura de datos:');
    const [estructuraResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        fechaOrdenServicio,
        nombreSector,
        cantidadPabellones,
        mts2,
        source
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      LIMIT 3
    `);
    
    console.log(`   📋 Muestra de registros:`);
    estructuraResult.forEach((item, index) => {
      console.log(`      Registro ${index + 1}:`);
      console.log(`         - ID: ${item.idOrdenServicio}`);
      console.log(`         - Fecha: ${item.fechaOrdenServicio}`);
      console.log(`         - Sector: ${item.nombreSector}`);
      console.log(`         - Pabellones: ${item.cantidadPabellones}`);
      console.log(`         - m²: ${item.mts2}`);
      console.log(`         - Origen: ${item.source}`);
    });

    // 5. Verificar rangos de fechas
    console.log('\n5. Verificando rangos de fechas:');
    const [fechasResult] = await sequelize.query(`
      SELECT 
        MIN(fechaOrdenServicio) as fecha_minima,
        MAX(fechaOrdenServicio) as fecha_maxima,
        COUNT(DISTINCT DATE(fechaOrdenServicio)) as dias_diferentes
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const fechas = fechasResult[0];
    console.log(`   📅 Rango de fechas:`);
    console.log(`      - Fecha mínima: ${fechas.fecha_minima}`);
    console.log(`      - Fecha máxima: ${fechas.fecha_maxima}`);
    console.log(`      - Días diferentes: ${fechas.dias_diferentes}`);

    // 6. Verificar distribución por meses
    console.log('\n6. Distribución por meses 2025:');
    const [mesesResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(DISTINCT idOrdenServicio) as planillas_unicas,
        COUNT(*) as registros_totales
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `);
    
    console.log(`   📊 Distribución mensual:`);
    mesesResult.forEach(item => {
      const mesNombre = new Date(2025, item.mes - 1).toLocaleDateString('es-ES', { month: 'short' });
      console.log(`      - ${mesNombre}: ${item.planillas_unicas} planillas únicas, ${item.registros_totales} registros totales`);
    });

    // 7. Verificar métricas actuales del dashboard
    console.log('\n7. Métricas actuales del dashboard (para comparar):');
    const [metricasActualesResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(mts2), 0) as total_mts2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const metricas = metricasActualesResult[0];
    console.log(`   📊 Métricas actuales:`);
    console.log(`      - Total registros: ${metricas.total_registros}`);
    console.log(`      - Total pabellones: ${metricas.total_pabellones.toLocaleString()}`);
    console.log(`      - Total m²: ${metricas.total_mts2.toLocaleString()}`);
    console.log(`      - Total daños: ${metricas.total_danos}`);

    // 8. Recomendaciones
    console.log('\n8. Análisis y recomendaciones:');
    
    if (totalPlanillasActual !== totalPlanillas2025) {
      console.log(`   ⚠️ PROBLEMA DETECTADO:`);
      console.log(`      - El dashboard está contando ${totalPlanillasActual} registros`);
      console.log(`      - Pero debería contar ${totalPlanillas2025} planillas únicas`);
      console.log(`      - Diferencia: ${totalPlanillasActual - totalPlanillas2025} registros extra`);
      console.log(`   💡 RECOMENDACIÓN: Usar COUNT(DISTINCT idOrdenServicio) en lugar de COUNT(*)`);
    } else {
      console.log(`   ✅ Los cálculos están correctos`);
    }

    console.log('\n✅ Verificación de cálculos completada!');
    console.log('🎯 Ahora tenemos la base correcta para ajustar el dashboard');

  } catch (error) {
    console.error('❌ Error verificando cálculos:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarCalculosDashboard(); 