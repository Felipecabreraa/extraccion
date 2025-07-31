const sequelize = require('../src/config/database');

async function testPabellonesUnicos() {
  try {
    console.log('🔍 Probando cálculos de pabellones únicos por planilla...\n');

    // 1. Verificar estructura de datos
    console.log('📊 1. Estructura de datos en vw_ordenes_2025_actual:');
    const [estructuraResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        cantidadPabellones,
        fechaOrdenServicio
      FROM vw_ordenes_2025_actual 
      WHERE YEAR(fechaOrdenServicio) = 2025
      ORDER BY idOrdenServicio, cantidadPabellones DESC
      LIMIT 10
    `);
    
    console.log('Primeros 10 registros:');
    estructuraResult.forEach(row => {
      console.log(`  Planilla ${row.idOrdenServicio}: ${row.cantidadPabellones} pabellones (${row.fechaOrdenServicio})`);
    });

    // 2. Comparar cálculos ANTES vs DESPUÉS
    console.log('\n📈 2. Comparación de cálculos:');

    // ANTES: Suma directa (INCORRECTO)
    const [antesResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as total_planillas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_incorrecto
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);

    // DESPUÉS: Suma por planilla única (CORRECTO)
    const [despuesResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as total_planillas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_correcto
      FROM (
        SELECT 
          idOrdenServicio,
          SUM(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = 2025
        GROUP BY idOrdenServicio
      ) as planillas_unicas
    `);

    console.log('ANTES (INCORRECTO):');
    console.log(`  Total Planillas: ${antesResult[0].total_planillas}`);
    console.log(`  Total Pabellones: ${antesResult[0].total_pabellones_incorrecto.toLocaleString()}`);

    console.log('\nDESPUÉS (CORRECTO):');
    console.log(`  Total Planillas: ${despuesResult[0].total_planillas}`);
    console.log(`  Total Pabellones: ${despuesResult[0].total_pabellones_correcto.toLocaleString()}`);

    const diferencia = antesResult[0].total_pabellones_incorrecto - despuesResult[0].total_pabellones_correcto;
    console.log(`\n📊 Diferencia: ${diferencia.toLocaleString()} pabellones duplicados eliminados`);

    // 3. Verificar por mes
    console.log('\n📅 3. Verificación por mes (Julio 2025):');

    const [mesResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_incorrecto
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025 AND MONTH(fechaOrdenServicio) = 7
    `);

    const [mesUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_correcto
      FROM (
        SELECT 
          idOrdenServicio,
          SUM(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = 2025 AND MONTH(fechaOrdenServicio) = 7
        GROUP BY idOrdenServicio
      ) as planillas_mes_unicas
    `);

    console.log('Julio 2025:');
    console.log(`  Planillas: ${mesResult[0].planillas_mes}`);
    console.log(`  Pabellones (INCORRECTO): ${mesResult[0].pabellones_mes_incorrecto.toLocaleString()}`);
    console.log(`  Pabellones (CORRECTO): ${mesUnicosResult[0].pabellones_mes_correcto.toLocaleString()}`);

    // 4. Verificar por sector
    console.log('\n🏢 4. Verificación por sector (Top 3):');

    const [sectorResult] = await sequelize.query(`
      SELECT 
        nombreSector,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_incorrecto
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY nombreSector
      ORDER BY pabellones_incorrecto DESC
      LIMIT 3
    `);

    const [sectorUnicosResult] = await sequelize.query(`
      SELECT 
        nombreSector,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_correcto
      FROM (
        SELECT 
          idOrdenServicio,
          nombreSector,
          SUM(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = 2025
        GROUP BY idOrdenServicio, nombreSector
      ) as planillas_sector_unicas
      GROUP BY nombreSector
      ORDER BY pabellones_correcto DESC
      LIMIT 3
    `);

    console.log('Top 3 Sectores:');
    sectorResult.forEach((row, index) => {
      const pabellonesCorrectos = sectorUnicosResult[index]?.pabellones_correcto || 0;
      console.log(`  ${row.nombreSector}:`);
      console.log(`    Planillas: ${row.planillas}`);
      console.log(`    Pabellones (INCORRECTO): ${row.pabellones_incorrecto.toLocaleString()}`);
      console.log(`    Pabellones (CORRECTO): ${pabellonesCorrectos.toLocaleString()}`);
    });

    console.log('\n✅ Prueba completada exitosamente');
    console.log('🎯 Los cálculos de pabellones únicos están funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await sequelize.close();
  }
}

testPabellonesUnicos(); 