const sequelize = require('../src/config/database');

async function corregirCalculoPabellones() {
  try {
    console.log('🔧 Corrigiendo cálculo de pabellones únicos...\n');

    const currentYear = 2025;

    // 1. Cálculo INCORRECTO (como está ahora)
    console.log('❌ 1. Cálculo INCORRECTO (actual):');

    const [incorrectoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_incorrecto
      FROM (
        SELECT 
          idOrdenServicio,
          SUM(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_unicas
    `, { replacements: [currentYear] });

    console.log(`  Total incorrecto: ${incorrectoResult[0].total_pabellones_incorrecto.toLocaleString()}`);

    // 2. Cálculo CORRECTO (usando MAX en lugar de SUM)
    console.log('\n✅ 2. Cálculo CORRECTO (usando MAX):');

    const [correctoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_correcto
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ?
        GROUP BY idOrdenServicio
      ) as planillas_unicas
    `, { replacements: [currentYear] });

    console.log(`  Total correcto: ${correctoResult[0].total_pabellones_correcto.toLocaleString()}`);

    // 3. Cálculo directo (para comparar)
    console.log('\n📊 3. Cálculo directo (suma de todos los registros):');

    const [directoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_directo
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ?
    `, { replacements: [currentYear] });

    console.log(`  Total directo: ${directoResult[0].total_pabellones_directo.toLocaleString()}`);

    // 4. Calcular diferencias
    const diferenciaIncorrecto = directoResult[0].total_pabellones_directo - incorrectoResult[0].total_pabellones_incorrecto;
    const diferenciaCorrecto = directoResult[0].total_pabellones_directo - correctoResult[0].total_pabellones_correcto;

    console.log('\n📈 4. Diferencias:');
    console.log(`  Diferencia con cálculo incorrecto: ${diferenciaIncorrecto.toLocaleString()}`);
    console.log(`  Diferencia con cálculo correcto: ${diferenciaCorrecto.toLocaleString()}`);

    // 5. Verificar con planilla específica
    console.log('\n🔍 5. Verificación con planilla 21867:');

    const [planillaResult] = await sequelize.query(`
      SELECT 
        idOrdenServicio,
        COUNT(*) as registros,
        SUM(cantidadPabellones) as suma_total,
        MAX(cantidadPabellones) as valor_unico
      FROM vw_ordenes_2025_actual
      WHERE idOrdenServicio = 21867
      GROUP BY idOrdenServicio
    `);

    if (planillaResult.length > 0) {
      const planilla = planillaResult[0];
      console.log(`  Planilla ${planilla.idOrdenServicio}:`);
      console.log(`    Registros: ${planilla.registros}`);
      console.log(`    Suma total: ${planilla.suma_total}`);
      console.log(`    Valor único (MAX): ${planilla.valor_unico}`);
      console.log(`    Diferencia: ${planilla.suma_total - planilla.valor_unico}`);
    }

    // 6. Verificar por mes
    console.log('\n📅 6. Verificación por mes (Julio 2025):');

    const [mesCorrectoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_correcto
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_2025_actual
        WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = 7
        GROUP BY idOrdenServicio
      ) as planillas_mes_unicas
    `, { replacements: [currentYear] });

    const [mesIncorrectoResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_incorrecto
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = 7
    `, { replacements: [currentYear] });

    console.log(`  Julio 2025 correcto: ${mesCorrectoResult[0].pabellones_mes_correcto.toLocaleString()}`);
    console.log(`  Julio 2025 incorrecto: ${mesIncorrectoResult[0].pabellones_mes_incorrecto.toLocaleString()}`);
    console.log(`  Diferencia: ${(mesIncorrectoResult[0].pabellones_mes_incorrecto - mesCorrectoResult[0].pabellones_mes_correcto).toLocaleString()}`);

    console.log('\n✅ Corrección completada');
    console.log('🎯 El cálculo correcto usa MAX() en lugar de SUM() dentro del subquery');

  } catch (error) {
    console.error('❌ Error en la corrección:', error);
  } finally {
    await sequelize.close();
  }
}

corregirCalculoPabellones(); 