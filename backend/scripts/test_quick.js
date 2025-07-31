const sequelize = require('../src/config/database');

async function testQuick() {
  try {
    console.log('🧪 Prueba rápida de vista unificada...\n');

    // Test 1: Verificar que la vista funciona
    console.log('1. Probando consulta básica de la vista...');
    const [result] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_ordenes,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025
    `);
    
    console.log(`   ✅ Total órdenes: ${result[0].total_ordenes}`);
    console.log(`   ✅ Total pabellones: ${result[0].total_pabellones}`);
    console.log(`   ✅ Total daños: ${result[0].total_danos}`);

    // Test 2: Verificar consulta de tendencias mensuales
    console.log('\n2. Probando consulta de tendencias mensuales...');
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

    // Test 3: Verificar consulta de daños
    console.log('\n3. Probando consulta de daños...');
    const [danosResult] = await sequelize.query(`
      SELECT 
        COALESCE(nombreTipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
      GROUP BY nombreTipoDano
      ORDER BY total_danos DESC
      LIMIT 3
    `);
    
    console.log(`   ✅ Tipos de daños obtenidos: ${danosResult.length}`);
    danosResult.forEach(item => {
      console.log(`      - ${item.tipo_dano}: ${item.cantidad} registros, ${item.total_danos} daños`);
    });

    console.log('\n✅ Todas las consultas funcionan correctamente!');
    console.log('🎯 Los errores de mts2sector han sido corregidos');
    console.log('📊 La vista unificada está lista para usar');

  } catch (error) {
    console.error('❌ Error en prueba rápida:', error.message);
    
    if (error.message.includes('mts2sector')) {
      console.log('\n💡 Aún hay referencias a mts2sector que necesitan ser corregidas');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testQuick(); 