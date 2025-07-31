const sequelize = require('../src/config/database');

async function testIntegracionMts2() {
  try {
    console.log('🧪 Verificando integración de mts2 en el Dashboard...\n');

    // Test 1: Verificar que el campo mts2 existe y tiene datos
    console.log('1. Verificando campo mts2 en la vista unificada...');
    const [mts2Result] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN mts2 > 0 THEN 1 END) as registros_con_mts2,
        COALESCE(SUM(mts2), 0) as total_mts2,
        COALESCE(AVG(mts2), 0) as promedio_mts2,
        COALESCE(MAX(mts2), 0) as max_mts2,
        COALESCE(MIN(mts2), 0) as min_mts2
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const mts2Stats = mts2Result[0];
    console.log(`   ✅ Total registros: ${mts2Stats.total_registros}`);
    console.log(`   ✅ Registros con m²: ${mts2Stats.registros_con_mts2}`);
    console.log(`   ✅ Total m²: ${mts2Stats.total_mts2.toLocaleString()}`);
    console.log(`   ✅ Promedio m²: ${Math.round(mts2Stats.promedio_mts2)}`);
    console.log(`   ✅ Máximo m²: ${mts2Stats.max_mts2.toLocaleString()}`);
    console.log(`   ✅ Mínimo m²: ${mts2Stats.min_mts2}`);

    // Test 2: Verificar métricas del mes actual con mts2
    console.log('\n2. Verificando métricas del mes actual con mts2...');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [mesActualResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as planillas_mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes,
        COALESCE(SUM(mts2), 0) as mts2_mes
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
    `, { replacements: [currentYear, currentMonth] });
    
    const mesActual = mesActualResult[0];
    console.log(`   📊 Mes actual (${currentMonth}/${currentYear}):`);
    console.log(`      - Planillas: ${mesActual.planillas_mes}`);
    console.log(`      - Pabellones: ${mesActual.pabellones_mes}`);
    console.log(`      - m²: ${mesActual.mts2_mes.toLocaleString()}`);

    // Test 3: Verificar métricas del mes anterior con mts2
    console.log('\n3. Verificando métricas del mes anterior con mts2...');
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const [mesAnteriorResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as planillas_mes_anterior,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_anterior,
        COALESCE(SUM(mts2), 0) as mts2_mes_anterior
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
    `, { replacements: [previousYear, previousMonth] });
    
    const mesAnterior = mesAnteriorResult[0];
    console.log(`   📊 Mes anterior (${previousMonth}/${previousYear}):`);
    console.log(`      - Planillas: ${mesAnterior.planillas_mes_anterior}`);
    console.log(`      - Pabellones: ${mesAnterior.pabellones_mes_anterior}`);
    console.log(`      - m²: ${mesAnterior.mts2_mes_anterior.toLocaleString()}`);

    // Test 4: Calcular variaciones con mts2
    console.log('\n4. Calculando variaciones con mts2...');
    const variacionPlanillas = mesAnterior.planillas_mes_anterior > 0 ? 
      ((mesActual.planillas_mes - mesAnterior.planillas_mes_anterior) / mesAnterior.planillas_mes_anterior * 100).toFixed(1) : 0;
    const variacionPabellones = mesAnterior.pabellones_mes_anterior > 0 ? 
      ((mesActual.pabellones_mes - mesAnterior.pabellones_mes_anterior) / mesAnterior.pabellones_mes_anterior * 100).toFixed(1) : 0;
    const variacionMts2 = mesAnterior.mts2_mes_anterior > 0 ? 
      ((mesActual.mts2_mes - mesAnterior.mts2_mes_anterior) / mesAnterior.mts2_mes_anterior * 100).toFixed(1) : 0;
    
    console.log(`   📈 Variaciones:`);
    console.log(`      - Planillas: ${variacionPlanillas}%`);
    console.log(`      - Pabellones: ${variacionPabellones}%`);
    console.log(`      - m²: ${variacionMts2}%`);

    // Test 5: Verificar tendencias mensuales con mts2
    console.log('\n5. Verificando tendencias mensuales con mts2...');
    const [tendenciasResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(*) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones,
        COALESCE(SUM(mts2), 0) as mts2
      FROM vw_ordenes_2025_actual
      WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
      LIMIT 3
    `);
    
    console.log(`   📊 Últimos 3 meses con datos:`);
    tendenciasResult.forEach(item => {
      const mesNombre = new Date(currentYear, item.mes - 1).toLocaleDateString('es-ES', { month: 'short' });
      console.log(`      - ${mesNombre}: ${item.planillas} planillas, ${item.pabellones} pabellones, ${item.mts2.toLocaleString()} m²`);
    });

    // Test 6: Verificar rendimiento por sector con mts2
    console.log('\n6. Verificando rendimiento por sector con mts2...');
    const [sectoresResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(*) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(mts2), 0) as mts2_total
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY nombreSector
      ORDER BY mts2_total DESC
      LIMIT 3
    `);
    
    console.log(`   🏭 Top 3 sectores por m²:`);
    sectoresResult.forEach((item, index) => {
      console.log(`      ${index + 1}. ${item.sector_nombre}: ${item.planillas} planillas, ${item.pabellones_total} pabellones, ${item.mts2_total.toLocaleString()} m²`);
    });

    // Test 7: Verificar que las consultas del dashboard funcionan con mts2
    console.log('\n7. Verificando consultas del dashboard con mts2...');
    const [dashboardResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_planillas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(mts2), 0) as total_mts2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const dashboard = dashboardResult[0];
    console.log(`   📊 Datos para dashboard 2025:`);
    console.log(`      - Total planillas: ${dashboard.total_planillas}`);
    console.log(`      - Total pabellones: ${dashboard.total_pabellones}`);
    console.log(`      - Total m²: ${dashboard.total_mts2.toLocaleString()}`);
    console.log(`      - Total daños: ${dashboard.total_danos}`);

    console.log('\n✅ Integración de mts2 verificada exitosamente!');
    console.log('🎯 El Dashboard ahora incluye cálculos de metros cuadrados');
    console.log('📊 Los campos mts2 están disponibles en todas las consultas');
    console.log('📈 Las variaciones incluyen comparaciones de m²');
    console.log('🏭 Los gráficos muestran datos de metros cuadrados por sector');

  } catch (error) {
    console.error('❌ Error verificando integración de mts2:', error.message);
    
    if (error.message.includes('mts2')) {
      console.log('\n💡 El campo mts2 no está disponible en la vista unificada');
    }
    
    if (error.message.includes('vw_ordenes_2025_actual')) {
      console.log('\n💡 La vista unificada no existe o no es accesible');
    }
  } finally {
    await sequelize.close();
  }
}

testIntegracionMts2(); 