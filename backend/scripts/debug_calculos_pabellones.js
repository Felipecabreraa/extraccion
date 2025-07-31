const sequelize = require('../src/config/database');

async function debugCalculosPabellones() {
  try {
    console.log('🔍 Debuggeando cálculos de pabellones...\n');

    const currentYear = 2025;

    // 1. Verificar el cálculo que está usando el dashboard
    console.log('📊 1. Cálculo que usa el Dashboard:');

    const [dashboardResult] = await sequelize.query(`
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

    console.log(`  Dashboard pabellones únicos: ${dashboardResult[0].total_pabellones_unicos.toLocaleString()}`);

    // 2. Verificar el cálculo incorrecto
    const [incorrectoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_incorrecto
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ?
    `, { replacements: [currentYear] });

    console.log(`  Cálculo incorrecto: ${incorrectoResult[0].total_pabellones_incorrecto.toLocaleString()}`);

    const diferencia = incorrectoResult[0].total_pabellones_incorrecto - dashboardResult[0].total_pabellones_unicos;
    console.log(`  Diferencia: ${diferencia.toLocaleString()}`);

    // 3. Verificar paso a paso
    console.log('\n🔍 2. Verificación paso a paso:');

    // Paso 1: Ver cuántas planillas únicas hay
    const [planillasUnicasResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT idOrdenServicio) as total_planillas
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ?
    `, { replacements: [currentYear] });

    console.log(`  Planillas únicas: ${planillasUnicasResult[0].total_planillas}`);

    // Paso 2: Ver cuántos registros totales hay
    const [registrosTotalesResult] = await sequelize.query(`
      SELECT COUNT(*) as total_registros
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ?
    `, { replacements: [currentYear] });

    console.log(`  Registros totales: ${registrosTotalesResult[0].total_registros}`);

    // Paso 3: Verificar algunas planillas específicas
    console.log('\n📋 3. Verificación de planillas específicas:');

    const [planillasEspecificasResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as registros,
        SUM(cantidadPabellones) as suma_total,
        MAX(cantidadPabellones) as valor_unico
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ?
      GROUP BY idOrdenServicio
      HAVING COUNT(*) > 1
      ORDER BY registros DESC
      LIMIT 5
    `, { replacements: [currentYear] });

    console.log('Planillas con múltiples registros:');
    planillasEspecificasResult.forEach(row => {
      const duplicados = row.suma_total - row.valor_unico;
      console.log(`  Planilla ${row.idOrdenServicio}: ${row.registros} registros, suma: ${row.suma_total}, único: ${row.valor_unico}, duplicados: ${duplicados}`);
    });

    // Paso 4: Calcular manualmente el total correcto
    console.log('\n🧮 4. Cálculo manual del total correcto:');

    let totalCorrecto = 0;
    planillasEspecificasResult.forEach(row => {
      totalCorrecto += row.valor_unico;
    });

    console.log(`  Total de las 5 planillas más grandes: ${totalCorrecto}`);

    // Paso 5: Verificar si hay planillas con un solo registro
    const [planillasUnicasResult2] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as registros,
        SUM(cantidadPabellones) as suma_total,
        MAX(cantidadPabellones) as valor_unico
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ?
      GROUP BY idOrdenServicio
      HAVING COUNT(*) = 1
      LIMIT 5
    `, { replacements: [currentYear] });

    console.log('\nPlanillas con un solo registro:');
    planillasUnicasResult2.forEach(row => {
      console.log(`  Planilla ${row.idOrdenServicio}: ${row.registros} registro, valor: ${row.valor_unico}`);
    });

    // 6. Verificar si el problema está en la vista
    console.log('\n🔍 5. Verificando si el problema está en la vista:');

    const [vistaResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        cantidadPabellones,
        source
      FROM vw_ordenes_2025_actual
      WHERE idOrdenServicio = 21867
      LIMIT 3
    `);

    console.log('Primeros 3 registros de planilla 21867:');
    vistaResult.forEach(row => {
      console.log(`  ${row.source}: ${row.cantidadPabellones} pabellones`);
    });

    console.log('\n✅ Debug completado');

  } catch (error) {
    console.error('❌ Error en el debug:', error);
  } finally {
    await sequelize.close();
  }
}

debugCalculosPabellones(); 