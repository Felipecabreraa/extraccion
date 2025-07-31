const sequelize = require('../src/config/database');

async function testVistaUnificada() {
  try {
    console.log('🔍 Probando vista unificada vw_ordenes_2025_actual...\n');

    // 1. Verificar que la vista existe
    console.log('1. Verificando existencia de la vista...');
    const [vistaResult] = await sequelize.query(`
      SELECT COUNT(*) as total_registros 
      FROM vw_ordenes_2025_actual
    `);
    console.log(`✅ Vista encontrada con ${vistaResult[0].total_registros} registros\n`);

    // 2. Mostrar estructura de la vista
    console.log('2. Estructura de la vista:');
    const [estructuraResult] = await sequelize.query(`
      DESCRIBE vw_ordenes_2025_actual
    `);
    estructuraResult.forEach(campo => {
      console.log(`   - ${campo.Field}: ${campo.Type}`);
    });
    console.log('');

    // 3. Resumen por origen (histórico vs activo)
    console.log('3. Resumen por origen:');
    const [origenResult] = await sequelize.query(`
      SELECT 
        source,
        COUNT(*) as total_ordenes,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      GROUP BY source
      ORDER BY total_ordenes DESC
    `);
    origenResult.forEach(item => {
      console.log(`   - ${item.source}: ${item.total_ordenes} órdenes, ${item.total_pabellones} pabellones, ${item.total_danos} daños`);
    });
    console.log('');

    // 4. Resumen por año 2025
    console.log('4. Resumen 2025:');
    const [resumen2025Result] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_ordenes,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantidadDano), 0) as total_danos,
        COUNT(DISTINCT nombreSector) as sectores_activos,
        COUNT(DISTINCT nombreSupervisor) as supervisores_activos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    const resumen = resumen2025Result[0];
    console.log(`   - Total órdenes: ${resumen.total_ordenes}`);
    console.log(`   - Total pabellones: ${resumen.total_pabellones}`);
    console.log(`   - Total daños: ${resumen.total_danos}`);
    console.log(`   - Sectores activos: ${resumen.sectores_activos}`);
    console.log(`   - Supervisores activos: ${resumen.supervisores_activos}`);
    console.log('');

    // 5. Top 5 sectores por rendimiento
    console.log('5. Top 5 sectores por rendimiento:');
    const [topSectoresResult] = await sequelize.query(`
      SELECT 
        nombreSector,
        COUNT(*) as ordenes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY nombreSector
      ORDER BY pabellones_total DESC
      LIMIT 5
    `);
    topSectoresResult.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.nombreSector}: ${item.ordenes} órdenes, ${item.pabellones_total} pabellones, ${item.total_danos} daños`);
    });
    console.log('');

    // 6. Daños por tipo
    console.log('6. Daños por tipo:');
    const [danosPorTipoResult] = await sequelize.query(`
      SELECT 
        COALESCE(nombreTipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
      GROUP BY nombreTipoDano
      ORDER BY total_danos DESC
      LIMIT 10
    `);
    danosPorTipoResult.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.tipo_dano}: ${item.cantidad} registros, ${item.total_danos} daños`);
    });
    console.log('');

    // 7. Evolución mensual (últimos 6 meses)
    console.log('7. Evolución mensual (últimos 6 meses):');
    const [evolucionResult] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as periodo,
        COUNT(*) as ordenes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m')
      ORDER BY periodo ASC
    `);
    evolucionResult.forEach(item => {
      console.log(`   - ${item.periodo}: ${item.ordenes} órdenes, ${item.pabellones_total} pabellones, ${item.total_danos} daños`);
    });
    console.log('');

    // 8. Estados de las órdenes
    console.log('8. Estados de las órdenes:');
    const [estadosResult] = await sequelize.query(`
      SELECT 
        COALESCE(nombreEstado, 'Sin estado') as estado,
        COUNT(*) as cantidad
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY nombreEstado
      ORDER BY cantidad DESC
    `);
    estadosResult.forEach(item => {
      console.log(`   - ${item.estado}: ${item.cantidad} órdenes`);
    });
    console.log('');

    console.log('✅ Prueba de vista unificada completada exitosamente');
    console.log('📊 La vista está lista para ser usada en Dashboard y Daños');

  } catch (error) {
    console.error('❌ Error probando vista unificada:', error.message);
    
    if (error.message.includes('doesn\'t exist')) {
      console.log('\n💡 La vista vw_ordenes_2025_actual no existe.');
      console.log('   Necesitas crearla primero usando el script correspondiente.');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testVistaUnificada(); 