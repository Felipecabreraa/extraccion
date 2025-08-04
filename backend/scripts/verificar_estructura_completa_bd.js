const sequelize = require('../src/config/database');

async function verificarEstructuraCompleta() {
  try {
    console.log('🔍 Verificando estructura completa de la base de datos...\n');

    // 1. Verificar todas las tablas existentes
    console.log('1. Tablas existentes en la base de datos:');
    const [tablas] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    
    console.log(`   📊 Total de tablas encontradas: ${tablas.length}`);
    tablas.forEach(tabla => {
      console.log(`   - ${tabla.TABLE_NAME}`);
    });

    // 2. Verificar estructura de tablas principales
    console.log('\n2. Estructura de tablas principales:');

    // Tabla planilla
    try {
      const [estructuraPlanilla] = await sequelize.query('DESCRIBE planilla');
      console.log('\n   📋 Tabla planilla:');
      estructuraPlanilla.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla planilla no existe');
    }

    // Tabla usuario
    try {
      const [estructuraUsuario] = await sequelize.query('DESCRIBE usuario');
      console.log('\n   📋 Tabla usuario:');
      estructuraUsuario.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla usuario no existe');
    }

    // Tabla sector
    try {
      const [estructuraSector] = await sequelize.query('DESCRIBE sector');
      console.log('\n   📋 Tabla sector:');
      estructuraSector.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla sector no existe');
    }

    // Tabla maquina_planilla
    try {
      const [estructuraMaquinaPlanilla] = await sequelize.query('DESCRIBE maquina_planilla');
      console.log('\n   📋 Tabla maquina_planilla:');
      estructuraMaquinaPlanilla.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla maquina_planilla no existe');
    }

    // Tabla maquina
    try {
      const [estructuraMaquina] = await sequelize.query('DESCRIBE maquina');
      console.log('\n   📋 Tabla maquina:');
      estructuraMaquina.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla maquina no existe');
    }

    // Tabla operador
    try {
      const [estructuraOperador] = await sequelize.query('DESCRIBE operador');
      console.log('\n   📋 Tabla operador:');
      estructuraOperador.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla operador no existe');
    }

    // Tabla barredor
    try {
      const [estructuraBarredor] = await sequelize.query('DESCRIBE barredor');
      console.log('\n   📋 Tabla barredor:');
      estructuraBarredor.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla barredor no existe');
    }

    // Tabla dano
    try {
      const [estructuraDano] = await sequelize.query('DESCRIBE dano');
      console.log('\n   📋 Tabla dano:');
      estructuraDano.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla dano no existe');
    }

    // Tabla migracion_ordenes_2025
    try {
      const [estructuraMigracion] = await sequelize.query('DESCRIBE migracion_ordenes_2025');
      console.log('\n   📋 Tabla migracion_ordenes_2025:');
      estructuraMigracion.forEach(col => {
        console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('   ❌ Tabla migracion_ordenes_2025 no existe');
    }

    // 3. Verificar datos en tablas principales
    console.log('\n3. Datos en tablas principales:');

    try {
      const [datosPlanilla] = await sequelize.query('SELECT COUNT(*) as total FROM planilla');
      console.log(`   📊 Planillas: ${datosPlanilla[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando planillas');
    }

    try {
      const [datosUsuario] = await sequelize.query('SELECT COUNT(*) as total FROM usuario');
      console.log(`   📊 Usuarios: ${datosUsuario[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando usuarios');
    }

    try {
      const [datosSector] = await sequelize.query('SELECT COUNT(*) as total FROM sector');
      console.log(`   📊 Sectores: ${datosSector[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando sectores');
    }

    try {
      const [datosMaquina] = await sequelize.query('SELECT COUNT(*) as total FROM maquina');
      console.log(`   📊 Máquinas: ${datosMaquina[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando máquinas');
    }

    try {
      const [datosOperador] = await sequelize.query('SELECT COUNT(*) as total FROM operador');
      console.log(`   📊 Operadores: ${datosOperador[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando operadores');
    }

    try {
      const [datosBarredor] = await sequelize.query('SELECT COUNT(*) as total FROM barredor');
      console.log(`   📊 Barredores: ${datosBarredor[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando barredores');
    }

    try {
      const [datosDano] = await sequelize.query('SELECT COUNT(*) as total FROM dano');
      console.log(`   📊 Daños: ${datosDano[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando daños');
    }

    try {
      const [datosMigracion] = await sequelize.query('SELECT COUNT(*) as total FROM migracion_ordenes_2025');
      console.log(`   📊 Datos históricos: ${datosMigracion[0].total} registros`);
    } catch (error) {
      console.log('   ❌ Error contando datos históricos');
    }

    // 4. Verificar relaciones entre tablas
    console.log('\n4. Verificando relaciones entre tablas:');

    try {
      const [relacionesPlanilla] = await sequelize.query(`
        SELECT 
          p.id as planilla_id,
          p.supervisor_id,
          p.sector_id,
          u.nombre as supervisor_nombre,
          s.nombre as sector_nombre
        FROM planilla p
        LEFT JOIN usuario u ON p.supervisor_id = u.id
        LEFT JOIN sector s ON p.sector_id = s.id
        LIMIT 3
      `);
      console.log('   ✅ Relaciones planilla-usuario-sector funcionando');
      console.log(`   📊 Ejemplo de relaciones: ${relacionesPlanilla.length} registros encontrados`);
    } catch (error) {
      console.log('   ❌ Error en relaciones planilla-usuario-sector:', error.message);
    }

    console.log('\n✅ Verificación de estructura completada!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraCompleta(); 