const sequelize = require('../src/config/database');

async function verificarEstructuraPabellones() {
  try {
    console.log('🔍 Verificando estructura de pabellones en vw_ordenes_2025_actual...\n');

    // 1. Verificar si hay duplicados por idOrdenServicio
    console.log('📊 1. Verificando duplicados por planilla:');
    const [duplicadosResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as registros,
        SUM(cantidadPabellones) as total_pabellones,
        AVG(cantidadPabellones) as promedio_pabellones
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY idOrdenServicio
      HAVING COUNT(*) > 1
      ORDER BY registros DESC
      LIMIT 10
    `);

    if (duplicadosResult.length > 0) {
      console.log('Planillas con múltiples registros:');
      duplicadosResult.forEach(row => {
        const promedio = parseFloat(row.promedio_pabellones) || 0;
        console.log(`  Planilla ${row.idOrdenServicio}: ${row.registros} registros, ${row.total_pabellones} pabellones total, ${promedio.toFixed(2)} promedio`);
      });
    } else {
      console.log('✅ No hay duplicados por planilla - cada planilla tiene un solo registro');
    }

    // 2. Verificar estructura de una planilla específica
    console.log('\n📋 2. Estructura detallada de una planilla:');
    const [planillaDetalleResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        cantidadPabellones,
        mts2,
        nombreSector,
        fechaOrdenServicio,
        source
      FROM vw_ordenes_2025_actual
      WHERE idOrdenServicio = 21678
      ORDER BY cantidadPabellones DESC
    `);

    console.log('Planilla 21678:');
    planillaDetalleResult.forEach(row => {
      console.log(`  ${row.source}: ${row.cantidadPabellones} pabellones, ${row.mts2} m², Sector: ${row.nombreSector}`);
    });

    // 3. Verificar si la vista ya agrupa correctamente
    console.log('\n🔍 3. Verificando si la vista ya agrupa por planilla:');
    const [agrupacionResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_unicas,
        COUNT(*) as registros_totales,
        SUM(cantidadPabellones) as pabellones_totales
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);

    console.log('Estadísticas generales:');
    console.log(`  Planillas únicas: ${agrupacionResult[0].planillas_unicas}`);
    console.log(`  Registros totales: ${agrupacionResult[0].registros_totales}`);
    console.log(`  Pabellones totales: ${agrupacionResult[0].pabellones_totales.toLocaleString()}`);

    if (agrupacionResult[0].planillas_unicas === agrupacionResult[0].registros_totales) {
      console.log('✅ La vista ya está correctamente agrupada por planilla');
    } else {
      console.log('⚠️ La vista tiene múltiples registros por planilla');
    }

    // 4. Verificar origen de datos
    console.log('\n📊 4. Verificación por origen de datos:');
    const [origenResult] = await sequelize.query(`
      SELECT 
        source,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COUNT(*) as registros,
        SUM(cantidadPabellones) as pabellones
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY source
    `);

    origenResult.forEach(row => {
      console.log(`  ${row.source}:`);
      console.log(`    Planillas: ${row.planillas}`);
      console.log(`    Registros: ${row.registros}`);
      console.log(`    Pabellones: ${row.pabellones.toLocaleString()}`);
    });

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraPabellones(); 