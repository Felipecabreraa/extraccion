const sequelize = require('./src/config/database');

async function testAnioAnterior() {
  try {
    console.log('🧪 Verificando datos del año anterior (2024)...');
    
    const previousYear = 2024;
    
    // Obtener datos del año anterior por mes
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
    
    // Calcular acumulados del año anterior
    console.log('\n📊 CÁLCULO DE ACUMULADOS AÑO ANTERIOR:');
    let acumuladoAnioAnterior = 0;
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    meses.forEach((nombreMes, index) => {
      const mes = index + 1;
      const datosAnioAnterior = datosAnioAnteriorResult.find(d => d.mes === mes);
      const danosAnioAnterior = datosAnioAnterior ? parseInt(datosAnioAnterior.total_danos_mes) : 0;
      
      acumuladoAnioAnterior += danosAnioAnterior;
      
      if (datosAnioAnterior) {
        console.log(`   ${nombreMes}: ${danosAnioAnterior} daños → Acumulado: ${acumuladoAnioAnterior}`);
      }
    });
    
    console.log('\n✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testAnioAnterior(); 