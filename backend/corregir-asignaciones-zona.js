const sequelize = require('./src/config/database');

async function corregirAsignacionesZona() {
  console.log('🔧 Corrigiendo asignaciones de zona...\n');

  try {
    const queryTimeout = 10000;

    // Asignaciones correctas según el usuario
    const asignacionesCorrectas = [
      { nombre: 'SAN IGNACIO', zona_id: 3 }, // Zona 3 (HEMBRA)
      { nombre: 'LA COMPANIA', zona_id: 1 }, // Zona 1 (HEMBRA) 
      { nombre: 'CHAYACO 1', zona_id: 2 },   // Zona 2 (MACHO)
      { nombre: 'CHAYACO 2', zona_id: 2 },   // Zona 2 (MACHO)
      { nombre: 'CASTANOS', zona_id: 1 }     // Zona 1 (HEMBRA)
    ];

    console.log('📋 Asignaciones correctas:');
    asignacionesCorrectas.forEach(sector => {
      console.log(`   - ${sector.nombre} → Zona ${sector.zona_id}`);
    });

    // 1. Verificar qué sectores ya existen
    console.log('\n1. Verificando sectores existentes...');
    const [sectoresExistentes] = await sequelize.query(`
      SELECT id, nombre, zona_id FROM sector 
      WHERE nombre IN (?, ?, ?, ?, ?)
      ORDER BY nombre
    `, { 
      replacements: asignacionesCorrectas.map(s => s.nombre),
      timeout: queryTimeout 
    });

    console.log('✅ Sectores encontrados en la base de datos:');
    sectoresExistentes.forEach(sector => {
      console.log(`   - ${sector.nombre} (ID: ${sector.id}) → Zona actual: ${sector.zona_id}`);
    });

    // 2. Verificar zonas disponibles
    console.log('\n2. Verificando zonas disponibles...');
    const [zonas] = await sequelize.query(`
      SELECT id, nombre, tipo FROM zona ORDER BY id
    `, { timeout: queryTimeout });

    console.log('✅ Zonas disponibles:');
    zonas.forEach(zona => {
      console.log(`   - Zona ${zona.id}: ${zona.nombre} (${zona.tipo})`);
    });

    // 3. Actualizar sectores existentes
    console.log('\n3. Actualizando sectores existentes...');
    for (const sector of sectoresExistentes) {
      const asignacionCorrecta = asignacionesCorrectas.find(a => a.nombre === sector.nombre);
      if (asignacionCorrecta && asignacionCorrecta.zona_id !== sector.zona_id) {
        try {
          await sequelize.query(`
            UPDATE sector SET zona_id = ? WHERE id = ?
          `, { 
            replacements: [asignacionCorrecta.zona_id, sector.id],
            timeout: queryTimeout 
          });
          console.log(`   ✅ Actualizado: ${sector.nombre} → Zona ${asignacionCorrecta.zona_id} (antes: ${sector.zona_id})`);
        } catch (error) {
          console.error(`   ❌ Error actualizando ${sector.nombre}:`, error.message);
        }
      } else if (asignacionCorrecta) {
        console.log(`   ✅ Correcto: ${sector.nombre} ya está en Zona ${sector.zona_id}`);
      }
    }

    // 4. Agregar sectores faltantes
    console.log('\n4. Agregando sectores faltantes...');
    const sectoresExistentesNombres = sectoresExistentes.map(s => s.nombre);
    const sectoresParaAgregar = asignacionesCorrectas.filter(s => 
      !sectoresExistentesNombres.includes(s.nombre)
    );

    if (sectoresParaAgregar.length > 0) {
      console.log(`   Agregando ${sectoresParaAgregar.length} sectores faltantes...`);
      
      for (const sector of sectoresParaAgregar) {
        try {
          await sequelize.query(`
            INSERT INTO sector (nombre, zona_id)
            VALUES (?, ?)
          `, { 
            replacements: [sector.nombre, sector.zona_id],
            timeout: queryTimeout 
          });
          console.log(`   ✅ Agregado: ${sector.nombre} → Zona ${sector.zona_id}`);
        } catch (error) {
          console.error(`   ❌ Error agregando ${sector.nombre}:`, error.message);
        }
      }
    } else {
      console.log('   ✅ Todos los sectores ya existen');
    }

    // 5. Verificar resultado final
    console.log('\n5. Verificando resultado final...');
    const [resultadoFinal] = await sequelize.query(`
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
      replacements: asignacionesCorrectas.map(s => s.nombre),
      timeout: queryTimeout 
    });

    console.log('✅ Estado final de los sectores:');
    resultadoFinal.forEach(sector => {
      console.log(`   - ${sector.nombre} → Zona ${sector.zona_id} (${sector.zona_nombre})`);
    });

    // 6. Probar la consulta de daños por zona
    console.log('\n6. Probando consulta de daños por zona...');
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

corregirAsignacionesZona(); 