const sequelize = require('./src/config/database');

async function agregarSectoresFaltantes() {
  console.log('🔧 Agregando sectores faltantes...\n');

  try {
    const queryTimeout = 10000;

    // Sectores faltantes identificados
    const sectoresFaltantes = [
      { nombre: 'SAN IGNACIO', zona_id: 1 }, // Asignar a Zona 1 (HEMBRA)
      { nombre: 'LA COMPANIA', zona_id: 1 }, // Asignar a Zona 1 (HEMBRA)
      { nombre: 'CHAYACO 2', zona_id: 2 },   // Asignar a Zona 2 (MACHO)
      { nombre: 'CHAYACO 1', zona_id: 2 },   // Asignar a Zona 2 (MACHO)
      { nombre: 'CASTANOS', zona_id: 3 }     // Asignar a Zona 3 (HEMBRA)
    ];

    console.log('📋 Sectores a agregar:');
    sectoresFaltantes.forEach(sector => {
      console.log(`   - ${sector.nombre} → Zona ${sector.zona_id}`);
    });

    // Verificar que las zonas existen
    console.log('\n1. Verificando que las zonas existen...');
    const [zonasExistentes] = await sequelize.query(`
      SELECT id, nombre, tipo FROM zona ORDER BY id
    `, { timeout: queryTimeout });

    console.log('✅ Zonas existentes:');
    zonasExistentes.forEach(zona => {
      console.log(`   - Zona ${zona.id}: ${zona.nombre} (${zona.tipo})`);
    });

    // Verificar sectores existentes
    console.log('\n2. Verificando sectores existentes...');
    const [sectoresExistentes] = await sequelize.query(`
      SELECT nombre, zona_id FROM sector ORDER BY nombre
    `, { timeout: queryTimeout });

    console.log(`✅ Total sectores existentes: ${sectoresExistentes.length}`);

    // Verificar si los sectores ya existen
    const sectoresExistentesNombres = sectoresExistentes.map(s => s.nombre);
    const sectoresParaAgregar = sectoresFaltantes.filter(s => 
      !sectoresExistentesNombres.includes(s.nombre)
    );

    if (sectoresParaAgregar.length === 0) {
      console.log('✅ Todos los sectores ya existen en la base de datos');
      return;
    }

    console.log(`\n3. Agregando ${sectoresParaAgregar.length} sectores...`);

    // Agregar sectores uno por uno
    for (const sector of sectoresParaAgregar) {
      try {
        await sequelize.query(`
          INSERT INTO sector (nombre, zona_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, { 
          replacements: [sector.nombre, sector.zona_id],
          timeout: queryTimeout 
        });
        console.log(`   ✅ Agregado: ${sector.nombre} → Zona ${sector.zona_id}`);
      } catch (error) {
        if (error.message.includes('Duplicate entry')) {
          console.log(`   ⚠️  Ya existe: ${sector.nombre}`);
        } else {
          console.error(`   ❌ Error agregando ${sector.nombre}:`, error.message);
        }
      }
    }

    // Verificar el resultado
    console.log('\n4. Verificando resultado...');
    const [sectoresActualizados] = await sequelize.query(`
      SELECT 
        s.nombre,
        s.zona_id,
        z.nombre as zona_nombre,
        z.tipo as zona_tipo
      FROM sector s
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE s.nombre IN (?, ?, ?, ?, ?)
      ORDER BY s.nombre
    `, { 
      replacements: sectoresFaltantes.map(s => s.nombre),
      timeout: queryTimeout 
    });

    console.log('✅ Sectores agregados/verificados:');
    sectoresActualizados.forEach(sector => {
      console.log(`   - ${sector.nombre} → Zona ${sector.zona_id} (${sector.zona_nombre})`);
    });

    // Probar la consulta de daños por zona nuevamente
    console.log('\n5. Probando consulta de daños por zona...');
    const [testResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT v.idOrdenServicio) as total_ordenes,
        COALESCE(SUM(v.cantidadDano), 0) as total_danos,
        COUNT(DISTINCT v.nombreSector) as sectores_con_danos
      FROM vw_ordenes_2025_actual v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      WHERE YEAR(v.fechaOrdenServicio) = 2025 AND v.cantidadDano > 0
    `, { timeout: queryTimeout });

    console.log('📊 Resultado de la prueba:');
    console.log(`   - Total órdenes: ${testResult[0].total_ordenes}`);
    console.log(`   - Total daños: ${testResult[0].total_danos}`);
    console.log(`   - Sectores con daños: ${testResult[0].sectores_con_danos}`);

    console.log('\n✅ Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  } finally {
    await sequelize.close();
  }
}

agregarSectoresFaltantes(); 