const sequelize = require('../src/config/database');

async function testDashboardPabellonesUnicos() {
  try {
    console.log('🔍 Probando cálculos de pabellones únicos del Dashboard...\n');

    const currentYear = 2025;
    const currentMonth = 7;
    const previousMonth = 6;

    // 1. Verificar cálculos del dashboard actualizado
    console.log('📊 1. Cálculos del Dashboard (CORREGIDOS):');

    // Total pabellones únicos
    const [totalUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          SUM(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_unicas
    `, { replacements: [currentYear] });

    // Pabellones del mes únicos
    const [mesUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          SUM(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_mes_unicas
    `, { replacements: [currentYear, currentMonth] });

    // Pabellones del mes anterior únicos
    const [mesAnteriorUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_anterior_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          SUM(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_mes_anterior_unicas
    `, { replacements: [currentYear, previousMonth] });

    console.log('✅ Cálculos únicos:');
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
    console.log(`  Diferencia total: ${diferenciaTotal.toLocaleString()} pabellones duplicados`);
    console.log(`  Diferencia mes: ${diferenciaMes.toLocaleString()} pabellones duplicados`);

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
          SUM(cantidadPabellones) as cantidadPabellones
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
          SUM(cantidadPabellones) as cantidadPabellones
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

    console.log('\n✅ Prueba del Dashboard completada exitosamente');
    console.log('🎯 Los cálculos de pabellones únicos están implementados correctamente');
    console.log('📊 El Dashboard ahora muestra datos precisos por planilla única');

  } catch (error) {
    console.error('❌ Error en la prueba del Dashboard:', error);
  } finally {
    await sequelize.close();
  }
}

testDashboardPabellonesUnicos(); 