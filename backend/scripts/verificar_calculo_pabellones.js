const sequelize = require('../src/config/database');

async function verificarCalculoPabellones() {
  try {
    console.log('🔍 Verificando cálculo de pabellones en la vista...\n');

    // 1. Verificar una planilla específica con múltiples registros
    console.log('📊 1. Análisis detallado de planilla 21867 (109 registros):');

    const [planillaDetalleResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        cantidadPabellones,
        mts2,
        nombreSector,
        fechaOrdenServicio,
        source,
        ROW_NUMBER() OVER (PARTITION BY idOrdenServicio ORDER BY cantidadPabellones DESC) as rn
      FROM vw_ordenes_2025_actual
      WHERE idOrdenServicio = 21867
      ORDER BY cantidadPabellones DESC
      LIMIT 10
    `);

    console.log('Primeros 10 registros de planilla 21867:');
    planillaDetalleResult.forEach(row => {
      console.log(`  Registro ${row.rn}: ${row.cantidadPabellones} pabellones, ${row.mts2} m², Sector: ${row.nombreSector}`);
    });

    // 2. Verificar si los pabellones son iguales en todos los registros de una planilla
    console.log('\n📋 2. Verificando consistencia de pabellones por planilla:');

    const [consistenciaResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as total_registros,
        COUNT(DISTINCT cantidadPabellones) as pabellones_diferentes,
        MIN(cantidadPabellones) as min_pabellones,
        MAX(cantidadPabellones) as max_pabellones,
        AVG(cantidadPabellones) as avg_pabellones,
        SUM(cantidadPabellones) as sum_pabellones
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY idOrdenServicio
      HAVING COUNT(*) > 1
      ORDER BY total_registros DESC
      LIMIT 5
    `);

    console.log('Planillas con múltiples registros:');
    consistenciaResult.forEach(row => {
      const promedio = parseFloat(row.avg_pabellones) || 0;
      console.log(`  Planilla ${row.idOrdenServicio}:`);
      console.log(`    Registros: ${row.total_registros}`);
      console.log(`    Pabellones diferentes: ${row.pabellones_diferentes}`);
      console.log(`    Min: ${row.min_pabellones}, Max: ${row.max_pabellones}, Avg: ${promedio.toFixed(2)}`);
      console.log(`    Suma total: ${row.sum_pabellones}`);
    });

    // 3. Verificar si la vista ya agrupa los pabellones
    console.log('\n🔍 3. Verificando si la vista ya agrupa pabellones:');

    const [agrupacionResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as registros,
        SUM(cantidadPabellones) as suma_pabellones,
        MAX(cantidadPabellones) as max_pabellones
      FROM vw_ordenes_2025_actual
      WHERE idOrdenServicio IN (21867, 22001, 21736)
      GROUP BY idOrdenServicio
      ORDER BY registros DESC
    `);

    console.log('Análisis de agrupación:');
    agrupacionResult.forEach(row => {
      const esAgrupado = row.suma_pabellones === row.max_pabellones;
      console.log(`  Planilla ${row.idOrdenServicio}:`);
      console.log(`    Registros: ${row.registros}`);
      console.log(`    Suma pabellones: ${row.suma_pabellones}`);
      console.log(`    Max pabellones: ${row.max_pabellones}`);
      console.log(`    ¿Ya agrupado?: ${esAgrupado ? '✅ SÍ' : '❌ NO'}`);
    });

    // 4. Verificar la estructura de la vista
    console.log('\n📊 4. Estructura de la vista:');

    const [estructuraResult] = await sequelize.query(`
      DESCRIBE vw_ordenes_2025_actual
    `);

    console.log('Campos de la vista:');
    estructuraResult.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // 5. Verificar si hay diferencias entre origen histórico y activo
    console.log('\n📈 5. Comparación por origen:');

    const [origenResult] = await sequelize.query(`
      SELECT 
        source,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COUNT(*) as registros,
        AVG(cantidadPabellones) as avg_pabellones,
        SUM(cantidadPabellones) as total_pabellones
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY source
    `);

    origenResult.forEach(row => {
      const promedio = parseFloat(row.avg_pabellones) || 0;
      console.log(`  ${row.source}:`);
      console.log(`    Planillas: ${row.planillas}`);
      console.log(`    Registros: ${row.registros}`);
      console.log(`    Promedio pabellones: ${promedio.toFixed(2)}`);
      console.log(`    Total pabellones: ${row.total_pabellones.toLocaleString()}`);
    });

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await sequelize.close();
  }
}

verificarCalculoPabellones(); 