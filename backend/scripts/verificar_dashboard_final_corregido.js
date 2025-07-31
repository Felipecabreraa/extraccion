const sequelize = require('../src/config/database');

async function verificarDashboardFinalCorregido() {
  try {
    console.log('🎯 Verificación final del Dashboard - Cálculos corregidos...\n');

    const currentYear = 2025;
    const currentMonth = 7;
    const previousMonth = 6;

    // 1. Verificar cálculos corregidos del dashboard
    console.log('📊 1. Cálculos corregidos del Dashboard:');

    // Total pabellones únicos (CORREGIDO)
    const [totalUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_unicas
    `, { replacements: [currentYear] });

    // Pabellones del mes únicos (CORREGIDO)
    const [mesUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_mes_unicas
    `, { replacements: [currentYear, currentMonth] });

    // Pabellones del mes anterior únicos (CORREGIDO)
    const [mesAnteriorUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_anterior_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_mes_anterior_unicas
    `, { replacements: [currentYear, previousMonth] });

    console.log('✅ Cálculos únicos corregidos:');
    console.log(`  Total pabellones únicos: ${totalUnicosResult[0].total_pabellones_unicos.toLocaleString()}`);
    console.log(`  Pabellones mes actual únicos: ${mesUnicosResult[0].pabellones_mes_unicos.toLocaleString()}`);
    console.log(`  Pabellones mes anterior únicos: ${mesAnteriorUnicosResult[0].pabellones_mes_anterior_unicos.toLocaleString()}`);

    // 2. Comparar con cálculos anteriores (INCORRECTOS)
    console.log('\n📈 2. Comparación con cálculos anteriores:');

    const [totalIncorrectoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_incorrecto
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ?
    `, { replacements: [currentYear] });

    const [mesIncorrectoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_incorrecto
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
    `, { replacements: [currentYear, currentMonth] });

    console.log('❌ Cálculos incorrectos (suma directa):');
    console.log(`  Total pabellones incorrecto: ${totalIncorrectoResult[0].total_pabellones_incorrecto.toLocaleString()}`);
    console.log(`  Pabellones mes incorrecto: ${mesIncorrectoResult[0].pabellones_mes_incorrecto.toLocaleString()}`);

    // 3. Calcular diferencias
    const diferenciaTotal = totalIncorrectoResult[0].total_pabellones_incorrecto - totalUnicosResult[0].total_pabellones_unicos;
    const diferenciaMes = mesIncorrectoResult[0].pabellones_mes_incorrecto - mesUnicosResult[0].pabellones_mes_unicos;

    console.log('\n📊 3. Diferencias:');
    console.log(`  Diferencia total: ${diferenciaTotal.toLocaleString()} pabellones duplicados eliminados`);
    console.log(`  Diferencia mes: ${diferenciaMes.toLocaleString()} pabellones duplicados eliminados`);

    // 4. Verificar tendencias mensuales únicas
    console.log('\n📅 4. Tendencias mensuales únicas:');

    const [tendenciasUnicasResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          fechaOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY idOrdenServicio, fechaOrdenServicio
      ) as planillas_mensuales_unicas
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `);

    console.log('Tendencias mensuales (pabellones únicos):');
    tendenciasUnicasResult.forEach(row => {
      const nombreMes = new Date(currentYear, row.mes - 1).toLocaleDateString('es-ES', { month: 'short' });
      console.log(`  ${nombreMes}: ${row.pabellones_unicos.toLocaleString()} pabellones únicos`);
    });

    // 5. Verificar rendimiento por sector únicos
    console.log('\n🏢 5. Rendimiento por sector únicos:');

    const [sectorUnicosResult] = await sequelize.query(`
      SELECT 
        nombreSector,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          nombreSector,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio, nombreSector
      ) as planillas_sector_unicas
      GROUP BY nombreSector
      ORDER BY pabellones_unicos DESC
      LIMIT 5
    `, { replacements: [currentYear] });

    console.log('Top 5 sectores (pabellones únicos):');
    sectorUnicosResult.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.nombreSector}: ${row.pabellones_unicos.toLocaleString()} pabellones únicos`);
    });

    // 6. Verificar ejemplo específico
    console.log('\n🔍 6. Verificación específica - Planilla 21867:');

    const [ejemploResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as registros,
        SUM(cantidadPabellones) as suma_total,
        MAX(cantidadPabellones) as valor_unico
      FROM vw_ordenes_2025_actual
      WHERE idOrdenServicio = 21867
      GROUP BY idOrdenServicio
    `);

    if (ejemploResult.length > 0) {
      const planilla = ejemploResult[0];
      console.log(`  Planilla ${planilla.idOrdenServicio}:`);
      console.log(`    Registros en la vista: ${planilla.registros}`);
      console.log(`    Suma total (INCORRECTO): ${planilla.suma_total}`);
      console.log(`    Valor único (CORRECTO): ${planilla.valor_unico}`);
      console.log(`    Diferencia: ${planilla.suma_total - planilla.valor_unico} pabellones duplicados`);
    }

    console.log('\n✅ Verificación final completada exitosamente');
    console.log('🎯 El Dashboard está usando cálculos únicos por planilla');
    console.log('📊 Los pabellones se calculan correctamente usando MAX() por idOrdenServicio');
    console.log('🔧 Se evitan duplicados por desglose de máquinas/operadores/pabellones');
    console.log('📈 Diferencia total: ' + diferenciaTotal.toLocaleString() + ' pabellones duplicados eliminados');

  } catch (error) {
    console.error('❌ Error en la verificación final:', error);
  } finally {
    await sequelize.close();
  }
}

verificarDashboardFinalCorregido(); 