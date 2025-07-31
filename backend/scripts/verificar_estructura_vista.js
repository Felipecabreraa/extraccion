const sequelize = require('../src/config/database');

async function verificarEstructuraVista() {
  try {
    console.log('🔍 Verificando estructura de la vista unificada...\n');

    // Test 1: Verificar que la vista existe
    console.log('1. Verificando existencia de la vista...');
    const [vistaExiste] = await sequelize.query(`
      SELECT COUNT(*) as existe
      FROM information_schema.views 
      WHERE table_name = 'vw_ordenes_2025_actual'
    `);
    
    if (vistaExiste[0].existe > 0) {
      console.log('   ✅ Vista vw_ordenes_2025_actual existe');
    } else {
      console.log('   ❌ Vista vw_ordenes_2025_actual NO existe');
      return;
    }

    // Test 2: Obtener estructura de la vista
    console.log('\n2. Verificando estructura de columnas...');
    const [columnas] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM information_schema.columns 
      WHERE table_name = 'vw_ordenes_2025_actual'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log(`   ✅ Columnas encontradas: ${columnas.length}`);
    columnas.forEach(col => {
      console.log(`      - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
    });

    // Test 3: Obtener una muestra de datos
    console.log('\n3. Verificando muestra de datos...');
    const [muestra] = await sequelize.query(`
      SELECT *
      FROM vw_ordenes_2025_actual
      LIMIT 1
    `);
    
    if (muestra.length > 0) {
      console.log('   ✅ Datos disponibles en la vista');
      const registro = muestra[0];
      console.log('   📋 Campos disponibles:');
      Object.keys(registro).forEach(campo => {
        console.log(`      - ${campo}: ${registro[campo]}`);
      });
    } else {
      console.log('   ⚠️ No hay datos en la vista');
    }

    // Test 4: Verificar campos específicos que necesitamos
    console.log('\n4. Verificando campos específicos necesarios...');
    const camposNecesarios = [
      'fechaOrdenServicio',
      'nombreEstado', 'estado', 'estadoPlanilla',
      'nombreSector', 'sector', 'sectorNombre',
      'cantidadPabellones', 'pabellones', 'mt2sector',
      'cantidadDano', 'dano', 'danos',
      'source', 'origen', 'fuente'
    ];
    
    const columnasEncontradas = columnas.map(col => col.COLUMN_NAME.toLowerCase());
    
    console.log('   🔍 Campos necesarios vs disponibles:');
    camposNecesarios.forEach(campo => {
      const encontrado = columnasEncontradas.some(col => col.includes(campo.toLowerCase()));
      console.log(`      - ${campo}: ${encontrado ? '✅' : '❌'}`);
    });

    // Test 5: Intentar consulta básica
    console.log('\n5. Probando consulta básica...');
    const [consultaBasica] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM vw_ordenes_2025_actual
    `);
    
    console.log(`   ✅ Total registros: ${consultaBasica[0].total}`);

    console.log('\n✅ Verificación de estructura completada!');

  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la verificación
verificarEstructuraVista(); 