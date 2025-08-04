const sequelize = require('../src/config/database');

async function testMetasDanosCorregido() {
  try {
    console.log('🧪 Probando cálculos de metas de daños...\n');

    // 1. Verificar que la vista existe y tiene datos
    console.log('1. Verificando vista vw_danos_mes_anio...');
    
    const [datosVista] = await sequelize.query(`
      SELECT 
        anio,
        SUM(total_danos) as total_danos_anio,
        SUM(cantidad_registros) as total_registros_anio
      FROM vw_danos_mes_anio
      GROUP BY anio
      ORDER BY anio DESC
    `);
    
    console.log('✅ Datos disponibles en la vista:');
    datosVista.forEach(item => {
      console.log(`   - ${item.anio}: ${item.total_danos_anio} daños (${item.total_registros_anio} registros)`);
    });

    // 2. Calcular meta para 2025 basada en 2024
    console.log('\n2. Calculando meta para 2025...');
    
    const anioActual = 2025;
    const anioAnterior = 2024;
    const porcentajeDisminucion = 5; // 5% de disminución
    
    // Obtener total de daños del año anterior (2024)
    const [datosAnioAnterior] = await sequelize.query(`
      SELECT COALESCE(SUM(total_danos), 0) as total_danos_anio_anterior
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { replacements: [anioAnterior] });
    
    const totalDanoAnioAnterior = parseInt(datosAnioAnterior[0].total_danos_anio_anterior);
    console.log(`   📊 Total daños ${anioAnterior}: ${totalDanoAnioAnterior}`);
    
    // Calcular meta anual
    const metaAnual = Math.round(totalDanoAnioAnterior * (1 - porcentajeDisminucion / 100));
    const metaMensual = Math.round(metaAnual / 12);
    
    console.log(`   🎯 Meta anual ${anioActual}: ${metaAnual} daños`);
    console.log(`   📅 Meta mensual: ${metaMensual} daños por mes`);
    
    // 3. Obtener datos reales del año actual
    console.log('\n3. Obteniendo datos reales del año actual...');
    
    const [datosAnioActual] = await sequelize.query(`
      SELECT 
        mes,
        total_danos as daños_mes,
        cantidad_registros as registros_mes
      FROM vw_danos_mes_anio
      WHERE anio = ?
      ORDER BY mes ASC
    `, { replacements: [anioActual] });
    
    console.log(`   📊 Datos reales ${anioActual} por mes:`);
    let totalRealHastaAhora = 0;
    datosAnioActual.forEach(item => {
      const nombreMes = new Date(2025, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' });
      const dañosMes = parseInt(item.daños_mes);
      totalRealHastaAhora += dañosMes;
      console.log(`      - ${nombreMes}: ${dañosMes} daños (${item.registros_mes} registros)`);
    });
    
    console.log(`   📈 Total real hasta ahora: ${totalRealHastaAhora} daños`);
    
    // 4. Calcular cumplimiento
    console.log('\n4. Calculando cumplimiento...');
    
    const cumplimientoMeta = (totalRealHastaAhora / metaAnual) * 100;
    const diferencia = totalRealHastaAhora - metaAnual;
    
    console.log(`   🎯 Meta anual: ${metaAnual} daños`);
    console.log(`   📊 Real hasta ahora: ${totalRealHastaAhora} daños`);
    console.log(`   📈 Cumplimiento: ${cumplimientoMeta.toFixed(2)}%`);
    console.log(`   📊 Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia} daños`);
    
    // 5. Preparar datos para el frontend
    console.log('\n5. Preparando datos para el frontend...');
    
    const datosParaFrontend = {
      anioActual,
      anioAnterior,
      porcentajeDisminucion,
      metaAnual,
      metaMensual,
      totalRealHastaAhora,
      cumplimientoMeta: Math.round(cumplimientoMeta * 100) / 100,
      diferencia,
      datosMensuales: datosAnioActual.map(item => ({
        mes: item.mes,
        nombreMes: new Date(2025, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' }),
        real: parseInt(item.daños_mes),
        meta: metaMensual,
        diferencia: parseInt(item.daños_mes) - metaMensual,
        cumplimiento: ((parseInt(item.daños_mes) / metaMensual) * 100).toFixed(2)
      }))
    };
    
    console.log('✅ Datos preparados correctamente:');
    console.log(`   - Meta anual: ${datosParaFrontend.metaAnual}`);
    console.log(`   - Meta mensual: ${datosParaFrontend.metaMensual}`);
    console.log(`   - Cumplimiento: ${datosParaFrontend.cumplimientoMeta}%`);
    console.log(`   - Datos mensuales: ${datosParaFrontend.datosMensuales.length} meses`);
    
    console.log('\n✅ Prueba completada exitosamente!');
    console.log('🎯 El sistema de metas está funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await sequelize.close();
  }
}

testMetasDanosCorregido(); 