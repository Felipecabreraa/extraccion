const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 SOLUCIONANDO CONFLICTOS DE MIGRACIÓN...\n');

try {
  // 1. Verificar estado de migraciones
  console.log('📋 1. Verificando estado de migraciones...');
  try {
    const status = execSync('npx sequelize-cli db:migrate:status', { encoding: 'utf8' });
    console.log('Estado de migraciones:');
    console.log(status);
  } catch (error) {
    console.log('❌ Error obteniendo estado de migraciones');
  }

  // 2. Verificar si la columna tipo ya existe en zona
  console.log('\n🔍 2. Verificando estructura de tabla zona...');
  try {
    const result = execSync('npx sequelize-cli db:describe --table zona', { encoding: 'utf8' });
    if (result.includes('tipo')) {
      console.log('✅ Columna tipo ya existe en tabla zona');
    } else {
      console.log('❌ Columna tipo NO existe en tabla zona');
    }
  } catch (error) {
    console.log('⚠️  No se pudo verificar estructura de tabla zona');
  }

  // 3. Verificar si la columna cantidad_pabellones ya existe en sector
  console.log('\n🔍 3. Verificando estructura de tabla sector...');
  try {
    const result = execSync('npx sequelize-cli db:describe --table sector', { encoding: 'utf8' });
    if (result.includes('cantidad_pabellones')) {
      console.log('✅ Columna cantidad_pabellones ya existe en tabla sector');
    } else {
      console.log('❌ Columna cantidad_pabellones NO existe en tabla sector');
    }
  } catch (error) {
    console.log('⚠️  No se pudo verificar estructura de tabla sector');
  }

  // 4. Crear migración específica solo para zona tipo
  console.log('\n📝 4. Creando migración específica para zona tipo...');
  const zonaTipoMigration = path.join(__dirname, '../migrations/20250103140000-add-tipo-only-to-zona.js');
  
  if (!fs.existsSync(zonaTipoMigration)) {
    const migrationContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('zona');
    if (!tableDescription.tipo) {
      await queryInterface.addColumn('zona', 'tipo', {
        type: Sequelize.ENUM('HEMBRA', 'MACHO'),
        allowNull: false,
        defaultValue: 'HEMBRA'
      });

      // Actualizar zonas existentes según la regla de negocio
      await queryInterface.sequelize.query(\`
        UPDATE zona 
        SET tipo = CASE 
          WHEN id IN (1, 3) THEN 'HEMBRA'
          WHEN id = 2 THEN 'MACHO'
          ELSE 'HEMBRA'
        END
      \`);
      
      console.log('✅ Columna tipo agregada a tabla zona');
    } else {
      console.log('ℹ️  Columna tipo ya existe en tabla zona');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('zona');
    if (tableDescription.tipo) {
      await queryInterface.removeColumn('zona', 'tipo');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_zona_tipo;');
    }
  }
};`;
    
    fs.writeFileSync(zonaTipoMigration, migrationContent);
    console.log('✅ Migración específica creada');
  } else {
    console.log('✅ Migración específica ya existe');
  }

  // 5. Ejecutar migración específica
  console.log('\n🔄 5. Ejecutando migración específica...');
  try {
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('✅ Migración ejecutada correctamente');
  } catch (error) {
    console.log('⚠️  Error en migración. Intentando solución alternativa...');
    
    // 6. Solución alternativa: ejecutar SQL directamente
    console.log('\n🔧 6. Aplicando solución alternativa...');
    try {
      const sequelize = require('../src/config/database');
      await sequelize.authenticate();
      
      // Verificar si la columna existe
      const [results] = await sequelize.query("SHOW COLUMNS FROM zona LIKE 'tipo'");
      if (results.length === 0) {
        // Agregar columna tipo
        await sequelize.query(`
          ALTER TABLE zona 
          ADD COLUMN tipo ENUM('HEMBRA', 'MACHO') NOT NULL DEFAULT 'HEMBRA'
        `);
        
        // Actualizar zonas existentes
        await sequelize.query(`
          UPDATE zona 
          SET tipo = CASE 
            WHEN id IN (1, 3) THEN 'HEMBRA'
            WHEN id = 2 THEN 'MACHO'
            ELSE 'HEMBRA'
          END
        `);
        
        console.log('✅ Columna tipo agregada manualmente');
      } else {
        console.log('ℹ️  Columna tipo ya existe');
      }
    } catch (sqlError) {
      console.log('❌ Error en solución alternativa:', sqlError.message);
    }
  }

  console.log('\n✅ SOLUCIÓN COMPLETADA');
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. Reiniciar el servidor backend: npm start');
  console.log('2. Verificar en el navegador: http://localhost:3000');
  console.log('3. Ir a la página de Zonas y verificar que funciona');

} catch (error) {
  console.error('❌ Error en la solución:', error.message);
  console.log('\n🔧 SOLUCIÓN MANUAL:');
  console.log('1. Conectar a MySQL y ejecutar:');
  console.log('   USE extraccion;');
  console.log('   SHOW COLUMNS FROM zona;');
  console.log('2. Si no existe la columna tipo, ejecutar:');
  console.log('   ALTER TABLE zona ADD COLUMN tipo ENUM("HEMBRA", "MACHO") NOT NULL DEFAULT "HEMBRA";');
  console.log('   UPDATE zona SET tipo = CASE WHEN id IN (1, 3) THEN "HEMBRA" WHEN id = 2 THEN "MACHO" ELSE "HEMBRA" END;');
  console.log('3. Reiniciar el servidor: npm start');
} 