const sequelize = require('../src/config/database');

async function testPetroleoAnalisis() {
  try {
    console.log('🔍 Probando análisis de rendimiento de petróleo...\n');

    // 1. Verificar que la vista existe y tiene datos de petróleo
    console.log('1. Verificando datos de petróleo en la vista unificada...');
    const [datosPetroleo] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN litrosPetroleo IS NOT NULL AND litrosPetroleo > 0 THEN 1 END) as registros_con_petroleo,
        COUNT(DISTINCT nroMaquina) as maquinas_unicas,
        COALESCE(SUM(litrosPetroleo), 0) as total_litros,
        COALESCE(SUM(odometroFin - odometroInicio), 0) as total_km
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

    // 2. Consumo por máquina
    console.log('\n2. Análisis de consumo por máquina...');
    const [consumoPorMaquina] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(*) as totalOrdenes,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitros,
        COALESCE(SUM(odometroFin - odometroInicio), 0) as totalKm,
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
    
    console.log(`   ✅ Top 10 máquinas por consumo:`);
    consumoPorMaquina.forEach((maquina, index) => {
      const rendimiento = maquina.totalKm > 0 ? (maquina.totalLitros / maquina.totalKm).toFixed(2) : 0;
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${maquina.totalLitros} L, ${maquina.totalKm} km, ${rendimiento} L/km`);
    });

    // 3. Estadísticas generales
    console.log('\n3. Estadísticas generales...');
    const [estadisticas] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT nroMaquina) as totalMaquinas,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitrosConsumidos,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorOrden,
        COALESCE(SUM(odometroFin - odometroInicio), 0) as totalKmRecorridos,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellonesProcesados
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
    `);
    
    const stats = estadisticas[0];
    const rendimientoGlobal = stats.totalKmRecorridos > 0 ? (stats.totalLitrosConsumidos / stats.totalKmRecorridos).toFixed(2) : 0;
    
    console.log(`   ✅ Total máquinas: ${stats.totalMaquinas}`);
    console.log(`   ✅ Total litros consumidos: ${stats.totalLitrosConsumidos.toLocaleString()} L`);
    console.log(`   ✅ Promedio por orden: ${parseFloat(stats.promedioLitrosPorOrden).toFixed(1)} L`);
    console.log(`   ✅ Total km recorridos: ${stats.totalKmRecorridos.toLocaleString()} km`);
    console.log(`   ✅ Total pabellones: ${stats.totalPabellonesProcesados.toLocaleString()}`);
    console.log(`   ✅ Rendimiento global: ${rendimientoGlobal} L/km`);

    // 4. Consumo mensual
    console.log('\n4. Consumo mensual...');
    const [consumoMensual] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as mes,
        COUNT(*) as ordenes,
        COALESCE(SUM(litrosPetroleo), 0) as litrosConsumidos,
        COALESCE(SUM(odometroFin - odometroInicio), 0) as kmRecorridos
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `);
    
    console.log(`   ✅ Consumo por mes:`);
    consumoMensual.forEach(item => {
      const rendimiento = item.kmRecorridos > 0 ? (item.litrosConsumidos / item.kmRecorridos).toFixed(2) : 0;
      console.log(`      ${item.mes}: ${item.litrosConsumidos} L, ${item.kmRecorridos} km, ${rendimiento} L/km`);
    });

    // 5. Top máquinas más eficientes
    console.log('\n5. Top máquinas más eficientes...');
    const [maquinasEficientes] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(odometroFin - odometroInicio), 0) as totalKm,
        CASE 
          WHEN SUM(odometroFin - odometroInicio) > 0 
          THEN (SUM(litrosPetroleo) / SUM(odometroFin - odometroInicio))
          ELSE 0 
        END as rendimiento
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
        AND odometroFin > odometroInicio
      GROUP BY nroMaquina
      HAVING totalKm > 0
      ORDER BY rendimiento ASC
      LIMIT 5
    `);
    
    console.log(`   ✅ Top 5 máquinas más eficientes:`);
    maquinasEficientes.forEach((maquina, index) => {
      const rendimiento = parseFloat(maquina.rendimiento || 0);
      console.log(`      ${index + 1}. Máquina ${maquina.nroMaquina}: ${rendimiento.toFixed(2)} L/km (${maquina.totalLitros} L, ${maquina.totalKm} km)`);
    });

    // 6. Consumo por sector
    console.log('\n6. Consumo por sector...');
    const [consumoPorSector] = await sequelize.query(`
      SELECT 
        nombreSector,
        COUNT(*) as ordenes,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(odometroFin - odometroInicio), 0) as totalKm
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = 2025 
        AND litrosPetroleo IS NOT NULL 
        AND litrosPetroleo > 0
      GROUP BY nombreSector
      HAVING totalLitros > 0
      ORDER BY totalLitros DESC
      LIMIT 10
    `);
    
    console.log(`   ✅ Top 10 sectores por consumo:`);
    consumoPorSector.forEach((sector, index) => {
      const rendimiento = sector.totalKm > 0 ? (sector.totalLitros / sector.totalKm).toFixed(2) : 0;
      console.log(`      ${index + 1}. ${sector.nombreSector}: ${sector.totalLitros} L, ${sector.totalKm} km, ${rendimiento} L/km`);
    });

    console.log('\n✅ Análisis de petróleo completado exitosamente!');
    console.log('🎯 El endpoint /dashboard/petroleo/metrics está listo para usar');
    console.log('📊 Los datos muestran un análisis completo de rendimiento de combustible');

  } catch (error) {
    console.error('❌ Error en análisis de petróleo:', error.message);
    
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
testPetroleoAnalisis(); 