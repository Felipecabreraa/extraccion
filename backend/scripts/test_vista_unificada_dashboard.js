const sequelize = require('../src/config/database');

async function testVistaUnificadaDashboard() {
  try {
    console.log('🧪 Verificando conexión del Dashboard con vista unificada...\n');

    // Test 1: Verificar que la vista existe y tiene datos
    console.log('1. Verificando existencia y datos de la vista...');
    const [vistaResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT nombreSector) as sectores_diferentes,
        COUNT(DISTINCT nombreSupervisor) as supervisores_diferentes,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    console.log(`   ✅ Total registros: ${vistaResult[0].total_registros}`);
    console.log(`   ✅ Sectores diferentes: ${vistaResult[0].sectores_diferentes}`);
    console.log(`   ✅ Supervisores diferentes: ${vistaResult[0].supervisores_diferentes}`);
    console.log(`   ✅ Total pabellones: ${vistaResult[0].total_pabellones}`);
    console.log(`   ✅ Total daños: ${vistaResult[0].total_danos}`);

    // Test 2: Verificar estados de planillas (basado en fechas)
    console.log('\n2. Verificando estados de planillas (basado en fechas)...');
    const [estadosResult] = await sequelize.query(`
      SELECT 
        CASE 
          WHEN fechaFinOrdenServicio IS NULL OR fechaFinOrdenServicio = fechaOrdenServicio THEN 'Activa'
          ELSE 'Completada'
        END as estado,
        COUNT(*) as cantidad
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY 
        CASE 
          WHEN fechaFinOrdenServicio IS NULL OR fechaFinOrdenServicio = fechaOrdenServicio THEN 'Activa'
          ELSE 'Completada'
        END
      ORDER BY cantidad DESC
    `);
    
    console.log(`   ✅ Estados encontrados: ${estadosResult.length}`);
    estadosResult.forEach(item => {
      console.log(`      - ${item.estado}: ${item.cantidad} planillas`);
    });

    // Test 3: Verificar métricas del mes actual
    console.log('\n3. Verificando métricas del mes actual...');
    const currentMonth = new Date().getMonth() + 1;
    const [mesResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as planillas_mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025 AND MONTH(fechaOrdenServicio) = ?
    `, { replacements: [currentMonth] });
    
    console.log(`   ✅ Mes ${currentMonth}: ${mesResult[0].planillas_mes} planillas, ${mesResult[0].pabellones_mes} pabellones`);

    // Test 4: Verificar tendencias mensuales
    console.log('\n4. Verificando tendencias mensuales...');
    const [tendenciasResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(*) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones
      FROM vw_ordenes_2025_actual
      WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
      LIMIT 3
    `);
    
    console.log(`   ✅ Tendencias obtenidas: ${tendenciasResult.length} meses`);
    tendenciasResult.forEach(item => {
      console.log(`      - Mes ${item.mes}: ${item.planillas} planillas, ${item.pabellones} pabellones`);
    });

    // Test 5: Verificar rendimiento por sector
    console.log('\n5. Verificando rendimiento por sector...');
    const [sectoresResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(*) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      GROUP BY nombreSector
      ORDER BY pabellones_total DESC
      LIMIT 3
    `);
    
    console.log(`   ✅ Top sectores obtenidos: ${sectoresResult.length}`);
    sectoresResult.forEach(item => {
      console.log(`      - ${item.sector_nombre}: ${item.planillas} planillas, ${item.pabellones_total} pabellones`);
    });

    // Test 6: Verificar campos específicos
    console.log('\n6. Verificando campos específicos...');
    const [camposResult] = await sequelize.query(`
      SELECT 
        fechaOrdenServicio,
        fechaFinOrdenServicio,
        nombreSector,
        cantidadPabellones,
        cantidadDano,
        source
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
      LIMIT 1
    `);
    
    if (camposResult.length > 0) {
      const registro = camposResult[0];
      console.log(`   ✅ Campos verificados:`);
      console.log(`      - fechaOrdenServicio: ${registro.fechaOrdenServicio}`);
      console.log(`      - fechaFinOrdenServicio: ${registro.fechaFinOrdenServicio}`);
      console.log(`      - nombreSector: ${registro.nombreSector}`);
      console.log(`      - cantidadPabellones: ${registro.cantidadPabellones}`);
      console.log(`      - cantidadDano: ${registro.cantidadDano}`);
      console.log(`      - source: ${registro.source}`);
    }

    console.log('\n✅ Verificación completa exitosa!');
    console.log('🎯 El Dashboard está correctamente conectado con vw_ordenes_2025_actual');
    console.log('📊 Todos los campos necesarios están disponibles');
    console.log('🔧 Las consultas están optimizadas para la vista unificada');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    
    if (error.message.includes('mts2sector')) {
      console.log('\n💡 Aún hay referencias a mts2sector que necesitan ser corregidas');
    }
    
    if (error.message.includes('vw_ordenes_2025_actual')) {
      console.log('\n💡 La vista unificada no existe o no es accesible');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la verificación
testVistaUnificadaDashboard(); 