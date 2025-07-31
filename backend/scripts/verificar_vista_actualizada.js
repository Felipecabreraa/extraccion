const sequelize = require('../src/config/database');

async function verificarVistaActualizada() {
  try {
    console.log('🔍 Verificando vista actualizada vw_ordenes_2025_actual...\n');

    // 1. Verificar que la vista existe
    console.log('1. Verificando existencia de la vista...');
    const [vistaExiste] = await sequelize.query(`
      SELECT COUNT(*) as existe
      FROM information_schema.views 
      WHERE table_name = 'vw_ordenes_2025_actual'
    `);
    
    if (vistaExiste[0].existe === 0) {
      console.log('❌ La vista vw_ordenes_2025_actual NO EXISTE');
      return;
    }
    
    console.log('✅ La vista vw_ordenes_2025_actual EXISTE');

    // 2. Obtener estructura actualizada
    console.log('\n2. Estructura actualizada de la vista:');
    const [estructura] = await sequelize.query('DESCRIBE vw_ordenes_2025_actual');
    
    console.log(`   ✅ Campos disponibles: ${estructura.length}`);
    estructura.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type}`);
    });

    // 3. Verificar campos específicos que faltaban
    console.log('\n3. Verificando campos que faltaban...');
    const camposFaltantes = [
      'mts2',
      'cantidadPabellones', 
      'cantLimpiar',
      'nroPabellon',
      'pabellon_id'
    ];
    
    const camposEncontrados = estructura.map(col => col.Field);
    
    camposFaltantes.forEach(campo => {
      const existe = camposEncontrados.includes(campo);
      console.log(`   - ${campo}: ${existe ? '✅' : '❌'}`);
    });

    // 4. Verificar datos con los nuevos campos
    console.log('\n4. Verificando datos con campos actualizados...');
    const [datosVista] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT idOrdenServicio) as ordenes_unicas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(mts2), 0) as total_mt2,
        COALESCE(SUM(cantidadDano), 0) as total_danos,
        COUNT(DISTINCT nroPabellon) as pabellones_unicos
      FROM vw_ordenes_2025_actual
    `);
    
    const resumen = datosVista[0];
    console.log(`   ✅ Total registros: ${resumen.total_registros}`);
    console.log(`   ✅ Órdenes únicas: ${resumen.ordenes_unicas}`);
    console.log(`   ✅ Total pabellones: ${resumen.total_pabellones}`);
    console.log(`   ✅ Total m²: ${resumen.total_mt2}`);
    console.log(`   ✅ Total daños: ${resumen.total_danos}`);
    console.log(`   ✅ Pabellones únicos: ${resumen.pabellones_unicos}`);

    // 5. Mostrar muestra de datos con campos nuevos
    console.log('\n5. Muestra de datos con campos actualizados:');
    const [muestra] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        fechaOrdenServicio,
        nombreSector,
        cantidadPabellones,
        mts2,
        cantLimpiar,
        nroPabellon,
        cantidadDano,
        source
      FROM vw_ordenes_2025_actual
      WHERE mts2 > 0 OR cantidadPabellones > 0
      LIMIT 5
    `);
    
    if (muestra.length > 0) {
      muestra.forEach((registro, index) => {
        console.log(`   Registro ${index + 1}:`);
        console.log(`      - ID: ${registro.idOrdenServicio}`);
        console.log(`      - Fecha: ${registro.fechaOrdenServicio}`);
        console.log(`      - Sector: ${registro.nombreSector}`);
        console.log(`      - Pabellones: ${registro.cantidadPabellones}`);
        console.log(`      - m²: ${registro.mts2}`);
        console.log(`      - Limpiados: ${registro.cantLimpiar}`);
        console.log(`      - Pabellón: ${registro.nroPabellon}`);
        console.log(`      - Daños: ${registro.cantidadDano}`);
        console.log(`      - Origen: ${registro.source}`);
      });
    } else {
      console.log('   ⚠️ No se encontraron registros con datos en los campos nuevos');
    }

    // 6. Verificar consultas específicas que usan los campos nuevos
    console.log('\n6. Probando consultas con campos nuevos...');
    
    // Consulta de metros cuadrados
    const [mt2Result] = await sequelize.query(`
      SELECT 
        COUNT(*) as registros_con_mt2,
        COALESCE(SUM(mts2), 0) as total_mt2,
        COALESCE(AVG(mts2), 0) as promedio_mt2
      FROM vw_ordenes_2025_actual
      WHERE mts2 > 0
    `);
    
    console.log(`   📊 Metros cuadrados:`);
    console.log(`      - Registros con m²: ${mt2Result[0].registros_con_mt2}`);
    console.log(`      - Total m²: ${mt2Result[0].total_mt2}`);
    console.log(`      - Promedio m²: ${mt2Result[0].promedio_mt2}`);

    // Consulta de pabellones
    const [pabellonesResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as registros_con_pabellones,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantLimpiar), 0) as total_limpiados
      FROM vw_ordenes_2025_actual
      WHERE cantidadPabellones > 0
    `);
    
    console.log(`   🏢 Pabellones:`);
    console.log(`      - Registros con pabellones: ${pabellonesResult[0].registros_con_pabellones}`);
    console.log(`      - Total pabellones: ${pabellonesResult[0].total_pabellones}`);
    console.log(`      - Total limpiados: ${pabellonesResult[0].total_limpiados}`);

    // 7. Verificar compatibilidad con el dashboard
    console.log('\n7. Verificando compatibilidad con dashboard...');
    const [dashboardResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_ordenes,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(mts2), 0) as total_mt2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    const dashboard = dashboardResult[0];
    console.log(`   📈 Datos para dashboard 2025:`);
    console.log(`      - Total órdenes: ${dashboard.total_ordenes}`);
    console.log(`      - Total pabellones: ${dashboard.total_pabellones}`);
    console.log(`      - Total m²: ${dashboard.total_mt2}`);
    console.log(`      - Total daños: ${dashboard.total_danos}`);

    console.log('\n✅ Verificación completada exitosamente!');
    console.log('🎯 La vista vw_ordenes_2025_actual está actualizada con todos los campos de migracion_ordenes_2025');
    console.log('📊 Los campos mts2, cantidadPabellones, cantLimpiar, nroPabellon y otros están disponibles');
    console.log('🚀 El dashboard puede usar estos campos para mostrar métricas más completas');

  } catch (error) {
    console.error('❌ Error verificando vista:', error.message);
    
    if (error.message.includes('doesn\'t exist')) {
      console.log('\n💡 La vista vw_ordenes_2025_actual no existe o no es accesible');
    }
    
    if (error.message.includes('Unknown column')) {
      console.log('\n💡 Algunos campos aún no están disponibles en la vista');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
if (require.main === module) {
  verificarVistaActualizada();
}

module.exports = verificarVistaActualizada; 