const sequelize = require('../src/config/database');

async function verificarYActualizarVistaUnificada() {
  try {
    console.log('🔍 Verificando estado de la vista unificada...\n');

    // 1. Verificar datos actuales en las tablas
    console.log('1. Verificando datos en las tablas...');
    
    const [datosHistoricos] = await sequelize.query(`
      SELECT COUNT(*) as total FROM migracion_ordenes_2025
    `);
    
    const [datosActuales] = await sequelize.query(`
      SELECT COUNT(*) as total FROM planilla
    `);
    
    const [datosDanos] = await sequelize.query(`
      SELECT COUNT(*) as total FROM dano
    `);
    
    console.log(`   📊 Datos históricos: ${datosHistoricos[0].total} registros`);
    console.log(`   📊 Datos actuales: ${datosActuales[0].total} registros`);
    console.log(`   📊 Datos de daños: ${datosDanos[0].total} registros`);

    const tieneHistoricos = datosHistoricos[0].total > 0;
    const tieneActuales = datosActuales[0].total > 0;

    // 2. Verificar datos en la vista actual
    console.log('\n2. Verificando datos en la vista unificada...');
    
    const [datosVista] = await sequelize.query(`
      SELECT 
        source,
        COUNT(*) as total,
        MIN(fechaOrdenServicio) as fecha_min,
        MAX(fechaOrdenServicio) as fecha_max
      FROM vw_ordenes_unificada_completa
      GROUP BY source
    `);
    
    console.log('   📊 Datos en la vista unificada:');
    datosVista.forEach(fuente => {
      console.log(`      - ${fuente.source}: ${fuente.total} registros (${fuente.fecha_min} a ${fuente.fecha_max})`);
    });

    // 3. Verificar si hay nuevas planillas que no están en la vista
    console.log('\n3. Verificando planillas nuevas...');
    
    const [planillasNuevas] = await sequelize.query(`
      SELECT 
        p.id,
        p.fecha_inicio,
        p.supervisor_id,
        p.sector_id,
        p.estado,
        p.created_at
      FROM planilla p
      LEFT JOIN vw_ordenes_unificada_completa v ON p.id = v.idOrdenServicio AND v.source = 'sistema_actual'
      WHERE v.idOrdenServicio IS NULL
        AND p.fecha_inicio IS NOT NULL
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    if (planillasNuevas.length > 0) {
      console.log(`   ⚠️  Encontradas ${planillasNuevas.length} planillas nuevas que no están en la vista:`);
      planillasNuevas.forEach(planilla => {
        console.log(`      - Planilla ${planilla.id}: ${planilla.fecha_inicio} (${planilla.estado})`);
      });
      
      console.log('\n🔄 Recreando vista unificada para incluir nuevas planillas...');
      
      // Recrear la vista
      let createViewSQL = '';
      
      if (tieneHistoricos && tieneActuales) {
        createViewSQL = `
          CREATE OR REPLACE VIEW vw_ordenes_unificada_completa AS
          
          -- DATOS HISTÓRICOS DE 2025
          SELECT 
            id_orden_servicio as idOrdenServicio,
            fecha_inicio as fechaOrdenServicio,
            fecha_fin as fechaFinOrdenServicio,
            COALESCE(supervisor, 'Sin supervisor') as nombreSupervisor,
            COALESCE(sector, nombreSector, 'Sin sector') as nombreSector,
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
            COALESCE('Sin descripción') as nombreDescripcionDano,
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
            p.fecha_fin as fechaFinOrdenServicio,
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
            COALESCE(b.nombre, 'Sin barredor') as nombreBarredor,
            COALESCE(d.tipo, 'Sin tipo') as nombreTipoDano,
            COALESCE(d.descripcion, 'Sin descripción') as nombreDescripcionDano,
            COALESCE(d.cantidad, 0) as cantidadDano,
            NULL as nroPabellon,
            NULL as pabellon_id,
            COALESCE(d.observacion, p.observacion) as observacion,
            'sistema_actual' as source,
            p.created_at as fechaCreacion
          FROM planilla p
          LEFT JOIN usuario u ON p.supervisor_id = u.id
          LEFT JOIN sector s ON p.sector_id = s.id
          LEFT JOIN maquina_planilla mp ON p.id = mp.planilla_id
          LEFT JOIN maquina m ON mp.maquina_id = m.id
          LEFT JOIN operador op ON mp.operador_id = op.id
          LEFT JOIN barredor b ON p.barredor_id = b.id
          LEFT JOIN dano d ON p.id = d.planilla_id
          WHERE p.fecha_inicio IS NOT NULL
        `;
      } else if (tieneHistoricos) {
        createViewSQL = `
          CREATE OR REPLACE VIEW vw_ordenes_unificada_completa AS
          
          -- DATOS HISTÓRICOS DE 2025
          SELECT 
            id_orden_servicio as idOrdenServicio,
            fecha_inicio as fechaOrdenServicio,
            fecha_fin as fechaFinOrdenServicio,
            COALESCE(supervisor, 'Sin supervisor') as nombreSupervisor,
            COALESCE(sector, nombreSector, 'Sin sector') as nombreSector,
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
            COALESCE('Sin descripción') as nombreDescripcionDano,
            COALESCE(cantidad_dano, 0) as cantidadDano,
            nroPabellon,
            pabellon_id,
            observacion,
            'historico_2025' as source,
            NOW() as fechaCreacion
          FROM migracion_ordenes_2025
          WHERE fecha_inicio IS NOT NULL
        `;
      }

      if (createViewSQL) {
        await sequelize.query(createViewSQL);
        console.log('✅ Vista unificada recreada exitosamente');
        
        // Verificar que las nuevas planillas estén incluidas
        const [verificacion] = await sequelize.query(`
          SELECT COUNT(*) as total FROM vw_ordenes_unificada_completa WHERE source = 'sistema_actual'
        `);
        console.log(`   ✅ Total de planillas actuales en la vista: ${verificacion[0].total}`);
      }
    } else {
      console.log('   ✅ No hay planillas nuevas. La vista está actualizada.');
    }

    // 4. Verificar estado final
    console.log('\n4. Estado final de la vista unificada...');
    
    const [estadoFinal] = await sequelize.query(`
      SELECT 
        source,
        COUNT(*) as total,
        MIN(fechaOrdenServicio) as fecha_min,
        MAX(fechaOrdenServicio) as fecha_max
      FROM vw_ordenes_unificada_completa
      GROUP BY source
    `);
    
    console.log('   📊 Estado final:');
    estadoFinal.forEach(fuente => {
      console.log(`      - ${fuente.source}: ${fuente.total} registros (${fuente.fecha_min} a ${fuente.fecha_max})`);
    });

    console.log('\n✅ Verificación completada!');
    console.log('🎯 La vista unificada está lista para mostrar todas las planillas');
    console.log('📊 Las nuevas planillas ahora aparecerán en los reportes y dashboards');

  } catch (error) {
    console.error('❌ Error verificando vista unificada:', error.message);
    
    if (error.message.includes('doesn\'t exist')) {
      console.log('\n💡 La vista no existe. Ejecutar primero:');
      console.log('   node backend/scripts/crear_vista_unificada_completa.js');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
verificarYActualizarVistaUnificada(); 