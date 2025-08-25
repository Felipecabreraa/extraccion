const sequelize = require('./src/config/database');

async function verificarDiscrepanciaDanos() {
  try {
    console.log('🔍 Verificando discrepancia en daños: 608 vs 584\n');

    // 1. Verificar total de daños en la tabla original
    console.log('1. Verificando daños en tabla original migracion_ordenes_2025:');
    const [danosOriginales] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(cantidad_dano), 0) as total_danos,
        COUNT(DISTINCT id_orden_servicio) as ordenes_con_danos
      FROM migracion_ordenes_2025
      WHERE cantidad_dano > 0
    `);
    
    const originales = danosOriginales[0];
    console.log(`   📊 Total registros con daños: ${originales.total_registros}`);
    console.log(`   📊 Total daños sumados: ${originales.total_danos}`);
    console.log(`   📊 Órdenes con daños: ${originales.ordenes_con_danos}`);

    // 2. Verificar daños en la vista unificada
    console.log('\n2. Verificando daños en vista unificada vw_ordenes_2025_actual:');
    const [danosVista] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(cantidadDano), 0) as total_danos,
        COUNT(DISTINCT idOrdenServicio) as ordenes_con_danos
      FROM vw_ordenes_2025_actual
      WHERE cantidadDano > 0
    `);
    
    const vista = danosVista[0];
    console.log(`   📊 Total registros con daños: ${vista.total_registros}`);
    console.log(`   📊 Total daños sumados: ${vista.total_danos}`);
    console.log(`   📊 Órdenes con daños: ${vista.ordenes_con_danos}`);

    // 3. Calcular diferencia
    const diferencia = originales.total_danos - vista.total_danos;
    console.log(`\n3. Diferencia encontrada: ${originales.total_danos} - ${vista.total_danos} = ${diferencia} daños`);

    // 4. Verificar registros que podrían estar faltando
    console.log('\n4. Verificando registros faltantes en la vista:');
    const [registrosFaltantes] = await sequelize.query(`
      SELECT 
        m.id_orden_servicio,
        m.fecha_inicio,
        m.sector,
        m.cantidad_dano,
        m.tipo_dano,
        m.operador
      FROM migracion_ordenes_2025 m
      LEFT JOIN vw_ordenes_2025_actual v ON m.id_orden_servicio = v.idOrdenServicio
      WHERE m.cantidad_dano > 0 AND v.idOrdenServicio IS NULL
      ORDER BY m.cantidad_dano DESC
      LIMIT 10
    `);
    
    if (registrosFaltantes.length > 0) {
      console.log(`   ⚠️  Encontrados ${registrosFaltantes.length} registros con daños que no están en la vista:`);
      registrosFaltantes.forEach((reg, index) => {
        console.log(`      ${index + 1}. Orden ${reg.id_orden_servicio} - ${reg.sector} - ${reg.cantidad_dano} daños (${reg.tipo_dano})`);
      });
    } else {
      console.log('   ✅ No se encontraron registros faltantes');
    }

    // 5. Verificar registros duplicados o con valores diferentes
    console.log('\n5. Verificando registros con valores diferentes:');
    const [valoresDiferentes] = await sequelize.query(`
      SELECT 
        m.id_orden_servicio,
        m.cantidad_dano as danos_original,
        v.cantidadDano as danos_vista,
        m.tipo_dano as tipo_original,
        v.nombreTipoDano as tipo_vista
      FROM migracion_ordenes_2025 m
      INNER JOIN vw_ordenes_2025_actual v ON m.id_orden_servicio = v.idOrdenServicio
      WHERE m.cantidad_dano != v.cantidadDano OR m.cantidad_dano > 0 AND v.cantidadDano = 0
      ORDER BY m.cantidad_dano DESC
      LIMIT 10
    `);
    
    if (valoresDiferentes.length > 0) {
      console.log(`   ⚠️  Encontrados ${valoresDiferentes.length} registros con valores diferentes:`);
      valoresDiferentes.forEach((reg, index) => {
        console.log(`      ${index + 1}. Orden ${reg.id_orden_servicio}: Original=${reg.danos_original}, Vista=${reg.danos_vista}`);
      });
    } else {
      console.log('   ✅ No se encontraron valores diferentes');
    }

    // 6. Verificar estructura de la vista
    console.log('\n6. Verificando estructura de la vista:');
    const [estructuraVista] = await sequelize.query('DESCRIBE vw_ordenes_2025_actual');
    const camposDanos = estructuraVista.filter(col => col.Field.toLowerCase().includes('dano'));
    console.log(`   📋 Campos relacionados con daños: ${camposDanos.length}`);
    camposDanos.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type}`);
    });

    // 7. Verificar filtros en la vista
    console.log('\n7. Verificando filtros aplicados en la vista:');
    const [filtrosVista] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN fecha_inicio IS NULL THEN 1 END) as sin_fecha,
        COUNT(CASE WHEN cantidad_dano IS NULL THEN 1 END) as sin_danos,
        COUNT(CASE WHEN cantidad_dano = 0 THEN 1 END) as danos_cero
      FROM migracion_ordenes_2025
    `);
    
    const filtros = filtrosVista[0];
    console.log(`   📊 Total registros en tabla original: ${filtros.total_registros}`);
    console.log(`   📊 Registros sin fecha: ${filtros.sin_fecha}`);
    console.log(`   📊 Registros sin daños (NULL): ${filtros.sin_danos}`);
    console.log(`   📊 Registros con daños = 0: ${filtros.danos_cero}`);

    // 8. Resumen final
    console.log('\n8. Resumen de la discrepancia:');
    console.log(`   🔢 Daños en tabla original: ${originales.total_danos}`);
    console.log(`   🔢 Daños en vista unificada: ${vista.total_danos}`);
    console.log(`   🔢 Diferencia: ${diferencia}`);
    console.log(`   📊 Porcentaje de pérdida: ${((diferencia / originales.total_danos) * 100).toFixed(2)}%`);

    if (diferencia > 0) {
      console.log('\n❌ PROBLEMA DETECTADO: Hay daños que no se están incluyendo en la vista unificada');
      console.log('💡 Posibles causas:');
      console.log('   - Filtros en la vista que excluyen registros');
      console.log('   - Problemas en el mapeo de campos');
      console.log('   - Registros con valores NULL o 0');
      console.log('   - Condiciones WHERE que excluyen datos válidos');
    } else {
      console.log('\n✅ No se detectaron discrepancias en los daños');
    }

  } catch (error) {
    console.error('❌ Error al verificar discrepancia:', error);
  } finally {
    await sequelize.close();
  }
}

verificarDiscrepanciaDanos();





