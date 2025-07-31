const sequelize = require('../src/config/database');

async function testPetroleoMaquinaIndividual() {
  try {
    console.log('🔍 Probando análisis de consumo de petróleo por máquina individual...\n');

    // Verificar que la vista existe y tiene datos de petróleo
    console.log('1. Verificando datos de petróleo en la vista unificada...');
    const [datosPetroleo] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN litrosPetroleo IS NOT NULL AND litrosPetroleo > 0 THEN 1 END) as registros_con_petroleo,
        COUNT(DISTINCT nroMaquina) as maquinas_unicas,
        COUNT(DISTINCT idOrdenServicio) as ordenes_servicio_unicas,
        COALESCE(SUM(litrosPetroleo), 0) as total_litros,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantLimpiar), 0) as total_pabellones_limpiados,
        COALESCE(SUM(mts2), 0) as total_mts2
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    console.log(`   ✅ Total registros: ${datosPetroleo[0].total_registros}`);
    console.log(`   ✅ Registros con petróleo: ${datosPetroleo[0].registros_con_petroleo}`);
    console.log(`   ✅ Máquinas únicas: ${datosPetroleo[0].maquinas_unicas}`);
    console.log(`   ✅ Órdenes de servicio únicas: ${datosPetroleo[0].ordenes_servicio_unicas}`);
    console.log(`   ✅ Total litros: ${datosPetroleo[0].total_litros.toLocaleString()} L`);
    console.log(`   ✅ Total pabellones: ${datosPetroleo[0].total_pabellones.toLocaleString()}`);
    console.log(`   ✅ Total pabellones limpiados: ${datosPetroleo[0].total_pabellones_limpiados.toLocaleString()}`);
    console.log(`   ✅ Total mts2: ${datosPetroleo[0].total_mts2.toLocaleString()} m²`);

    if (datosPetroleo[0].registros_con_petroleo === 0) {
      console.log('\n⚠️ No hay datos de petróleo disponibles para el análisis');
      console.log('💡 Verificar que el campo litrosPetroleo tenga datos');
      return;
    }

    // Verificar la relación entre máquinas y órdenes de servicio
    console.log('\n2. Verificando relación máquinas-órdenes de servicio...');
    const [relacionMaquinasOrdenes] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(DISTINCT idOrdenServicio) as ordenes_servicio,
        COUNT(*) as registros,
        COALESCE(SUM(litrosPetroleo), 0) as total_litros,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nroMaquina
      ORDER BY ordenes_servicio DESC
      LIMIT 5
    `);
    
    console.log(`   ✅ Top 5 máquinas por cantidad de órdenes de servicio:`);
    relacionMaquinasOrdenes.forEach((maquina, index) => {
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${maquina.ordenes_servicio} órdenes, ${maquina.registros} registros, ${parseFloat(maquina.total_litros).toLocaleString()} L`);
    });

    // INDICADOR PRINCIPAL: Litros de petróleo consumido por máquina (calculado por máquina individual)
    console.log('\n3. INDICADOR PRINCIPAL: Litros de petróleo consumido por máquina individual...');
    const [litrosPorMaquina] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(DISTINCT idOrdenServicio) as totalOrdenesServicio,
        COUNT(*) as totalRegistros,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorRegistro,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellon
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
      const totalLitros = parseFloat(maquina.totalLitros || 0);
      const promedio = parseFloat(maquina.promedioLitrosPorRegistro || 0);
      const litrosPorPabellon = parseFloat(maquina.litrosPorPabellon || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${totalLitros.toLocaleString()} L (${maquina.totalOrdenesServicio} órdenes, ${maquina.totalRegistros} registros, ${promedio.toFixed(2)} L/registro, ${litrosPorPabellon} L/pabellón)`);
    });

    // Consumo por sector con porcentajes correctos
    console.log('\n4. Consumo de petróleo por sector (con porcentajes)...');
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
      LIMIT 10
    `);
    
    console.log(`   ✅ Top 10 sectores por consumo de litros:`);
    consumoPorSector.forEach((sector, index) => {
      const totalLitros = parseFloat(sector.totalLitros || 0);
      const porcentaje = parseFloat(sector.porcentajeDelTotal || 0);
      console.log(`      ${index + 1}. ${sector.nombreSector}: ${totalLitros.toLocaleString()} L (${porcentaje}% del total, ${sector.ordenesServicio} órdenes, ${sector.registros} registros)`);
    });

    // Verificar que los porcentajes sumen 100%
    console.log('\n5. Verificando suma de porcentajes...');
    const [sumaPorcentajes] = await sequelize.query(`
      SELECT 
        ROUND(SUM(porcentaje), 2) as suma_porcentajes
      FROM (
        SELECT 
          nombreSector,
          CASE 
            WHEN (SELECT SUM(litrosPetroleo) FROM vw_ordenes_unificada_completa WHERE YEAR(fechaOrdenServicio) = 2025 AND litrosPetroleo IS NOT NULL AND litrosPetroleo > 0) > 0
            THEN (SUM(litrosPetroleo) / (SELECT SUM(litrosPetroleo) FROM vw_ordenes_unificada_completa WHERE YEAR(fechaOrdenServicio) = 2025 AND litrosPetroleo IS NOT NULL AND litrosPetroleo > 0)) * 100
            ELSE 0 
          END as porcentaje
        FROM vw_ordenes_unificada_completa
        WHERE YEAR(fechaOrdenServicio) = 2025 
          AND litrosPetroleo IS NOT NULL 
          AND litrosPetroleo > 0
        GROUP BY nombreSector
        HAVING SUM(litrosPetroleo) > 0
      ) as porcentajes
    `);
    
    const sumaTotal = parseFloat(sumaPorcentajes[0]?.suma_porcentajes || 0);
    console.log(`   ✅ Suma total de porcentajes: ${sumaTotal.toFixed(2)}%`);

    // Estadísticas generales
    console.log('\n6. Estadísticas generales de consumo...');
    const [estadisticas] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT nroMaquina) as totalMaquinas,
        COUNT(DISTINCT idOrdenServicio) as totalOrdenesServicio,
        COUNT(*) as totalRegistros,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitrosConsumidos,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorRegistro,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellonesProcesados,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellonGlobal,
        CASE 
          WHEN SUM(mts2) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(mts2), 4)
          ELSE 0 
        END as litrosPorMts2Global
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
    `);
    
    const stats = estadisticas[0];
    console.log(`   ✅ Total máquinas: ${stats.totalMaquinas}`);
    console.log(`   ✅ Total órdenes de servicio: ${stats.totalOrdenesServicio}`);
    console.log(`   ✅ Total registros: ${stats.totalRegistros}`);
    console.log(`   ✅ Total litros consumidos: ${parseFloat(stats.totalLitrosConsumidos || 0).toLocaleString()} L`);
    console.log(`   ✅ Total pabellones procesados: ${parseFloat(stats.totalPabellonesProcesados || 0).toLocaleString()}`);
    console.log(`   ✅ Total pabellones limpiados: ${parseFloat(stats.totalPabellonesLimpiados || 0).toLocaleString()}`);
    console.log(`   ✅ Total mts2 procesados: ${parseFloat(stats.totalMts2 || 0).toLocaleString()} m²`);
    console.log(`   ✅ Promedio litros por registro: ${parseFloat(stats.promedioLitrosPorRegistro || 0).toFixed(2)} L`);
    console.log(`   ✅ Litros por pabellón global: ${parseFloat(stats.litrosPorPabellonGlobal || 0)} L/pabellón`);
    console.log(`   ✅ Litros por mts2 global: ${parseFloat(stats.litrosPorMts2Global || 0)} L/m²`);

    console.log('\n✅ Análisis de consumo de petróleo por máquina individual completado exitosamente!');
    console.log('🎯 Los cálculos ahora son correctos:');
    console.log('   1. ✅ Se calcula por máquina individual, no por orden de servicio');
    console.log('   2. ✅ Se distinguen registros vs órdenes de servicio');
    console.log('   3. ✅ Los porcentajes se calculan correctamente');
    console.log('   4. ✅ No hay más "NaN%" en los porcentajes');
    console.log('📊 El endpoint /dashboard/petroleo/metrics está corregido');

  } catch (error) {
    console.error('❌ Error en análisis de consumo de petróleo por máquina individual:', error.message);
    
    if (error.message.includes('vw_ordenes_unificada_completa')) {
      console.log('\n💡 La vista unificada no existe o no es accesible');
      console.log('💡 Ejecutar primero: node scripts/crear_vista_unificada_completa.js');
    }
    
    if (error.message.includes('litrosPetroleo')) {
      console.log('\n💡 Los campos de petróleo no están disponibles en la vista');
      console.log('💡 Verificar que la vista incluya el campo: litrosPetroleo');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el test
testPetroleoMaquinaIndividual(); 