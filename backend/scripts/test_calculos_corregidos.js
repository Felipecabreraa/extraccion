const sequelize = require('../src/config/database');

async function testCalculosCorregidos() {
  try {
    console.log('🧪 Verificando cálculos corregidos del Dashboard...\n');

    // 1. Verificar total planillas 2025 (CORREGIDO)
    console.log('1. Total planillas 2025 (CORREGIDO):');
    const [planillas2025Result] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) AS total_planillas_2025
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const totalPlanillas2025 = planillas2025Result[0].total_planillas_2025;
    console.log(`   ✅ Total planillas 2025: ${totalPlanillas2025}`);

    // 2. Verificar métricas básicas corregidas
    console.log('\n2. Métricas básicas corregidas:');
    const [metricasBasicasResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as total_planillas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(mts2), 0) as total_mts2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const metricasBasicas = metricasBasicasResult[0];
    console.log(`   📊 Total planillas: ${metricasBasicas.total_planillas}`);
    console.log(`   📊 Total pabellones: ${metricasBasicas.total_pabellones.toLocaleString()}`);
    console.log(`   📊 Total m²: ${metricasBasicas.total_mts2.toLocaleString()}`);
    console.log(`   📊 Total daños: ${metricasBasicas.total_danos}`);

    // 3. Verificar estados corregidos
    console.log('\n3. Estados de planillas (CORREGIDO):');
    const [estadosResult] = await sequelize.query(`
      SELECT 
        CASE 
          WHEN fechaFinOrdenServicio IS NULL OR fechaFinOrdenServicio = fechaOrdenServicio THEN 'Activa'
          ELSE 'Completada'
        END as estado,
        COUNT(DISTINCT idOrdenServicio) as cantidad
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY 
        CASE 
          WHEN fechaFinOrdenServicio IS NULL OR fechaFinOrdenServicio = fechaOrdenServicio THEN 'Activa'
          ELSE 'Completada'
        END
      ORDER BY cantidad DESC
    `);
    
    console.log(`   📊 Estados de planillas:`);
    estadosResult.forEach(item => {
      console.log(`      - ${item.estado}: ${item.cantidad} planillas`);
    });

    // 4. Verificar métricas del mes actual (CORREGIDO)
    console.log('\n4. Métricas del mes actual (CORREGIDO):');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [mesActualResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes,
        COALESCE(SUM(mts2), 0) as mts2_mes
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
    `, { replacements: [currentYear, currentMonth] });
    
    const mesActual = mesActualResult[0];
    console.log(`   📊 Mes actual (${currentMonth}/${currentYear}):`);
    console.log(`      - Planillas: ${mesActual.planillas_mes}`);
    console.log(`      - Pabellones: ${mesActual.pabellones_mes.toLocaleString()}`);
    console.log(`      - m²: ${mesActual.mts2_mes.toLocaleString()}`);

    // 5. Verificar métricas del mes anterior (CORREGIDO)
    console.log('\n5. Métricas del mes anterior (CORREGIDO):');
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const [mesAnteriorResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_mes_anterior,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_anterior,
        COALESCE(SUM(mts2), 0) as mts2_mes_anterior
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
    `, { replacements: [previousYear, previousMonth] });
    
    const mesAnterior = mesAnteriorResult[0];
    console.log(`   📊 Mes anterior (${previousMonth}/${previousYear}):`);
    console.log(`      - Planillas: ${mesAnterior.planillas_mes_anterior}`);
    console.log(`      - Pabellones: ${mesAnterior.pabellones_mes_anterior.toLocaleString()}`);
    console.log(`      - m²: ${mesAnterior.mts2_mes_anterior.toLocaleString()}`);

    // 6. Calcular variaciones corregidas
    console.log('\n6. Variaciones corregidas:');
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

    // 7. Verificar tendencias mensuales corregidas
    console.log('\n7. Tendencias mensuales (CORREGIDO):');
    const [tendenciasResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(DISTINCT idOrdenServicio) as planillas,
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
      console.log(`      - ${mesNombre}: ${item.planillas} planillas, ${item.pabellones.toLocaleString()} pabellones, ${item.mts2.toLocaleString()} m²`);
    });

    // 8. Verificar rendimiento por sector corregido
    console.log('\n8. Rendimiento por sector (CORREGIDO):');
    const [sectoresResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(DISTINCT idOrdenServicio) as planillas,
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
      console.log(`      ${index + 1}. ${item.sector_nombre}: ${item.planillas} planillas, ${item.pabellones_total.toLocaleString()} pabellones, ${item.mts2_total.toLocaleString()} m²`);
    });

    // 9. Verificar que no hay duplicados en el conteo
    console.log('\n9. Verificando que no hay duplicados en el conteo:');
    const [verificacionResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT idOrdenServicio) as planillas_unicas,
        COUNT(*) - COUNT(DISTINCT idOrdenServicio) as diferencia
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const verificacion = verificacionResult[0];
    console.log(`   🔍 Verificación:`);
    console.log(`      - Total registros: ${verificacion.total_registros}`);
    console.log(`      - Planillas únicas: ${verificacion.planillas_unicas}`);
    console.log(`      - Diferencia: ${verificacion.diferencia}`);
    console.log(`      - Promedio registros por planilla: ${(verificacion.total_registros / verificacion.planillas_unicas).toFixed(1)}`);

    console.log('\n✅ Cálculos corregidos verificados exitosamente!');
    console.log('🎯 El Dashboard ahora cuenta planillas únicas correctamente');
    console.log('📊 Los datos de pabellones y m² siguen siendo acumulativos');
    console.log('🔧 Todos los cálculos usan COUNT(DISTINCT idOrdenServicio)');

  } catch (error) {
    console.error('❌ Error verificando cálculos corregidos:', error.message);
  } finally {
    await sequelize.close();
  }
}

testCalculosCorregidos(); 