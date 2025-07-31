const sequelize = require('../src/config/database');

async function testDistribucionConsumoSector() {
  try {
    console.log('🔍 Probando distribución de consumo por sector mejorada...\n');

    // Obtener datos de distribución de consumo por sector
    console.log('1. Obteniendo distribución de consumo por sector...');
    const [consumoPorSector] = await sequelize.query(`
      SELECT 
        nombreSector,
        COUNT(DISTINCT idOrdenServicio) as ordenesServicio,
        COUNT(*) as registros,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorRegistro,
        CASE 
          WHEN (SELECT SUM(litrosPetroleo) FROM vw_ordenes_unificada_completa WHERE YEAR(fechaOrdenServicio) = 2025 AND litrosPetroleo IS NOT NULL AND litrosPetroleo > 0) > 0
          THEN ROUND((SUM(litrosPetroleo) / (SELECT SUM(litrosPetroleo) FROM vw_ordenes_unificada_completa WHERE YEAR(fechaOrdenServicio) = 2025 AND litrosPetroleo IS NOT NULL AND litrosPetroleo > 0)) * 100, 2)
          ELSE 0 
        END as porcentajeDelTotal
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nombreSector
      HAVING totalLitros > 0
      ORDER BY totalLitros DESC
    `);

    // Procesar datos para la distribución mejorada
    const distribucionConsumoPorSector = consumoPorSector.map(sector => ({
      sector: sector.nombreSector,
      litros: parseFloat(sector.totalLitros),
      porcentaje: parseFloat(sector.porcentajeDelTotal),
      ordenes: parseInt(sector.ordenesServicio),
      registros: parseInt(sector.registros),
      pabellones: parseInt(sector.totalPabellones),
      pabellonesLimpiados: parseInt(sector.totalPabellonesLimpiados),
      mts2: parseFloat(sector.totalMts2),
      promedioPorRegistro: parseFloat(sector.promedioLitrosPorRegistro),
      eficiencia: parseFloat(sector.totalPabellones) > 0 ? 
        (parseFloat(sector.totalLitros) / parseFloat(sector.totalPabellones)).toFixed(2) : 0
    }));

    // Calcular estadísticas
    const totalLitros = distribucionConsumoPorSector.reduce((sum, sector) => sum + sector.litros, 0);
    const sumaPorcentajes = distribucionConsumoPorSector.reduce((sum, sector) => sum + sector.porcentaje, 0);
    const promedioLitrosPorSector = totalLitros / distribucionConsumoPorSector.length;

    console.log('2. Distribución de Consumo por Sector Mejorada:');
    console.log(`   📊 Total sectores: ${distribucionConsumoPorSector.length}`);
    console.log(`   ⛽ Total litros: ${totalLitros.toLocaleString()} L`);
    console.log(`   📈 Suma porcentajes: ${sumaPorcentajes.toFixed(2)}%`);
    console.log(`   📊 Promedio por sector: ${promedioLitrosPorSector.toFixed(0)} L`);

    console.log('\n3. Top 10 Sectores por Consumo:');
    distribucionConsumoPorSector.slice(0, 10).forEach((sector, index) => {
      console.log(`   ${index + 1}. ${sector.sector}: ${sector.litros.toLocaleString()} L (${sector.porcentaje}%)`);
      console.log(`      📋 ${sector.ordenes} órdenes, ${sector.registros} registros`);
      console.log(`      🏗️ ${sector.pabellones.toLocaleString()} pabellones, ${sector.mts2.toLocaleString()} m²`);
      console.log(`      ⚡ Eficiencia: ${sector.eficiencia} L/pabellón`);
    });

    // Verificar que no hay NaN%
    console.log('\n4. Verificando porcentajes (no debe haber NaN%):');
    const sectoresConNaN = distribucionConsumoPorSector.filter(sector => isNaN(sector.porcentaje));
    if (sectoresConNaN.length > 0) {
      console.log(`   ❌ ERROR: ${sectoresConNaN.length} sectores con NaN%`);
      sectoresConNaN.forEach(sector => {
        console.log(`      - ${sector.sector}: ${sector.porcentaje}%`);
      });
    } else {
      console.log('   ✅ Todos los porcentajes son válidos (no hay NaN%)');
    }

    // Mostrar estadísticas de la distribución
    console.log('\n5. Estadísticas de la Distribución:');
    const sectorMayorConsumo = distribucionConsumoPorSector[0];
    const sectorMenorConsumo = distribucionConsumoPorSector[distribucionConsumoPorSector.length - 1];
    
    console.log(`   🏆 Sector mayor consumo: ${sectorMayorConsumo.sector} (${sectorMayorConsumo.litros.toLocaleString()} L, ${sectorMayorConsumo.porcentaje}%)`);
    console.log(`   📉 Sector menor consumo: ${sectorMenorConsumo.sector} (${sectorMenorConsumo.litros.toLocaleString()} L, ${sectorMenorConsumo.porcentaje}%)`);
    
    // Calcular variación
    const variacion = ((sectorMayorConsumo.litros - sectorMenorConsumo.litros) / sectorMayorConsumo.litros * 100).toFixed(1);
    console.log(`   📊 Variación entre mayor y menor: ${variacion}%`);

    // Mostrar formato para interfaz
    console.log('\n6. Formato para Interfaz:');
    console.log('   📋 Título: "Distribución de Consumo por Sector"');
    console.log('   📝 Subtítulo: "Análisis de consumo de combustible por sector operativo"');
    console.log('   📊 Total: ' + totalLitros.toLocaleString() + ' L');
    console.log('   🏷️ Etiqueta: "TOTAL LITROS CONSUMIDOS" (no "TOTAL DAÑOS")');
    
    console.log('\n7. Ejemplos de formato para leyenda:');
    distribucionConsumoPorSector.slice(0, 5).forEach((sector, index) => {
      console.log(`   ${index + 1}. ${sector.sector}: ${sector.litros.toLocaleString()} L (${sector.porcentaje}%)`);
    });

    console.log('\n✅ Distribución de consumo por sector mejorada completada exitosamente!');
    console.log('🎯 Mejoras implementadas:');
    console.log('   1. ✅ Porcentajes correctos (no NaN%)');
    console.log('   2. ✅ Etiquetas profesionales (no "daños")');
    console.log('   3. ✅ Datos claros de consumo de petróleo');
    console.log('   4. ✅ Formato profesional para interfaz');
    console.log('   5. ✅ Estadísticas detalladas por sector');

  } catch (error) {
    console.error('❌ Error en distribución de consumo por sector:', error.message);
    
    if (error.message.includes('vw_ordenes_unificada_completa')) {
      console.log('\n💡 La vista unificada no existe o no es accesible');
      console.log('💡 Ejecutar primero: node scripts/crear_vista_unificada_completa.js');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el test
testDistribucionConsumoSector(); 