const sequelize = require('./src/config/database');

async function verificarDatosReales2024() {
  try {
    console.log('🧪 Verificando datos reales de 2024 en la base de datos...');
    
    const year = 2024;
    
    // Verificar datos de migracion_ordenes (2024)
    const [datosMigracion2024] = await sequelize.query(`
      SELECT 
        MONTH(fecha_inicio) as mes,
        COUNT(*) as total_danos
      FROM migracion_ordenes
      WHERE YEAR(fecha_inicio) = ?
      GROUP BY MONTH(fecha_inicio)
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS DE migracion_ordenes (2024):');
    datosMigracion2024.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos} daños`);
    });
    
    // Verificar datos de vw_ordenes_unificada_completa (2024)
    const [datosVista2024] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(*) as total_danos
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ?
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS DE vw_ordenes_unificada_completa (2024):');
    datosVista2024.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos} daños`);
    });
    
    // Verificar datos de vw_danos_mes_anio (2024)
    const [datosVistaDanos2024] = await sequelize.query(`
      SELECT 
        mes,
        SUM(total_danos) as total_danos
      FROM vw_danos_mes_anio
      WHERE anio = ?
      GROUP BY mes
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS DE vw_danos_mes_anio (2024):');
    datosVistaDanos2024.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos} daños`);
    });
    
    console.log('\n✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarDatosReales2024(); 