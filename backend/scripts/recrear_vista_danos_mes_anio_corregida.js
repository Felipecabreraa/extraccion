const sequelize = require('../src/config/database');

async function recrearVistaDanosMesAnioCorregida() {
  try {
    console.log('🔄 Recreando vista vw_danos_mes_anio con estructura corregida...\n');

    // Recrear la vista sin problemas de collation
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
    console.log('✅ Vista vw_danos_mes_anio recreada exitosamente');

    // Verificar el resultado
    const [resultado] = await sequelize.query(`
      SELECT 
        anio,
        SUM(total_danos) as total_danos_anio,
        SUM(cantidad_registros) as total_registros_anio
      FROM vw_danos_mes_anio
      GROUP BY anio
      ORDER BY anio DESC
    `);
    
    console.log('\n📊 Estado final de la vista:');
    resultado.forEach(item => {
      console.log(`   - ${item.anio}: ${item.total_danos_anio} daños (${item.total_registros_anio} registros)`);
    });

    // Verificar datos por mes para 2024
    try {
      const [datos2024] = await sequelize.query(`
        SELECT 
          anio,
          mes,
          total_danos,
          cantidad_registros,
          origen
        FROM vw_danos_mes_anio
        WHERE anio = 2024
        ORDER BY mes ASC
      `);
      
      console.log('\n📊 Datos 2024 por mes:');
      datos2024.forEach(item => {
        const nombreMes = new Date(2024, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' });
        console.log(`   - ${nombreMes}: ${item.total_danos} daños (${item.cantidad_registros} registros)`);
      });
    } catch (error) {
      console.log('   ⚠️  No hay datos de 2024 disponibles');
    }

    // Verificar datos por mes para 2025
    try {
      const [datos2025] = await sequelize.query(`
        SELECT 
          anio,
          mes,
          total_danos,
          cantidad_registros,
          origen
        FROM vw_danos_mes_anio
        WHERE anio = 2025
        ORDER BY mes ASC
      `);
      
      console.log('\n📊 Datos 2025 por mes:');
      datos2025.forEach(item => {
        const nombreMes = new Date(2025, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' });
        console.log(`   - ${nombreMes}: ${item.total_danos} daños (${item.cantidad_registros} registros)`);
      });
    } catch (error) {
      console.log('   ⚠️  No hay datos de 2025 disponibles');
    }

    console.log('\n✅ Proceso completado!');
    console.log('🎯 La vista vw_danos_mes_anio está lista para cálculos de metas');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('collation')) {
      console.log('\n💡 Error de collation detectado. Intentando solución alternativa...');
      
      // Intentar crear la vista sin UNION para evitar problemas de collation
      try {
        const createViewSimpleSQL = `
          CREATE OR REPLACE VIEW vw_danos_mes_anio AS
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
        
        await sequelize.query(createViewSimpleSQL);
        console.log('✅ Vista vw_danos_mes_anio creada (solo datos unificados)');
        
        const [resultadoSimple] = await sequelize.query(`
          SELECT 
            anio,
            SUM(total_danos) as total_danos_anio,
            SUM(cantidad_registros) as total_registros_anio
          FROM vw_danos_mes_anio
          GROUP BY anio
          ORDER BY anio DESC
        `);
        
        console.log('\n📊 Estado final (solo datos unificados):');
        resultadoSimple.forEach(item => {
          console.log(`   - ${item.anio}: ${item.total_danos_anio} daños (${item.total_registros_anio} registros)`);
        });
        
      } catch (errorSimple) {
        console.error('❌ Error con solución alternativa:', errorSimple.message);
      }
    }
  } finally {
    await sequelize.close();
  }
}

recrearVistaDanosMesAnioCorregida(); 