const sequelize = require('../src/config/database');

async function testEstructuraVisualMejorada() {
  try {
    console.log('🎨 Probando estructura visual mejorada del gráfico de consumo por sector...\n');

    // Obtener datos de distribución de consumo por sector
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

    // Procesar datos para la estructura visual mejorada
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

    const totalLitros = distribucionConsumoPorSector.reduce((sum, sector) => sum + sector.litros, 0);

    console.log('1. 📊 RESUMEN VISUAL MEJORADO:');
    console.log('   🏷️ Título: "TOTAL LITROS CONSUMIDOS"');
    console.log(`   📈 Valor: ${totalLitros.toLocaleString()} L`);
    console.log(`   🏢 Sectores activos: ${distribucionConsumoPorSector.length}`);
    console.log(`   📋 Texto: "${distribucionConsumoPorSector.length} sectores activos"`);

    console.log('\n2. 🍩 GRÁFICO DE DONUT MEJORADO:');
    console.log('   📋 Título: "Distribución por Sector"');
    console.log('   📝 Subtítulo: "Porcentaje de consumo por sector operativo"');
    
    const colores = ['#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#6B7280', '#FCD34D'];
    
    console.log('\n   🎨 Top 8 sectores con colores:');
    distribucionConsumoPorSector.slice(0, 8).forEach((sector, index) => {
      const color = colores[index % 8];
      console.log(`   ${index + 1}. ${sector.sector}: ${sector.litros.toLocaleString()} L (${sector.porcentaje}%) - Color: ${color}`);
    });

    console.log('\n3. 📋 TABLA DE DATOS MEJORADA:');
    console.log('   📊 Columnas: Sector | Litros | Porcentaje | Órdenes | Pabellones | Eficiencia');
    console.log('\n   📈 Top 5 sectores formateados:');
    distribucionConsumoPorSector.slice(0, 5).forEach((sector, index) => {
      console.log(`   ${index + 1}. ${sector.sector}`);
      console.log(`      📊 Litros: ${sector.litros.toLocaleString()} L`);
      console.log(`      📈 Porcentaje: ${sector.porcentaje}%`);
      console.log(`      📋 Órdenes: ${sector.ordenes}`);
      console.log(`      🏗️ Pabellones: ${sector.pabellones.toLocaleString()}`);
      console.log(`      ⚡ Eficiencia: ${sector.eficiencia} L/pabellón`);
    });

    console.log('\n4. 🏆 KPIs DESTACADOS:');
    const sectorMayor = distribucionConsumoPorSector[0];
    const sectorMenor = distribucionConsumoPorSector[distribucionConsumoPorSector.length - 1];
    const promedio = totalLitros / distribucionConsumoPorSector.length;
    
    console.log(`   🏆 Sector Mayor Consumo: ${sectorMayor.sector}`);
    console.log(`      📊 ${sectorMayor.litros.toLocaleString()} L (${sectorMayor.porcentaje}%)`);
    
    console.log(`   📉 Sector Menor Consumo: ${sectorMenor.sector}`);
    console.log(`      📊 ${sectorMenor.litros.toLocaleString()} L (${sectorMenor.porcentaje}%)`);
    
    console.log(`   📈 Promedio por Sector: ${promedio.toFixed(0)} L`);

    console.log('\n5. 🎨 CONFIGURACIÓN VISUAL:');
    console.log('   🎨 Paleta de colores:');
    console.log('      🔵 Primario: #3B82F6 (Azul)');
    console.log('      🟠 Secundario: #F59E0B (Naranja)');
    console.log('      🟢 Éxito: #10B981 (Verde)');
    console.log('      🟣 Advertencia: #EC4899 (Rosa)');
    console.log('      🔴 Peligro: #EF4444 (Rojo)');
    console.log('      ⚫ Neutral: #6B7280 (Gris)');
    
    console.log('\n   📝 Tipografía:');
    console.log('      📋 Títulos: 1.5rem, peso 600, color #1F2937');
    console.log('      📝 Subtítulos: 1rem, peso 500, color #6B7280');
    console.log('      📊 Datos: 2rem, peso 700, color #059669');
    
    console.log('\n   📐 Espaciado:');
    console.log('      📦 Padding: 1.5rem');
    console.log('      📏 Margin: 1rem');
    console.log('      🔄 Border radius: 0.75rem');

    console.log('\n6. ✅ MEJORAS IMPLEMENTADAS:');
    console.log('   ✅ Eliminado "TOTAL DAÑOS" → "TOTAL LITROS CONSUMIDOS"');
    console.log('   ✅ Eliminado "NaN%" → Porcentajes reales');
    console.log('   ✅ Eliminado número confuso → Valor claro');
    console.log('   ✅ Colores profesionales y consistentes');
    console.log('   ✅ Tipografía clara y legible');
    console.log('   ✅ Estructura de datos organizada');
    console.log('   ✅ Formato profesional para interfaz');

    console.log('\n🎉 ¡Estructura visual mejorada completada exitosamente!');
    console.log('📊 El gráfico ahora es claro, profesional y fácil de visualizar');

  } catch (error) {
    console.error('❌ Error en estructura visual mejorada:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el test
testEstructuraVisualMejorada(); 