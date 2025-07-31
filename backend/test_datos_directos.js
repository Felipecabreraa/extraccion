const sequelize = require('./src/config/database');

async function testDatosDirectos() {
  try {
    console.log('🧪 Verificando datos directamente de la base de datos...');
    
    const year = 2025;
    const previousYear = 2024;
    
    // Obtener datos reales del año actual
    const [datosRealesResult] = await sequelize.query(`
      SELECT 
        mes,
        SUM(total_danos) as total_danos_mes
      FROM vw_danos_mes_anio
      WHERE anio = ?
      GROUP BY mes
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS REALES 2025:');
    datosRealesResult.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos_mes} daños`);
    });
    
    // Obtener datos del año anterior
    const [datosAnioAnteriorResult] = await sequelize.query(`
      SELECT 
        mes,
        SUM(total_danos) as total_danos_mes
      FROM vw_danos_mes_anio
      WHERE anio = ?
      GROUP BY mes
      ORDER BY mes ASC
    `, { replacements: [previousYear] });
    
    console.log('\n📊 DATOS AÑO ANTERIOR 2024:');
    datosAnioAnteriorResult.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos_mes} daños`);
    });
    
    // Calcular acumulados correctamente
    console.log('\n📊 CÁLCULO DE ACUMULADOS:');
    let acumuladoReal = 0;
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    meses.forEach((nombreMes, index) => {
      const mes = index + 1;
      const datosReales = datosRealesResult.find(d => d.mes === mes);
      const danosReales = datosReales ? parseInt(datosReales.total_danos_mes) : 0;
      
      acumuladoReal += danosReales;
      
      if (datosReales) {
        console.log(`   ${nombreMes}: ${danosReales} daños → Acumulado: ${acumuladoReal}`);
      }
    });
    
    console.log('\n✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatosDirectos(); 