const sequelize = require('./src/config/database');

async function calcularMetasSimples() {
  try {
    console.log('🎯 Calculando metas simples...');
    
    const year = 2025;
    const previousYear = 2024;
    const porcentajeDisminucion = 5.0;
    
    // 1. Obtener total de daños del año anterior (2024)
    const [totalAnioAnteriorResult] = await sequelize.query(`
      SELECT COALESCE(SUM(total_danos), 0) as total_danos_anio_anterior
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { replacements: [previousYear] });
    
    const totalDanoAnioAnterior = parseInt(totalAnioAnteriorResult[0].total_danos_anio_anterior);
    console.log(`📊 Total daños ${previousYear}: ${totalDanoAnioAnterior}`);
    
    // 2. Calcular meta anual y mensual
    const disminucion = totalDanoAnioAnterior * (porcentajeDisminucion / 100);
    const metaAnual = Math.round(totalDanoAnioAnterior - disminucion);
    const metaMensual = Math.round(metaAnual / 12);
    
    console.log(`📊 Meta anual ${year}: ${metaAnual} (disminución ${porcentajeDisminucion}%)`);
    console.log(`📊 Meta mensual: ${metaMensual}`);
    
    // 3. Obtener datos reales del año actual por mes
    const [datosRealesResult] = await sequelize.query(`
      SELECT 
        mes,
        SUM(total_danos) as total_danos_mes
      FROM vw_danos_mes_anio
      WHERE anio = ?
      GROUP BY mes
      ORDER BY mes ASC
    `, { replacements: [year] });
    
    console.log(`📊 Datos reales obtenidos para ${year}: ${datosRealesResult.length} meses`);
    
    // 4. Preparar datos mensuales
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    let acumuladoReal = 0;
    let acumuladoMeta = 0;
    
    const datosMensuales = meses.map((nombreMes, index) => {
      const mes = index + 1;
      const datosReales = datosRealesResult.find(d => d.mes === mes);
      const danosReales = datosReales ? parseInt(datosReales.total_danos_mes) : 0;
      
      acumuladoReal += danosReales;
      acumuladoMeta += metaMensual;
      
      const diferencia = danosReales - metaMensual;
      const diferenciaAcumulada = acumuladoReal - acumuladoMeta;
      
      return {
        mes: mes,
        nombreMes: nombreMes,
        danosReales: danosReales,
        metaMensual: metaMensual,
        diferencia: diferencia,
        acumuladoReal: acumuladoReal,
        acumuladoMeta: acumuladoMeta,
        diferenciaAcumulada: diferenciaAcumulada,
        tieneDatos: datosReales !== undefined
      };
    });
    
    // 5. Calcular estadísticas del año actual
    const totalRealHastaAhora = datosMensuales.reduce((sum, mes) => sum + parseInt(mes.danosReales), 0);
    const mesesConDatos = datosMensuales.filter(mes => mes.tieneDatos).length;
    const promedioRealMensual = mesesConDatos > 0 ? Math.round(totalRealHastaAhora / mesesConDatos) : 0;
    const proyeccionAnual = promedioRealMensual * 12;
    const cumplimientoMeta = metaAnual > 0 ? Math.round((totalRealHastaAhora / metaAnual) * 100) : 0;
    
    console.log('\n📊 RESULTADOS:');
    console.log(`   Meta anual: ${metaAnual}`);
    console.log(`   Meta mensual: ${metaMensual}`);
    console.log(`   Total real hasta ahora: ${totalRealHastaAhora}`);
    console.log(`   Meses con datos: ${mesesConDatos}`);
    console.log(`   Promedio real mensual: ${promedioRealMensual}`);
    console.log(`   Proyección anual: ${proyeccionAnual}`);
    console.log(`   Cumplimiento meta: ${cumplimientoMeta}%`);
    
    console.log('\n📊 DATOS MENSUALES:');
    datosMensuales.forEach(mes => {
      if (mes.tieneDatos) {
        console.log(`   ${mes.nombreMes}: ${mes.danosReales} reales vs ${mes.metaMensual} meta (${mes.diferencia > 0 ? '+' : ''}${mes.diferencia})`);
      }
    });
    
    console.log('\n✅ Cálculos completados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

calcularMetasSimples(); 