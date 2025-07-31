const sequelize = require('../src/config/database');

async function testPetroleoConsumo() {
  try {
    console.log('🔍 Probando análisis de consumo de petróleo por máquina...\n');

    // Verificar que la vista existe y tiene datos de petróleo
    console.log('1. Verificando datos de petróleo en la vista unificada...');
    const [datosPetroleo] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN litrosPetroleo IS NOT NULL AND litrosPetroleo > 0 THEN 1 END) as registros_con_petroleo,
        COUNT(DISTINCT nroMaquina) as maquinas_unicas,
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
    console.log(`   ✅ Total litros: ${datosPetroleo[0].total_litros.toLocaleString()} L`);
    console.log(`   ✅ Total pabellones: ${datosPetroleo[0].total_pabellones.toLocaleString()}`);
    console.log(`   ✅ Total pabellones limpiados: ${datosPetroleo[0].total_pabellones_limpiados.toLocaleString()}`);
    console.log(`   ✅ Total mts2: ${datosPetroleo[0].total_mts2.toLocaleString()} m²`);

    if (datosPetroleo[0].registros_con_petroleo === 0) {
      console.log('\n⚠️ No hay datos de petróleo disponibles para el análisis');
      console.log('💡 Verificar que el campo litrosPetroleo tenga datos');
      return;
    }

    // INDICADOR PRINCIPAL: Litros de petróleo consumido por máquina
    console.log('\n2. INDICADOR PRINCIPAL: Litros de petróleo consumido por máquina...');
    const [litrosPorMaquina] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(*) as totalOrdenes,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorOrden,
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
      const promedio = parseFloat(maquina.promedioLitrosPorOrden || 0);
      const litrosPorPabellon = parseFloat(maquina.litrosPorPabellon || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${totalLitros.toLocaleString()} L (${maquina.totalOrdenes} órdenes, ${promedio.toFixed(2)} L/orden, ${litrosPorPabellon} L/pabellón)`);
    });

    // Eficiencia de consumo por máquina
    console.log('\n3. Eficiencia de consumo por máquina (litros por pabellón)...');
    const [eficienciaConsumo] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(*) as totalOrdenes,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellon,
        CASE 
          WHEN SUM(cantLimpiar) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantLimpiar), 2)
          ELSE 0 
        END as litrosPorPabellonLimpiado,
        CASE 
          WHEN SUM(mts2) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(mts2), 4)
          ELSE 0 
        END as litrosPorMts2
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nroMaquina
      HAVING totalLitros > 0
      ORDER BY litrosPorPabellon ASC
      LIMIT 10
    `);
    
    console.log(`   ✅ Top 10 máquinas más eficientes (menos litros por pabellón):`);
    eficienciaConsumo.forEach((maquina, index) => {
      const litrosPorPabellon = parseFloat(maquina.litrosPorPabellon || 0);
      const totalLitros = parseFloat(maquina.totalLitros || 0);
      const totalPabellones = parseFloat(maquina.totalPabellones || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${litrosPorPabellon} L/pabellón (${totalLitros.toLocaleString()} L, ${totalPabellones.toLocaleString()} pabellones)`);
    });

    // Consumo por sector
    console.log('\n4. Consumo de petróleo por sector...');
    const [consumoPorSector] = await sequelize.query(`
      SELECT 
        nombreSector,
        COUNT(*) as ordenes,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorOrden
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nombreSector
      HAVING totalLitros > 0
      ORDER BY totalLitros DESC
    `);
    
    console.log(`   ✅ Consumo por sector:`);
    consumoPorSector.forEach((sector, index) => {
      const totalLitros = parseFloat(sector.totalLitros || 0);
      const totalPabellones = parseFloat(sector.totalPabellones || 0);
      const promedio = parseFloat(sector.promedioLitrosPorOrden || 0);
      console.log(`      ${index + 1}. ${sector.nombreSector}: ${totalLitros.toLocaleString()} L (${sector.ordenes} órdenes, ${totalPabellones.toLocaleString()} pabellones, ${promedio.toFixed(2)} L/orden)`);
    });

    // Consumo mensual
    console.log('\n5. Consumo mensual de petróleo...');
    const [consumoMensual] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as mes,
        COUNT(*) as ordenes,
        COALESCE(SUM(litrosPetroleo), 0) as litrosConsumidos,
        COALESCE(SUM(cantidadPabellones), 0) as pabellonesProcesados,
        COALESCE(SUM(cantLimpiar), 0) as pabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as mts2Procesados
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `);
    
    console.log(`   ✅ Consumo mensual:`);
    consumoMensual.forEach((mes, index) => {
      const litrosConsumidos = parseFloat(mes.litrosConsumidos || 0);
      const pabellonesProcesados = parseFloat(mes.pabellonesProcesados || 0);
      console.log(`      ${index + 1}. ${mes.mes}: ${litrosConsumidos.toLocaleString()} L (${mes.ordenes} órdenes, ${pabellonesProcesados.toLocaleString()} pabellones)`);
    });

    // Estadísticas generales
    console.log('\n6. Estadísticas generales de consumo...');
    const [estadisticas] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT nroMaquina) as totalMaquinas,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitrosConsumidos,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorOrden,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellonesProcesados,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        COUNT(*) as totalOrdenes,
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
    console.log(`   ✅ Total litros consumidos: ${parseFloat(stats.totalLitrosConsumidos || 0).toLocaleString()} L`);
    console.log(`   ✅ Total pabellones procesados: ${parseFloat(stats.totalPabellonesProcesados || 0).toLocaleString()}`);
    console.log(`   ✅ Total pabellones limpiados: ${parseFloat(stats.totalPabellonesLimpiados || 0).toLocaleString()}`);
    console.log(`   ✅ Total mts2 procesados: ${parseFloat(stats.totalMts2 || 0).toLocaleString()} m²`);
    console.log(`   ✅ Promedio litros por orden: ${parseFloat(stats.promedioLitrosPorOrden || 0).toFixed(2)} L`);
    console.log(`   ✅ Litros por pabellón global: ${parseFloat(stats.litrosPorPabellonGlobal || 0)} L/pabellón`);
    console.log(`   ✅ Litros por mts2 global: ${parseFloat(stats.litrosPorMts2Global || 0)} L/m²`);

    // Clasificación de eficiencia
    console.log('\n7. Clasificación de eficiencia de consumo...');
    const [clasificacionEficiencia] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellon,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN 
            CASE 
              WHEN (SUM(litrosPetroleo) / SUM(cantidadPabellones)) <= 50 THEN 'Excelente'
              WHEN (SUM(litrosPetroleo) / SUM(cantidadPabellones)) <= 100 THEN 'Bueno'
              WHEN (SUM(litrosPetroleo) / SUM(cantidadPabellones)) <= 150 THEN 'Regular'
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
      ORDER BY litrosPorPabellon ASC
    `);
    
    const clasificacion = {
      Excelente: clasificacionEficiencia.filter(m => m.nivelEficiencia === 'Excelente').length,
      Bueno: clasificacionEficiencia.filter(m => m.nivelEficiencia === 'Bueno').length,
      Regular: clasificacionEficiencia.filter(m => m.nivelEficiencia === 'Regular').length,
      Mejorar: clasificacionEficiencia.filter(m => m.nivelEficiencia === 'Mejorar').length
    };

    console.log(`   ✅ Excelente (≤50 L/pabellón): ${clasificacion.Excelente} máquinas`);
    console.log(`   ✅ Bueno (50-100 L/pabellón): ${clasificacion.Bueno} máquinas`);
    console.log(`   ✅ Regular (100-150 L/pabellón): ${clasificacion.Regular} máquinas`);
    console.log(`   ✅ Mejorar (>150 L/pabellón): ${clasificacion.Mejorar} máquinas`);

    console.log('\n✅ Análisis de consumo de petróleo completado exitosamente!');
    console.log('🎯 El análisis se enfoca únicamente en:');
    console.log('   1. ✅ Litros de petróleo consumido por máquina');
    console.log('   2. ✅ Eficiencia de consumo por pabellón');
    console.log('   3. ✅ Consumo por sector y período');
    console.log('📊 El endpoint /dashboard/petroleo/metrics está optimizado para consumo');

  } catch (error) {
    console.error('❌ Error en análisis de consumo de petróleo:', error.message);
    
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
testPetroleoConsumo(); 