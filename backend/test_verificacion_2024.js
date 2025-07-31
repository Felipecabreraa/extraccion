const sequelize = require('./src/config/database');

async function testVerificacion2024() {
  try {
    console.log('🧪 Verificando acumulados 2024 paso a paso...');
    
    const year = 2024;
    
    // Obtener datos del 2024 por mes
    const [datos2024Result] = await sequelize.query(`
      SELECT 
        mes,
        SUM(total_danos) as total_danos_mes
      FROM vw_danos_mes_anio
      WHERE anio = ?
      GROUP BY mes
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log('\n📊 DATOS 2024 POR MES:');
    datos2024Result.forEach(row => {
      console.log(`   Mes ${row.mes}: ${row.total_danos_mes} daños`);
    });
    
    // Calcular acumulados paso a paso
    console.log('\n📊 CÁLCULO DE ACUMULADOS 2024:');
    let acumulado = 0;
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    meses.forEach((nombreMes, index) => {
      const mes = index + 1;
      const datosMes = datos2024Result.find(d => d.mes === mes);
      const danosMes = datosMes ? parseInt(datosMes.total_danos_mes) : 0;
      
      if (datosMes) {
        const acumuladoAnterior = acumulado;
        acumulado += danosMes;
        console.log(`   ${nombreMes}: ${danosMes} daños`);
        console.log(`     → Acumulado anterior: ${acumuladoAnterior}`);
        console.log(`     → ${danosMes} + ${acumuladoAnterior} = ${acumulado}`);
        console.log(`     → Acumulado ${nombreMes}: ${acumulado}`);
        console.log('');
      }
    });
    
    console.log('✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testVerificacion2024(); 