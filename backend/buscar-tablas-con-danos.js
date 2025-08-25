const sequelize = require('./src/config/database');

async function buscarTablasConDanos() {
  try {
    console.log('🔍 Buscando todas las tablas que contengan información de daños...\n');

    // Listar todas las tablas
    const [tablas] = await sequelize.query('SHOW TABLES');
    console.log('📋 TODAS LAS TABLAS DISPONIBLES:');
    tablas.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Buscar tablas que contengan "dano" o "daño" en el nombre
    console.log('\n🔍 BUSCANDO TABLAS CON "DANO" EN EL NOMBRE:');
    const tablasConDano = tablas.filter(row => {
      const tableName = Object.values(row)[0];
      return tableName.toLowerCase().includes('dano') || 
             tableName.toLowerCase().includes('daño') ||
             tableName.toLowerCase().includes('damage');
    });

    if (tablasConDano.length > 0) {
      tablasConDano.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('   No se encontraron tablas con "dano" en el nombre');
    }

    // Buscar tablas que contengan "orden" en el nombre
    console.log('\n🔍 BUSCANDO TABLAS CON "ORDEN" EN EL NOMBRE:');
    const tablasConOrden = tablas.filter(row => {
      const tableName = Object.values(row)[0];
      return tableName.toLowerCase().includes('orden') || 
             tableName.toLowerCase().includes('order');
    });

    if (tablasConOrden.length > 0) {
      tablasConOrden.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('   No se encontraron tablas con "orden" en el nombre');
    }

    // Verificar la tabla "dano" específicamente
    console.log('\n🔍 VERIFICANDO TABLA "DANO":');
    const tablasDano = tablas.filter(row => {
      const tableName = Object.values(row)[0];
      return tableName.toLowerCase() === 'dano';
    });

    if (tablasDano.length > 0) {
      console.log('   ✅ Tabla "dano" encontrada');
      
      // Verificar estructura de la tabla dano
      const [estructuraDano] = await sequelize.query('DESCRIBE dano');
      console.log('   📋 Estructura de la tabla dano:');
      estructuraDano.forEach(col => {
        console.log(`      • ${col.Field} (${col.Type})`);
      });

      // Verificar total de registros en dano
      const [totalDano] = await sequelize.query('SELECT COUNT(*) as total FROM dano');
      console.log(`   📊 Total registros en tabla dano: ${totalDano[0].total}`);

      // Verificar si hay registros con fecha en 2025
      const [danos2025] = await sequelize.query(`
        SELECT COUNT(*) as total 
        FROM dano d 
        JOIN planilla p ON d.planilla_id = p.id 
        WHERE YEAR(p.fecha_inicio) = 2025
      `);
      console.log(`   📊 Daños en 2025 (dano + planilla): ${danos2025[0].total}`);

    } else {
      console.log('   ❌ Tabla "dano" no encontrada');
    }

    // Verificar la tabla "planilla"
    console.log('\n🔍 VERIFICANDO TABLA "PLANILLA":');
    const tablasPlanilla = tablas.filter(row => {
      const tableName = Object.values(row)[0];
      return tableName.toLowerCase() === 'planilla';
    });

    if (tablasPlanilla.length > 0) {
      console.log('   ✅ Tabla "planilla" encontrada');
      
      // Verificar total de registros en planilla
      const [totalPlanilla] = await sequelize.query('SELECT COUNT(*) as total FROM planilla');
      console.log(`   📊 Total registros en tabla planilla: ${totalPlanilla[0].total}`);

      // Verificar planillas en 2025
      const [planillas2025] = await sequelize.query(`
        SELECT COUNT(*) as total 
        FROM planilla 
        WHERE YEAR(fecha_inicio) = 2025
      `);
      console.log(`   📊 Planillas en 2025: ${planillas2025[0].total}`);

    } else {
      console.log('   ❌ Tabla "planilla" no encontrada');
    }

    // Verificar vistas que contengan "unificada"
    console.log('\n🔍 BUSCANDO VISTAS CON "UNIFICADA":');
    const [vistas] = await sequelize.query('SHOW FULL TABLES WHERE Table_type = "VIEW"');
    const vistasUnificada = vistas.filter(row => {
      const viewName = Object.values(row)[0];
      return viewName.toLowerCase().includes('unificada');
    });

    if (vistasUnificada.length > 0) {
      console.log('   Vistas encontradas:');
      vistasUnificada.forEach((row, index) => {
        const viewName = Object.values(row)[0];
        console.log(`   ${index + 1}. ${viewName}`);
      });
    } else {
      console.log('   No se encontraron vistas con "unificada"');
    }

    console.log('\n✅ Búsqueda completada');

  } catch (error) {
    console.error('❌ Error buscando tablas con daños:', error);
  }
}

buscarTablasConDanos();



