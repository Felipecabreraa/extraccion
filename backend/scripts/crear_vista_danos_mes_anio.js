const sequelize = require('../src/config/database');

async function crearVistaDanosMesAnio() {
  try {
    console.log('🔧 Creando vista de daños por mes y año...\n');

    // 1. Verificar que las tablas/vistas necesarias existen
    console.log('1. Verificando existencia de tablas y vistas...');
    
    const [tablasResult] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        CASE 
          WHEN TABLE_NAME = 'migracion_ordenes' THEN 'históricos_2024'
          WHEN TABLE_NAME = 'vw_ordenes_unificada_completa' THEN 'vista_unificada'
          WHEN TABLE_NAME = 'dano' THEN 'daños_actuales'
          ELSE 'otras'
        END as tipo
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('migracion_ordenes', 'dano')
      UNION
      SELECT 
        TABLE_NAME,
        'vista_unificada' as tipo
      FROM information_schema.views 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'vw_ordenes_unificada_completa'
      ORDER BY TABLE_NAME
    `);
    
    console.log('✅ Tablas y vistas encontradas:');
    tablasResult.forEach(tabla => {
      console.log(`   - ${tabla.TABLE_NAME} (${tabla.tipo})`);
    });

    // 2. Crear la vista unificada de daños por mes y año
    console.log('\n2. Creando vista vw_danos_mes_anio...');
    
    const createViewSQL = `
      CREATE OR REPLACE VIEW vw_danos_mes_anio AS
      
      -- DATOS HISTÓRICOS DE 2024 (migracion_ordenes)
      SELECT 
        YEAR(fecha_inicio) as anio,
        MONTH(fecha_inicio) as mes,
        SUM(COALESCE(cantidad_dano, 0)) as total_danos,
        COUNT(*) as cantidad_registros,
        'historico_2024' as origen
      FROM migracion_ordenes
      WHERE fecha_inicio IS NOT NULL 
        AND cantidad_dano > 0
      GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)
      
      UNION ALL
      
      -- DATOS DE 2025 EN ADELANTE (vw_ordenes_unificada_completa)
      SELECT 
        YEAR(fechaOrdenServicio) as anio,
        MONTH(fechaOrdenServicio) as mes,
        SUM(COALESCE(cantidadDano, 0)) as total_danos,
        COUNT(*) as cantidad_registros,
        source as origen
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio IS NOT NULL 
        AND cantidadDano > 0
      GROUP BY YEAR(fechaOrdenServicio), MONTH(fechaOrdenServicio), source
      
      ORDER BY anio DESC, mes ASC
    `;

    await sequelize.query(createViewSQL);
    console.log('✅ Vista vw_danos_mes_anio creada exitosamente');

    // 3. Verificar la nueva estructura
    console.log('\n3. Verificando estructura de la vista...');
    const [estructuraResult] = await sequelize.query('DESCRIBE vw_danos_mes_anio');
    
    console.log(`   ✅ Campos disponibles: ${estructuraResult.length}`);
    estructuraResult.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type}`);
    });

    // 4. Verificar datos en la vista
    console.log('\n4. Verificando datos en la vista...');
    const [datosResult] = await sequelize.query(`
      SELECT 
        anio,
        mes,
        SUM(total_danos) as total_danos_anio_mes,
        SUM(cantidad_registros) as total_registros_anio_mes,
        GROUP_CONCAT(origen) as origenes
      FROM vw_danos_mes_anio
      GROUP BY anio, mes
      ORDER BY anio DESC, mes ASC
    `);
    
    console.log('📊 Resumen de datos por año y mes:');
    datosResult.forEach(item => {
      const nombreMes = new Date(2024, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' });
      console.log(`   - ${item.anio} ${nombreMes}: ${item.total_danos_anio_mes} daños (${item.total_registros_anio_mes} registros)`);
    });

    // 5. Verificar totales por año
    console.log('\n5. Verificando totales por año...');
    const [totalesAnioResult] = await sequelize.query(`
      SELECT 
        anio,
        SUM(total_danos) as total_danos_anio,
        SUM(cantidad_registros) as total_registros_anio
      FROM vw_danos_mes_anio
      GROUP BY anio
      ORDER BY anio DESC
    `);
    
    console.log('📊 Totales por año:');
    totalesAnioResult.forEach(item => {
      console.log(`   - ${item.anio}: ${item.total_danos_anio} daños (${item.total_registros_anio} registros)`);
    });

    // 6. Mostrar configuración para el sistema
    console.log('\n6. Configuración para el sistema:');
    console.log('   🎯 La vista vw_danos_mes_anio está lista para usar');
    console.log('   ✅ Campos disponibles: anio, mes, total_danos, cantidad_registros, origen');
    console.log('   ✅ Datos unificados de 2024 y 2025+');
    console.log('   ✅ Agrupación por año y mes');
    console.log('   ✅ Ordenamiento cronológico');

    console.log('\n✅ Vista de daños por mes y año creada exitosamente!');
    console.log('🎯 La vista está preparada para cálculos de metas y proyecciones');
    console.log('📊 El sistema puede usar esta vista para análisis de tendencias');

  } catch (error) {
    console.error('❌ Error creando vista de daños por mes y año:', error.message);
    
    if (error.message.includes('doesn\'t exist')) {
      console.log('\n💡 Algunas tablas no existen. Verificar que existan:');
      console.log('   - migracion_ordenes (datos históricos 2024)');
      console.log('   - vw_ordenes_unificada_completa (datos 2025+)');
    }
    
    if (error.message.includes('syntax')) {
      console.log('\n💡 Error de sintaxis en la consulta SQL');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearVistaDanosMesAnio();
}

module.exports = { crearVistaDanosMesAnio }; 