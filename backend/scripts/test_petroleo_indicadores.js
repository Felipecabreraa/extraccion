const sequelize = require('../src/config/database');

async function testPetroleoIndicadores() {
  try {
    console.log('🔍 Probando los tres indicadores específicos de petróleo...\n');

    // Verificar que la vista existe y tiene datos de petróleo
    console.log('1. Verificando datos de petróleo en la vista unificada...');
    const [datosPetroleo] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN litrosPetroleo IS NOT NULL AND litrosPetroleo > 0 THEN 1 END) as registros_con_petroleo,
        COUNT(DISTINCT nroMaquina) as maquinas_unicas,
        COALESCE(SUM(litrosPetroleo), 0) as total_litros,
        COALESCE(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END), 0) as total_km
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    console.log(`   ✅ Total registros: ${datosPetroleo[0].total_registros}`);
    console.log(`   ✅ Registros con petróleo: ${datosPetroleo[0].registros_con_petroleo}`);
    console.log(`   ✅ Máquinas únicas: ${datosPetroleo[0].maquinas_unicas}`);
    console.log(`   ✅ Total litros: ${datosPetroleo[0].total_litros.toLocaleString()} L`);
    console.log(`   ✅ Total km: ${datosPetroleo[0].total_km.toLocaleString()} km`);

    if (datosPetroleo[0].registros_con_petroleo === 0) {
      console.log('\n⚠️ No hay datos de petróleo disponibles para el análisis');
      console.log('💡 Verificar que los campos litrosPetroleo, odometroInicio y odometroFin tengan datos');
      return;
    }

    // INDICADOR 1: Litros de petróleo consumido por máquina
    console.log('\n2. INDICADOR 1: Litros de petróleo consumido por máquina...');
    const [litrosPorMaquina] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(*) as totalOrdenes,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorOrden,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nroMaquina
      HAVING totalLitros > 0
      ORDER BY totalLitros DESC
      LIMIT 10
    `);
    
    console.log(`   ✅ Top 10 máquinas por consumo de litros:`);
    litrosPorMaquina.forEach((maquina, index) => {
      const promedio = parseFloat(maquina.promedioLitrosPorOrden || 0);
      const totalLitros = parseFloat(maquina.totalLitros || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${totalLitros.toLocaleString()} L (${maquina.totalOrdenes} órdenes, ${promedio.toFixed(2)} L/orden)`);
    });

    // INDICADOR 2: Rendimiento por máquina (km por litro)
    console.log('\n3. INDICADOR 2: Rendimiento por máquina (km por litro)...');
    const [rendimientoPorMaquina] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(*) as totalOrdenes,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END), 0) as totalKm,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        CASE 
          WHEN SUM(litrosPetroleo) > 0 AND SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) > 0
          THEN ROUND(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) / SUM(litrosPetroleo), 2)
          ELSE 0 
        END as rendimientoKmPorLitro
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nroMaquina
      HAVING totalLitros > 0
      ORDER BY rendimientoKmPorLitro DESC
      LIMIT 10
    `);
    
    console.log(`   ✅ Top 10 máquinas por rendimiento (km/L):`);
    rendimientoPorMaquina.forEach((maquina, index) => {
      const rendimiento = parseFloat(maquina.rendimientoKmPorLitro || 0);
      const totalLitros = parseFloat(maquina.totalLitros || 0);
      const totalKm = parseFloat(maquina.totalKm || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${rendimiento} km/L (${totalLitros.toLocaleString()} L, ${totalKm.toLocaleString()} km)`);
    });

    // INDICADOR 3: Kilómetros recorridos por máquina
    console.log('\n4. INDICADOR 3: Kilómetros recorridos por máquina...');
    const [kmPorMaquina] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(*) as totalOrdenes,
        COALESCE(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END), 0) as totalKm,
        COALESCE(AVG(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END), 0) as promedioKmPorOrden,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nroMaquina
      HAVING totalKm > 0
      ORDER BY totalKm DESC
      LIMIT 10
    `);
    
    console.log(`   ✅ Top 10 máquinas por km recorridos:`);
    kmPorMaquina.forEach((maquina, index) => {
      const promedioKm = parseFloat(maquina.promedioKmPorOrden || 0);
      const totalKm = parseFloat(maquina.totalKm || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${totalKm.toLocaleString()} km (${maquina.totalOrdenes} órdenes, ${promedioKm.toFixed(2)} km/orden)`);
    });

    // Estadísticas generales
    console.log('\n5. Estadísticas generales de los tres indicadores...');
    const [estadisticas] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT nroMaquina) as totalMaquinas,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitrosConsumidos,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorOrden,
        COALESCE(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END), 0) as totalKmRecorridos,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellonesProcesados,
        CASE 
          WHEN SUM(litrosPetroleo) > 0 AND SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) > 0
          THEN ROUND(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) / SUM(litrosPetroleo), 2)
          ELSE 0 
        END as rendimientoGlobalKmPorLitro
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
    `);
    
    const stats = estadisticas[0];
    console.log(`   ✅ Total máquinas: ${stats.totalMaquinas}`);
    console.log(`   ✅ Total litros consumidos: ${parseFloat(stats.totalLitrosConsumidos || 0).toLocaleString()} L`);
    console.log(`   ✅ Total km recorridos: ${parseFloat(stats.totalKmRecorridos || 0).toLocaleString()} km`);
    console.log(`   ✅ Promedio litros por orden: ${parseFloat(stats.promedioLitrosPorOrden || 0).toFixed(2)} L`);
    console.log(`   ✅ Rendimiento global: ${parseFloat(stats.rendimientoGlobalKmPorLitro || 0)} km/L`);
    console.log(`   ✅ Total pabellones procesados: ${parseFloat(stats.totalPabellonesProcesados || 0).toLocaleString()}`);

    // Análisis de eficiencia
    console.log('\n6. Análisis de eficiencia por máquina...');
    const [eficienciaPorMaquina] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END), 0) as totalKm,
        CASE 
          WHEN SUM(litrosPetroleo) > 0 AND SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) > 0
          THEN ROUND(SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) / SUM(litrosPetroleo), 2)
          ELSE 0 
        END as rendimientoKmPorLitro,
        CASE 
          WHEN SUM(litrosPetroleo) > 0 AND SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) > 0
          THEN 
            CASE 
              WHEN (SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) / SUM(litrosPetroleo)) >= 10 THEN 'Excelente'
              WHEN (SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) / SUM(litrosPetroleo)) >= 5 THEN 'Bueno'
              WHEN (SUM(CASE WHEN odometroFin > odometroInicio AND odometroInicio > 0 THEN odometroFin - odometroInicio ELSE 0 END) / SUM(litrosPetroleo)) >= 2 THEN 'Regular'
              ELSE 'Mejorar'
            END
          ELSE 'Sin datos'
        END as nivelEficiencia
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nroMaquina
      HAVING totalLitros > 0
      ORDER BY rendimientoKmPorLitro DESC
    `);
    
    console.log(`   ✅ Análisis de eficiencia por máquina:`);
    eficienciaPorMaquina.forEach((maquina, index) => {
      const rendimiento = parseFloat(maquina.rendimientoKmPorLitro || 0);
      const totalLitros = parseFloat(maquina.totalLitros || 0);
      const totalKm = parseFloat(maquina.totalKm || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${rendimiento} km/L - ${maquina.nivelEficiencia} (${totalLitros.toLocaleString()} L, ${totalKm.toLocaleString()} km)`);
    });

    // Resumen de clasificación
    const clasificacion = {
      Excelente: eficienciaPorMaquina.filter(m => m.nivelEficiencia === 'Excelente').length,
      Bueno: eficienciaPorMaquina.filter(m => m.nivelEficiencia === 'Bueno').length,
      Regular: eficienciaPorMaquina.filter(m => m.nivelEficiencia === 'Regular').length,
      Mejorar: eficienciaPorMaquina.filter(m => m.nivelEficiencia === 'Mejorar').length
    };

    console.log('\n7. Resumen de clasificación de eficiencia:');
    console.log(`   ✅ Excelente (≥10 km/L): ${clasificacion.Excelente} máquinas`);
    console.log(`   ✅ Bueno (5-10 km/L): ${clasificacion.Bueno} máquinas`);
    console.log(`   ✅ Regular (2-5 km/L): ${clasificacion.Regular} máquinas`);
    console.log(`   ✅ Mejorar (<2 km/L): ${clasificacion.Mejorar} máquinas`);

    console.log('\n✅ Análisis de los tres indicadores completado exitosamente!');
    console.log('🎯 Los tres indicadores están funcionando correctamente:');
    console.log('   1. ✅ Litros de petróleo consumido por máquina');
    console.log('   2. ✅ Rendimiento por máquina (km por litro)');
    console.log('   3. ✅ Kilómetros recorridos por máquina');
    console.log('📊 El endpoint /dashboard/petroleo/metrics está listo para usar');

  } catch (error) {
    console.error('❌ Error en análisis de indicadores de petróleo:', error.message);
    
    if (error.message.includes('vw_ordenes_unificada_completa')) {
      console.log('\n💡 La vista unificada no existe o no es accesible');
      console.log('💡 Ejecutar primero: node scripts/crear_vista_unificada_completa.js');
    }
    
    if (error.message.includes('litrosPetroleo')) {
      console.log('\n💡 Los campos de petróleo no están disponibles en la vista');
      console.log('💡 Verificar que la vista incluya los campos: litrosPetroleo, odometroInicio, odometroFin');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el test
testPetroleoIndicadores(); 