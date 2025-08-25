// Cargar variables de entorno
require('./backend/config-db.js');
console.log('🔧 Variables de entorno cargadas desde config-db.js');

const sequelize = require('./backend/src/config/database');

/**
 * Script para probar la nueva funcionalidad de metas y proyecciones
 */
async function probarMetasYProyecciones() {
  try {
    console.log('🎯 Probando nueva funcionalidad de metas y proyecciones...');
    
    const year = 2025;
    const previousYear = 2024;
    const porcentajeDisminucion = 5.0;
    
    console.log(`📊 Año de análisis: ${year}`);
    console.log(`📊 Año anterior: ${previousYear}`);
    console.log(`📊 Porcentaje de disminución: ${porcentajeDisminucion}%`);
    
    // 1. Obtener total de daños del año anterior (base para cálculo)
    console.log('\n1️⃣ Obteniendo total de daños del año anterior...');
    const [totalAnioAnteriorResult] = await sequelize.query(`
      SELECT COALESCE(SUM(total_danos), 0) as total_danos_anio_anterior
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { 
      replacements: [previousYear],
      timeout: 10000
    });
    
    const totalDanoAnioAnterior = parseInt(totalAnioAnteriorResult[0].total_danos_anio_anterior);
    console.log(`✅ Total daños ${previousYear}: ${totalDanoAnioAnterior.toLocaleString()}`);
    
    // 2. Calcular meta anual y mensual
    console.log('\n2️⃣ Calculando metas...');
    const disminucion = totalDanoAnioAnterior * (porcentajeDisminucion / 100);
    const metaAnual = Math.round(totalDanoAnioAnterior - disminucion);
    const metaMensual = Math.round(metaAnual / 12);
    
    console.log(`✅ Meta anual ${year}: ${metaAnual.toLocaleString()}`);
    console.log(`✅ Meta mensual: ${metaMensual.toLocaleString()}`);
    console.log(`✅ Disminución aplicada: ${disminucion.toLocaleString()} (${porcentajeDisminucion}%)`);
    
    // 3. Obtener datos reales del año actual
    console.log('\n3️⃣ Obteniendo datos reales del año actual...');
    const [datosRealesResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(total_danos), 0) as total_danos_anio_actual,
        COUNT(DISTINCT mes) as meses_con_datos
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { 
      replacements: [year],
      timeout: 10000
    });
    
    const totalRealHastaAhora = parseInt(datosRealesResult[0].total_danos_anio_actual);
    const mesesConDatos = parseInt(datosRealesResult[0].meses_con_datos);
    
    console.log(`✅ Real hasta ahora ${year}: ${totalRealHastaAhora.toLocaleString()}`);
    console.log(`✅ Meses con datos: ${mesesConDatos}`);
    
    // 4. Calcular cumplimiento
    console.log('\n4️⃣ Calculando cumplimiento...');
    const metaAcumuladaHastaAhora = metaMensual * mesesConDatos;
    const cumplimiento = metaAcumuladaHastaAhora > 0 ? Math.round((totalRealHastaAhora / metaAcumuladaHastaAhora) * 100) : 0;
    
    console.log(`✅ Meta acumulada hasta ahora: ${metaAcumuladaHastaAhora.toLocaleString()}`);
    console.log(`✅ Cumplimiento: ${cumplimiento}%`);
    
    // 5. Calcular promedio mensual real
    const promedioMensualReal = mesesConDatos > 0 ? Math.round(totalRealHastaAhora / mesesConDatos) : 0;
    console.log(`✅ Promedio mensual real: ${promedioMensualReal.toLocaleString()}`);
    
    // 6. Resumen final
    console.log('\n📋 RESUMEN FINAL:');
    console.log('='.repeat(50));
    console.log(`🎯 Meta Anual: $${metaAnual.toLocaleString()}`);
    console.log(`📊 Real Anual: $${totalRealHastaAhora.toLocaleString()}`);
    console.log(`✅ Cumplimiento: ${cumplimiento}%`);
    console.log(`📈 Daños Total Año Anterior: $${totalDanoAnioAnterior.toLocaleString()}`);
    console.log(`📅 Meses con datos: ${mesesConDatos}`);
    console.log(`💰 Meta mensual: $${metaMensual.toLocaleString()}`);
    console.log(`📊 Promedio mensual real: $${promedioMensualReal.toLocaleString()}`);
    console.log('='.repeat(50));
    
    // 7. Verificar datos por mes
    console.log('\n5️⃣ Verificando datos por mes...');
    const [datosMensuales] = await sequelize.query(`
      SELECT 
        mes,
        total_danos,
        origen
      FROM vw_danos_mes_anio
      WHERE anio = ?
      ORDER BY mes
    `, { 
      replacements: [year],
      timeout: 10000
    });
    
    console.log(`✅ Datos mensuales encontrados: ${datosMensuales.length} meses`);
    datosMensuales.forEach(d => {
      console.log(`   Mes ${d.mes}: ${d.total_danos.toLocaleString()} daños (${d.origen})`);
    });
    
    console.log('\n✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
probarMetasYProyecciones();
