const sequelize = require('../src/config/database');

async function crearVistaUnificadaCompleta() {
  try {
    console.log('🔧 Creando vista unificada completa inteligente...\n');

    // 1. Verificar qué tablas existen y tienen datos
    console.log('1. Analizando estructura de datos disponible...');
    
    const [tablasResult] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        CASE 
          WHEN TABLE_NAME = 'migracion_ordenes_2025' THEN 'históricos'
          WHEN TABLE_NAME = 'planilla' THEN 'actuales'
          WHEN TABLE_NAME = 'dano' THEN 'daños'
          ELSE 'otras'
        END as tipo
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('migracion_ordenes_2025', 'planilla', 'dano', 'sector', 'usuario')
      ORDER BY TABLE_NAME
    `);
    
    console.log('✅ Tablas encontradas:');
    tablasResult.forEach(tabla => {
      console.log(`   - ${tabla.TABLE_NAME} (${tabla.tipo})`);
    });

    // 2. Verificar si hay datos en las tablas principales
    console.log('\n2. Verificando datos disponibles...');
    
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
    const tieneDanos = datosDanos[0].total > 0;

    // 3. Crear vista unificada según los datos disponibles
    console.log('\n3. Creando vista unificada según datos disponibles...');
    
    let createViewSQL = '';
    
    if (tieneHistoricos && tieneActuales) {
      // Caso completo: históricos + actuales
      console.log('   🎯 Creando vista completa (históricos + actuales)');
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
      // Solo históricos (caso actual)
      console.log('   🎯 Creando vista solo con datos históricos (caso actual)');
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
    } else {
      console.log('   ❌ No hay datos suficientes para crear la vista unificada');
      return;
    }

    await sequelize.query(createViewSQL);
    console.log('✅ Vista unificada completa creada exitosamente');

    // 4. Verificar la nueva estructura
    console.log('\n4. Verificando estructura de la vista unificada completa...');
    const [estructuraResult] = await sequelize.query('DESCRIBE vw_ordenes_unificada_completa');
    
    console.log(`   ✅ Campos disponibles: ${estructuraResult.length}`);
    estructuraResult.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type}`);
    });

    // 5. Verificar datos combinados
    console.log('\n5. Verificando datos en la vista unificada...');
    const [datosCombinadosResult] = await sequelize.query(`
      SELECT 
        source,
        COUNT(*) as total_registros,
        COUNT(DISTINCT idOrdenServicio) as ordenes_unicas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(mts2), 0) as total_mt2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      GROUP BY source
      ORDER BY total_registros DESC
    `);
    
    console.log('📊 Resumen por origen:');
    datosCombinadosResult.forEach(item => {
      console.log(`   - ${item.source}: ${item.total_registros} registros, ${item.ordenes_unicas} órdenes únicas`);
      console.log(`     Pabellones: ${item.total_pabellones}, m²: ${item.total_mt2}, Daños: ${item.total_danos}`);
    });

    // 6. Verificar daños específicos
    console.log('\n6. Verificando daños en la vista unificada...');
    const [danosResult] = await sequelize.query(`
      SELECT 
        source,
        COALESCE(nombreTipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      WHERE cantidadDano > 0
      GROUP BY source, nombreTipoDano
      ORDER BY source, total_danos DESC
    `);
    
    console.log('🚨 Daños por origen y tipo:');
    danosResult.forEach(item => {
      console.log(`   - ${item.source} > ${item.tipo_dano}: ${item.cantidad} registros, ${item.total_danos} daños`);
    });

    // 7. Mostrar configuración recomendada
    console.log('\n7. Configuración recomendada para el sistema:');
    if (tieneHistoricos && tieneActuales) {
      console.log('   🎯 VISTA COMPLETA: Históricos + Actuales');
      console.log('   ✅ Usar vw_ordenes_unificada_completa en controladores');
      console.log('   ✅ Habilitar filtros: Todos, Histórico 2025, Sistema Actual');
    } else if (tieneHistoricos) {
      console.log('   🎯 VISTA HISTÓRICA: Solo datos de 2025');
      console.log('   ✅ Usar vw_ordenes_2025_actual en controladores (más simple)');
      console.log('   ✅ O usar vw_ordenes_unificada_completa (preparado para futuro)');
      console.log('   ✅ Filtros: Todos, Histórico 2025');
    }

    console.log('\n✅ Vista unificada completa creada exitosamente!');
    console.log('🎯 La vista está preparada para datos históricos y futuros datos actuales');
    console.log('📊 El sistema puede usar esta vista para análisis completos');
    console.log('🚀 Cuando agregues planillas, automáticamente se incluirán en la vista');

  } catch (error) {
    console.error('❌ Error creando vista unificada completa:', error.message);
    
    if (error.message.includes('doesn\'t exist')) {
      console.log('\n💡 Algunas tablas no existen. Verificar que existan:');
      console.log('   - migracion_ordenes_2025 (datos históricos)');
      console.log('   - planilla (datos actuales)');
      console.log('   - dano (daños actuales)');
    }
    
    if (error.message.includes('syntax')) {
      console.log('\n💡 Error de sintaxis en la consulta SQL');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
crearVistaUnificadaCompleta(); 