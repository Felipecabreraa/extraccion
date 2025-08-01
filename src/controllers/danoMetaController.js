const sequelize = require('../config/database');

// Controlador simplificado para metas y proyecciones de daños
exports.getDanoMetaStats = async (req, res) => {
  try {
    console.log('🎯 Obteniendo estadísticas de metas de daños...');
    
    // Extraer parámetros
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const previousYear = year - 1;
    const porcentajeDisminucion = req.query.porcentaje ? parseFloat(req.query.porcentaje) : 5.0;
    
    console.log('📊 Parámetros:', { year, previousYear, porcentajeDisminucion });
    
    // 1. Obtener total de daños del año anterior (2024)
    const [totalAnioAnteriorResult] = await sequelize.query(`
      SELECT COALESCE(SUM(total_danos), 0) as total_danos_anio_anterior
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { replacements: [previousYear] });
    
    const totalDanoAnioAnterior = parseInt(totalAnioAnteriorResult[0].total_danos_anio_anterior);
    console.log(`   ✅ Total daños ${previousYear}: ${totalDanoAnioAnterior}`);
    
    // 2. Calcular meta anual y mensual
    const disminucion = totalDanoAnioAnterior * (porcentajeDisminucion / 100);
    const metaAnual = Math.round(totalDanoAnioAnterior - disminucion);
    const metaMensual = Math.round(metaAnual / 12);
    
    console.log(`   📊 Meta anual ${year}: ${metaAnual} (disminución ${porcentajeDisminucion}%)`);
    console.log(`   📊 Meta mensual: ${metaMensual}`);
    
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
    
    // 4. Obtener datos del año anterior por mes
    const [datosAnioAnteriorResult] = await sequelize.query(`
      SELECT 
        mes,
        SUM(total_danos) as total_danos_mes
      FROM vw_danos_mes_anio
      WHERE anio = ?
      GROUP BY mes
      ORDER BY mes ASC
    `, { replacements: [previousYear] });
    
    console.log(`   ✅ Datos reales obtenidos para ${year}: ${datosRealesResult.length} meses`);
    
    // 5. Preparar datos mensuales
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    let acumuladoReal = 0;
    let acumuladoMeta = 0;
    let acumuladoAnioAnterior = 0;
    
    const datosMensuales = [];
    
    for (let i = 0; i < meses.length; i++) {
      const nombreMes = meses[i];
      const mes = i + 1;
      const datosReales = datosRealesResult.find(d => d.mes === mes);
      const datosAnioAnterior = datosAnioAnteriorResult.find(d => d.mes === mes);
      
      const danosReales = datosReales ? parseInt(datosReales.total_danos_mes) : 0;
      const danosAnioAnterior = datosAnioAnterior ? parseInt(datosAnioAnterior.total_danos_mes) : 0;
      
      // Acumular correctamente
      acumuladoReal = acumuladoReal + danosReales;
      acumuladoMeta = acumuladoMeta + metaMensual;
      acumuladoAnioAnterior = acumuladoAnioAnterior + danosAnioAnterior;
      
      const diferencia = danosReales - metaMensual;
      const diferenciaAcumulada = acumuladoReal - acumuladoMeta;
      
             datosMensuales.push({
         mes: Number(mes),
         nombreMes: nombreMes,
         danosReales: Number(danosReales),
         danosAnioAnterior: Number(danosAnioAnterior),
         metaMensual: Number(metaMensual),
         diferencia: Number(diferencia),
         acumuladoReal: Number(acumuladoReal),
         acumuladoMeta: Number(acumuladoMeta),
         acumuladoAnioAnterior: Number(acumuladoAnioAnterior),
         diferenciaAcumulada: Number(diferenciaAcumulada),
         tieneDatos: datosReales !== undefined
       });
    }
    
    // 6. Calcular estadísticas del año actual
    const totalRealHastaAhora = datosMensuales.reduce((sum, mes) => sum + mes.danosReales, 0);
    const mesesConDatos = datosMensuales.filter(mes => mes.tieneDatos).length;
    const promedioRealMensual = mesesConDatos > 0 ? Math.round(totalRealHastaAhora / mesesConDatos) : 0;
    const proyeccionAnual = promedioRealMensual * 12;
    
    // Calcular meta acumulada hasta el momento
    const metaAcumuladaHastaAhora = metaMensual * mesesConDatos;
    const cumplimientoMeta = metaAcumuladaHastaAhora > 0 ? Math.round((totalRealHastaAhora / metaAcumuladaHastaAhora) * 100) : 0;
    
    // 7. Preparar respuesta
    const response = {
      configuracion: {
        anioActual: year,
        anioAnterior: previousYear,
        porcentajeDisminucion: porcentajeDisminucion,
        metaAnual: metaAnual,
        metaMensual: metaMensual
      },
      datosAnioAnterior: {
        totalDanos: totalDanoAnioAnterior,
        mesesConDatos: 12
      },
      datosAnioActual: {
        totalRealHastaAhora: Number(totalRealHastaAhora),
        mesesConDatos: Number(mesesConDatos),
        promedioRealMensual: Number(promedioRealMensual),
        proyeccionAnual: Number(proyeccionAnual),
        cumplimientoMeta: Number(cumplimientoMeta)
      },
      datosMensuales: datosMensuales,
      metadata: {
        timestamp: new Date().toISOString(),
        origen: 'vw_danos_mes_anio',
        calculado: true
      }
    };
    
    console.log('✅ Estadísticas de metas calculadas exitosamente');
    console.log(`   📊 Meta anual: ${metaAnual}, Real hasta ahora: ${totalRealHastaAhora}`);
    console.log(`   📊 Cumplimiento: ${cumplimientoMeta}%`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de metas de daños:', error);
    
    const fallbackResponse = {
      configuracion: {
        anioActual: new Date().getFullYear(),
        anioAnterior: new Date().getFullYear() - 1,
        porcentajeDisminucion: 5.0,
        metaAnual: 0,
        metaMensual: 0
      },
      datosAnioAnterior: {
        totalDanos: 0,
        mesesConDatos: 0
      },
      datosAnioActual: {
        totalRealHastaAhora: 0,
        mesesConDatos: 0,
        promedioRealMensual: 0,
        proyeccionAnual: 0,
        cumplimientoMeta: 0
      },
      datosMensuales: [],
      metadata: {
        timestamp: new Date().toISOString(),
        origen: 'error',
        calculado: false,
        error: error.message
      }
    };
    
    res.json(fallbackResponse);
  }
};

// Método para obtener solo los datos de metas (más ligero)
exports.getDanoMetaResumen = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const previousYear = year - 1;
    const porcentajeDisminucion = req.query.porcentaje ? parseFloat(req.query.porcentaje) : 5.0;
    
    // Obtener total del año anterior
    const [totalAnioAnteriorResult] = await sequelize.query(`
      SELECT COALESCE(SUM(total_danos), 0) as total_danos_anio_anterior
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { replacements: [previousYear] });
    
    const totalDanoAnioAnterior = parseInt(totalAnioAnteriorResult[0].total_danos_anio_anterior);
    const metaAnual = Math.round(totalDanoAnioAnterior * (1 - porcentajeDisminucion / 100));
    const metaMensual = Math.round(metaAnual / 12);
    
    // Obtener total real del año actual
    const [totalAnioActualResult] = await sequelize.query(`
      SELECT COALESCE(SUM(total_danos), 0) as total_danos_anio_actual
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { replacements: [year] });
    
    const totalRealHastaAhora = parseInt(totalAnioActualResult[0].total_danos_anio_actual);
    
    // Calcular meta acumulada hasta el momento (asumiendo que estamos en el mes actual)
    const mesActual = new Date().getMonth() + 1; // 1-12
    const metaAcumuladaHastaAhora = metaMensual * mesActual;
    const cumplimientoMeta = metaAcumuladaHastaAhora > 0 ? Math.round((totalRealHastaAhora / metaAcumuladaHastaAhora) * 100) : 0;
    
    res.json({
      anioActual: year,
      anioAnterior: previousYear,
      totalAnioAnterior: totalDanoAnioAnterior,
      metaAnual: metaAnual,
      metaMensual: metaMensual,
      totalRealHastaAhora: totalRealHastaAhora,
      cumplimientoMeta: cumplimientoMeta,
      porcentajeDisminucion: porcentajeDisminucion
    });
    
  } catch (error) {
    console.error('Error obteniendo resumen de metas:', error);
    res.status(500).json({ error: error.message });
  }
}; 