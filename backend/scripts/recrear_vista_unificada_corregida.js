const sequelize = require('../src/config/database');

async function recrearVistaUnificadaCorregida() {
  try {
    console.log('🔄 Recreando vista unificada con estructura corregida...\n');

    // Recrear la vista basada en la estructura real de la BD
    const createViewSQL = `
      CREATE OR REPLACE VIEW vw_ordenes_unificada_completa AS
      
      -- DATOS HISTÓRICOS DE 2025
      SELECT 
        id_orden_servicio as idOrdenServicio,
        fecha_inicio as fechaOrdenServicio,
        fecha_fin as fechaFinOrdenServicio,
        COALESCE(supervisor, 'Sin supervisor') as nombreSupervisor,
        COALESCE(nombreSector, sector, 'Sin sector') as nombreSector,
        COALESCE(pabellones_total, 0) as cantidadPabellones,
        COALESCE(pabellones_limpiados, 0) as cantLimpiar,
        COALESCE(mts2, 0) as mts2,
        COALESCE(maquina, 'Sin máquina') as nroMaquina,
        COALESCE(operador, 'Sin operador') as nombreOperador,
        odometro_inicio as odometroInicio,
        odometro_fin as odometroFin,
        litros_petroleo as litrosPetroleo,
        COALESCE(barredor, 'Sin barredor') as nombreBarredor,
        COALESCE(tipo_dano, 'Sin tipo') as nombreTipoDano,
        COALESCE(descripcion_dano, 'Sin descripción') as nombreDescripcionDano,
        COALESCE(cantidad_dano, 0) as cantidadDano,
        nroPabellon,
        pabellon_id,
        observacion,
        'historico_2025' as source,
        NOW() as fechaCreacion
      FROM migracion_ordenes_2025
      WHERE fecha_inicio IS NOT NULL
      
      UNION ALL
      
      -- DATOS ACTUALES DEL SISTEMA
      SELECT 
        p.id as idOrdenServicio,
        p.fecha_inicio as fechaOrdenServicio,
        p.fecha_termino as fechaFinOrdenServicio,
        COALESCE(u.nombre, 'Sin supervisor') as nombreSupervisor,
        COALESCE(s.nombre, 'Sin sector') as nombreSector,
        COALESCE(p.pabellones_total, 0) as cantidadPabellones,
        COALESCE(p.pabellones_limpiados, 0) as cantLimpiar,
        COALESCE(p.mt2, 0) as mts2,
        COALESCE(m.numero, 'Sin máquina') as nroMaquina,
        COALESCE(CONCAT(op.nombre, ' ', op.apellido), 'Sin operador') as nombreOperador,
        mp.odometro_inicio as odometroInicio,
        mp.odometro_fin as odometroFin,
        mp.petroleo as litrosPetroleo,
        'Sin barredor' as nombreBarredor,
        COALESCE(d.tipo, 'Sin tipo') as nombreTipoDano,
        COALESCE(d.descripcion, 'Sin descripción') as nombreDescripcionDano,
        COALESCE(d.cantidad, 0) as cantidadDano,
        NULL as nroPabellon,
        NULL as pabellon_id,
        COALESCE(d.observacion, p.observacion) as observacion,
        'sistema_actual' as source,
        NOW() as fechaCreacion
      FROM planilla p
      LEFT JOIN usuario u ON p.supervisor_id = u.id
      LEFT JOIN sector s ON p.sector_id = s.id
      LEFT JOIN maquina_planilla mp ON p.id = mp.planilla_id
      LEFT JOIN maquina m ON mp.maquina_id = m.id
      LEFT JOIN operador op ON mp.operador_id = op.id
      LEFT JOIN dano d ON p.id = d.planilla_id
      WHERE p.fecha_inicio IS NOT NULL
    `;

    await sequelize.query(createViewSQL);
    console.log('✅ Vista unificada recreada exitosamente');

    // Verificar el resultado
    const [resultado] = await sequelize.query(`
      SELECT 
        source,
        COUNT(*) as total
      FROM vw_ordenes_unificada_completa
      GROUP BY source
    `);
    
    console.log('\n📊 Estado final de la vista:');
    resultado.forEach(fuente => {
      console.log(`   - ${fuente.source}: ${fuente.total} registros`);
    });

    // Verificar que las nuevas planillas estén incluidas
    const [planillasActuales] = await sequelize.query(`
      SELECT COUNT(*) as total FROM vw_ordenes_unificada_completa WHERE source = 'sistema_actual'
    `);
    
    const [planillasEnBD] = await sequelize.query(`
      SELECT COUNT(*) as total FROM planilla WHERE fecha_inicio IS NOT NULL
    `);

    console.log(`\n📊 Verificación:`);
    console.log(`   - Planillas en BD: ${planillasEnBD[0].total}`);
    console.log(`   - Planillas en vista: ${planillasActuales[0].total}`);

    if (planillasActuales[0].total >= planillasEnBD[0].total) {
      console.log('   ✅ Todas las planillas están incluidas en la vista');
    } else {
      console.log('   ⚠️  Algunas planillas no están en la vista');
    }

    console.log('\n✅ Proceso completado!');
    console.log('🎯 Las nuevas planillas ahora están incluidas en la vista unificada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

recrearVistaUnificadaCorregida(); 