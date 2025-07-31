const sequelize = require('./src/config/database');

async function verificarDatosDetallados2024() {
  try {
    console.log('🧪 Verificando datos detallados de 2024...');
    
    const year = 2024;
    
    // Verificar datos de migracion_ordenes con filtros
    const [datosMigracionDetallados] = await sequelize.query(`
      SELECT 
        MONTH(fecha_inicio) as mes,
        SUM(cantidad_dano) as total_danos,
        COUNT(*) as total_registros,
        COUNT(CASE WHEN cantidad_dano > 0 THEN 1 END) as registros_con_danos
      FROM migracion_ordenes
      WHERE YEAR(fecha_inicio) = ?
      GROUP BY MONTH(fecha_inicio)
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS DETALLADOS DE migracion_ordenes (2024):');
    datosMigracionDetallados.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos} daños (${row.total_registros} registros, ${row.registros_con_danos} con daños)`);
    });
    
    // Verificar datos de migracion_ordenes solo con daños
    const [datosMigracionSoloDanos] = await sequelize.query(`
      SELECT 
        MONTH(fecha_inicio) as mes,
        SUM(cantidad_dano) as total_danos,
        COUNT(*) as total_registros
      FROM migracion_ordenes
      WHERE YEAR(fecha_inicio) = ?
        AND cantidad_dano > 0
      GROUP BY MONTH(fecha_inicio)
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS DE migracion_ordenes SOLO CON DAÑOS (2024):');
    datosMigracionSoloDanos.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos} daños (${row.total_registros} registros)`);
    });
    
    // Verificar datos de vw_danos_mes_anio
    const [datosVistaDanos] = await sequelize.query(`
      SELECT 
        mes,
        SUM(total_danos) as total_danos,
        SUM(cantidad_registros) as total_registros,
        GROUP_CONCAT(origen) as origenes
      FROM vw_danos_mes_anio
      WHERE anio = ?
      GROUP BY mes
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS DE vw_danos_mes_anio (2024):');
    datosVistaDanos.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos} daños (${row.total_registros} registros) - Origen: ${row.origenes}`);
    });
    
    console.log('\n✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarDatosDetallados2024(); 