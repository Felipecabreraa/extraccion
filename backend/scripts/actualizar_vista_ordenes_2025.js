const sequelize = require('../src/config/database');

async function actualizarVistaOrdenes2025() {
  try {
    console.log('🔍 Analizando estructura de tablas para actualizar vista...\n');

    // 1. Verificar que existe la tabla migracion_ordenes_2025
    console.log('1. Verificando existencia de migracion_ordenes_2025...');
    const [tablaExiste] = await sequelize.query("SHOW TABLES LIKE 'migracion_ordenes_2025'");
    
    if (tablaExiste.length === 0) {
      console.log('❌ La tabla migracion_ordenes_2025 NO EXISTE');
      console.log('💡 Esta tabla debe existir para poder actualizar la vista');
      return;
    }
    
    console.log('✅ La tabla migracion_ordenes_2025 EXISTE');

    // 2. Obtener estructura de migracion_ordenes_2025
    console.log('\n2. Estructura de migracion_ordenes_2025:');
    const [columnasMigracion] = await sequelize.query('DESCRIBE migracion_ordenes_2025');
    
    const camposMigracion = columnasMigracion.map(col => col.Field);
    console.log(`   ✅ Campos encontrados: ${camposMigracion.length}`);
    camposMigracion.forEach(campo => {
      console.log(`      - ${campo}`);
    });

    // 3. Verificar si existe la vista actual
    console.log('\n3. Verificando vista actual...');
    const [vistaExiste] = await sequelize.query(`
      SELECT COUNT(*) as existe
      FROM information_schema.views 
      WHERE table_name = 'vw_ordenes_2025_actual'
    `);
    
    if (vistaExiste[0].existe > 0) {
      console.log('✅ Vista vw_ordenes_2025_actual existe, se actualizará');
    } else {
      console.log('⚠️ Vista vw_ordenes_2025_actual no existe, se creará');
    }

    // 4. Crear vista actualizada usando solo campos que existen
    console.log('\n4. Creando vista actualizada...');
    
    const createViewSQL = `
      CREATE OR REPLACE VIEW vw_ordenes_2025_actual AS
      SELECT 
        -- Campos principales
        id_orden_servicio as idOrdenServicio,
        fecha_inicio as fechaOrdenServicio,
        fecha_fin as fechaFinOrdenServicio,
        COALESCE(supervisor, 'Sin supervisor') as nombreSupervisor,
        COALESCE(sector, nombreSector, 'Sin sector') as nombreSector,
        
        -- Campos de pabellones y metros cuadrados
        COALESCE(pabellones_total, 0) as cantidadPabellones,
        COALESCE(pabellones_limpiados, 0) as cantLimpiar,
        COALESCE(mts2, 0) as mts2,
        
        -- Campos de máquinas y operadores
        COALESCE(maquina, 'Sin máquina') as nroMaquina,
        COALESCE(operador, 'Sin operador') as nombreOperador,
        odometro_inicio as odometroInicio,
        odometro_fin as odometroFin,
        litros_petroleo as litrosPetroleo,
        
        -- Campos de barredores
        COALESCE(barredor, 'Sin barredor') as nombreBarredor,
        
        -- Campos de daños
        COALESCE(tipo_dano, 'Sin tipo') as nombreTipoDano,
        COALESCE('Sin descripción') as nombreDescripcionDano,
        COALESCE(cantidad_dano, 0) as cantidadDano,
        
        -- Campos adicionales
        nroPabellon,
        pabellon_id,
        observacion,
        'historico_2025' as source,
        NOW() as fechaCreacion
        
      FROM migracion_ordenes_2025
      WHERE fecha_inicio IS NOT NULL
    `;

    await sequelize.query(createViewSQL);
    console.log('✅ Vista vw_ordenes_2025_actual actualizada exitosamente');

    // 5. Verificar la nueva estructura
    console.log('\n5. Verificando nueva estructura de la vista...');
    const [nuevaEstructura] = await sequelize.query('DESCRIBE vw_ordenes_2025_actual');
    
    console.log(`   ✅ Nueva estructura con ${nuevaEstructura.length} campos:`);
    nuevaEstructura.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type}`);
    });

    // 6. Verificar datos
    console.log('\n6. Verificando datos en la vista actualizada...');
    const [datosVista] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT idOrdenServicio) as ordenes_unicas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(mts2), 0) as total_mt2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
    `);
    
    const resumen = datosVista[0];
    console.log(`   ✅ Total registros: ${resumen.total_registros}`);
    console.log(`   ✅ Órdenes únicas: ${resumen.ordenes_unicas}`);
    console.log(`   ✅ Total pabellones: ${resumen.total_pabellones}`);
    console.log(`   ✅ Total m²: ${resumen.total_mt2}`);
    console.log(`   ✅ Total daños: ${resumen.total_danos}`);

    // 7. Mostrar muestra de datos
    console.log('\n7. Muestra de datos actualizados:');
    const [muestra] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        fechaOrdenServicio,
        nombreSector,
        cantidadPabellones,
        mts2,
        cantidadDano,
        source
      FROM vw_ordenes_2025_actual
      LIMIT 3
    `);
    
    muestra.forEach((registro, index) => {
      console.log(`   Registro ${index + 1}:`);
      console.log(`      - ID: ${registro.idOrdenServicio}`);
      console.log(`      - Fecha: ${registro.fechaOrdenServicio}`);
      console.log(`      - Sector: ${registro.nombreSector}`);
      console.log(`      - Pabellones: ${registro.cantidadPabellones}`);
      console.log(`      - m²: ${registro.mts2}`);
      console.log(`      - Daños: ${registro.cantidadDano}`);
      console.log(`      - Origen: ${registro.source}`);
    });

    console.log('\n✅ Actualización de vista completada exitosamente!');
    console.log('📊 La vista vw_ordenes_2025_actual ahora incluye todos los campos de migracion_ordenes_2025');
    console.log('🎯 Los campos mts2, pabellones_total, pabellones_limpiados y otros están disponibles');

  } catch (error) {
    console.error('❌ Error actualizando vista:', error.message);
    
    if (error.message.includes('doesn\'t exist')) {
      console.log('\n💡 La tabla migracion_ordenes_2025 no existe o no es accesible');
    }
    
    if (error.message.includes('syntax')) {
      console.log('\n💡 Error de sintaxis en la consulta SQL');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
if (require.main === module) {
  actualizarVistaOrdenes2025();
}

module.exports = actualizarVistaOrdenes2025; 