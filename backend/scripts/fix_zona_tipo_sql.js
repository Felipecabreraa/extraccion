const sequelize = require('../src/config/database');

async function fixZonaTipo() {
  try {
    console.log('🔧 SOLUCIONANDO COLUMNA TIPO EN ZONA...\n');

    // 1. Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // 2. Verificar si la columna tipo ya existe
    console.log('\n🔍 Verificando si la columna tipo existe...');
    const [columns] = await sequelize.query("SHOW COLUMNS FROM zona LIKE 'tipo'");
    
    if (columns.length > 0) {
      console.log('ℹ️  La columna tipo ya existe en la tabla zona');
      
      // Verificar si tiene datos
      const [zonas] = await sequelize.query("SELECT id, nombre, tipo FROM zona LIMIT 5");
      console.log('📊 Zonas actuales:');
      zonas.forEach(zona => {
        console.log(`   - ID: ${zona.id}, Nombre: ${zona.nombre}, Tipo: ${zona.tipo || 'NULL'}`);
      });
    } else {
      console.log('❌ La columna tipo NO existe. Agregándola...');
      
      // 3. Agregar la columna tipo
      await sequelize.query(`
        ALTER TABLE zona 
        ADD COLUMN tipo ENUM('HEMBRA', 'MACHO') NOT NULL DEFAULT 'HEMBRA'
      `);
      console.log('✅ Columna tipo agregada exitosamente');

      // 4. Actualizar nombres de zonas al formato correcto
      console.log('\n🔄 Actualizando nombres de zonas...');
      await sequelize.query(`
        UPDATE zona 
        SET nombre = CONCAT('Zona ', id)
        WHERE nombre != CONCAT('Zona ', id)
      `);
      console.log('✅ Nombres de zonas actualizados al formato correcto');

      // 5. Actualizar tipos según la regla de negocio para las 3 zonas actuales
      console.log('\n🔄 Actualizando tipos de zonas...');
      await sequelize.query(`
        UPDATE zona 
        SET tipo = CASE 
          WHEN id IN (1, 3) THEN 'HEMBRA'
          WHEN id = 2 THEN 'MACHO'
          WHEN id % 2 = 0 THEN 'HEMBRA'  -- Zonas pares adicionales futuras = HEMBRA
          ELSE 'MACHO'                   -- Zonas impares adicionales futuras = MACHO
        END
      `);
      console.log('✅ Tipos de zonas actualizados según regla de negocio');

      console.log('\n📋 Distribución actual de zonas:');
      console.log('   Zona 1 - HEMBRA');
      console.log('   Zona 2 - MACHO');
      console.log('   Zona 3 - HEMBRA');

      // 5. Verificar el resultado
      const [zonasActualizadas] = await sequelize.query("SELECT id, nombre, tipo FROM zona ORDER BY id");
      console.log('\n📊 Zonas después de la actualización:');
      zonasActualizadas.forEach(zona => {
        console.log(`   - ID: ${zona.id}, Nombre: ${zona.nombre}, Tipo: ${zona.tipo}`);
      });
    }

    console.log('\n✅ SOLUCIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('1. Reiniciar el servidor backend: npm start');
    console.log('2. Verificar en el navegador: http://localhost:3000');
    console.log('3. Ir a la página de Zonas y verificar que funciona');

  } catch (error) {
    console.error('❌ Error en la solución:', error.message);
    console.log('\n🔧 SOLUCIÓN MANUAL:');
    console.log('1. Conectar a MySQL y ejecutar:');
    console.log('   USE extraccion;');
    console.log('   ALTER TABLE zona ADD COLUMN tipo ENUM("HEMBRA", "MACHO") NOT NULL DEFAULT "HEMBRA";');
    console.log('   UPDATE zona SET tipo = CASE WHEN id IN (1, 3) THEN "HEMBRA" WHEN id = 2 THEN "MACHO" ELSE "HEMBRA" END;');
    console.log('2. Reiniciar el servidor: npm start');
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixZonaTipo(); 