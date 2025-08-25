// Cargar variables de entorno
require('./backend/config-db.js');
console.log('🔧 Variables de entorno cargadas desde config-db.js');

const sequelize = require('./backend/src/config/database');

/**
 * Función auxiliar para obtener nombre del mes
 */
function getMonthName(mes) {
  const meses = [
    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
  ];
  return meses[mes - 1] || '';
}

/**
 * Script para probar la nueva funcionalidad de resumen anual
 */
async function probarResumenAnual() {
  try {
    console.log('📊 Probando nueva funcionalidad de resumen anual...');
    
    const year = 2025;
    
    console.log(`📊 Año de análisis: ${year}`);
    
    // Obtener datos por tipo (HEMBRA/MACHO) y mes usando la tabla zona
    console.log('\n1️⃣ Obteniendo datos por tipo y mes...');
    const [datosMensuales] = await sequelize.query(`
      SELECT 
        MONTH(v.fechaOrdenServicio) as mes,
        SUM(CASE WHEN z.tipo = 'HEMBRA' THEN v.cantidadDano ELSE 0 END) as hembra,
        SUM(CASE WHEN z.tipo = 'MACHO' THEN v.cantidadDano ELSE 0 END) as macho,
        SUM(v.cantidadDano) as total
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN zona z ON z.nombre = CONCAT('Zona ', v.nroPabellon)
      WHERE YEAR(v.fechaOrdenServicio) = ? AND v.cantidadDano > 0
      GROUP BY MONTH(v.fechaOrdenServicio)
      ORDER BY mes
    `, { 
      replacements: [year],
      timeout: 10000
    });
    
    console.log(`✅ Datos mensuales obtenidos: ${datosMensuales.length} meses`);
    
    // Calcular totales anuales
    console.log('\n2️⃣ Calculando totales anuales...');
    const totalHembra = datosMensuales.reduce((sum, d) => sum + parseInt(d.hembra || 0), 0);
    const totalMacho = datosMensuales.reduce((sum, d) => sum + parseInt(d.macho || 0), 0);
    const totalAnual = totalHembra + totalMacho;
    
    console.log(`✅ Total HEMBRA: ${totalHembra.toLocaleString()}`);
    console.log(`✅ Total MACHO: ${totalMacho.toLocaleString()}`);
    console.log(`✅ Total Anual: ${totalAnual.toLocaleString()}`);
    
    // Calcular porcentajes
    console.log('\n3️⃣ Calculando porcentajes...');
    const porcentajeHembra = totalAnual > 0 ? Math.round((totalHembra / totalAnual) * 100) : 0;
    const porcentajeMacho = totalAnual > 0 ? Math.round((totalMacho / totalAnual) * 100) : 0;
    
    console.log(`✅ Porcentaje HEMBRA: ${porcentajeHembra}%`);
    console.log(`✅ Porcentaje MACHO: ${porcentajeMacho}%`);
    
    // Preparar datos para el desglose mensual
    console.log('\n4️⃣ Preparando desglose mensual...');
    const desgloseMensual = [];
    for (let mes = 1; mes <= 12; mes++) {
      const datosMes = datosMensuales.find(d => d.mes === mes);
      desgloseMensual.push({
        mes: mes,
        nombreMes: getMonthName(mes),
        hembra: parseInt(datosMes?.hembra || 0),
        macho: parseInt(datosMes?.macho || 0),
        total: parseInt(datosMes?.total || 0),
        tieneDatos: datosMes ? true : false
      });
    }
    
    // Mostrar resumen final
    console.log('\n📋 RESUMEN FINAL:');
    console.log('='.repeat(60));
    console.log('📊 DISTRIBUCIÓN POR TIPO:');
    console.log(`   HEMBRA: ${totalHembra.toLocaleString()} (${porcentajeHembra}%)`);
    console.log(`   MACHO:  ${totalMacho.toLocaleString()} (${porcentajeMacho}%)`);
    console.log(`   TOTAL:  ${totalAnual.toLocaleString()}`);
    console.log('');
    console.log('📅 DESGLOSE MENSUAL:');
    console.log('   Mes    HEMBRA  MACHO   TOTAL');
    console.log('   ----   ------  -----   -----');
    
    desgloseMensual.forEach(mes => {
      const statusHembra = mes.hembra > 0 ? '🔴' : '🟢';
      const statusMacho = mes.macho > 0 ? '🔴' : '🟢';
      const statusTotal = mes.total > 0 ? '🔴' : '🟢';
      
      console.log(`   ${mes.nombreMes.padEnd(6)} ${statusHembra} ${mes.hembra.toString().padStart(5)}  ${statusMacho} ${mes.macho.toString().padStart(5)}   ${statusTotal} ${mes.total.toString().padStart(5)}`);
    });
    
    console.log('='.repeat(60));
    console.log('✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
probarResumenAnual();
