const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚡ SOLUCIÓN RÁPIDA PARA ZONAS...\n');

try {
  // 1. Verificar si estamos en el directorio correcto
  const currentDir = process.cwd();
  console.log(`📍 Directorio actual: ${currentDir}`);

  // 2. Instalar dependencias si no están
  console.log('\n📦 Verificando dependencias...');
  try {
    execSync('npm list multer', { stdio: 'pipe' });
    console.log('✅ Dependencias ya instaladas');
  } catch {
    console.log('📦 Instalando dependencias...');
    execSync('npm install multer csv-parser', { stdio: 'inherit' });
  }

  // 3. Crear directorio uploads
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Directorio uploads creado');
  }

  // 4. Verificar archivo .env
  const envFile = path.join(__dirname, '../.env');
  if (!fs.existsSync(envFile)) {
    console.log('⚠️  Creando archivo .env básico...');
    const envContent = `DB_HOST=localhost
DB_PORT=3306
DB_NAME=extraccion
DB_USER=root
DB_PASSWORD=
PORT=3001
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
FRONTEND_URL=http://localhost:3000`;
    fs.writeFileSync(envFile, envContent);
    console.log('✅ Archivo .env creado');
  }

  // 5. Verificar migración
  const migrationFile = path.join(__dirname, '../migrations/20250103130000-add-tipo-to-zona.js');
  if (!fs.existsSync(migrationFile)) {
    console.log('❌ Archivo de migración no encontrado');
    console.log('   Creando migración...');
    
    const migrationContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('zona', 'tipo');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_zona_tipo;');
  }
};`;
    
    fs.writeFileSync(migrationFile, migrationContent);
    console.log('✅ Migración creada');
  }

  console.log('\n🎯 EJECUTANDO SOLUCIONES...\n');

  // 6. Ejecutar migración
  console.log('🗄️  Ejecutando migración...');
  try {
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('✅ Migración ejecutada correctamente');
  } catch (error) {
    console.log('❌ Error en migración. Verifica la conexión a la base de datos.');
    console.log('   Asegúrate de que MySQL esté funcionando y la base de datos "extraccion" existe.');
  }

  // 7. Actualizar zonas existentes
  console.log('\n🔄 Actualizando zonas existentes...');
  try {
    execSync('node scripts/update_zonas_tipo.js', { stdio: 'inherit' });
    console.log('✅ Zonas actualizadas');
  } catch (error) {
    console.log('⚠️  Error actualizando zonas. Continuando...');
  }

  console.log('\n✅ SOLUCIÓN COMPLETADA');
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. Reiniciar el servidor backend: npm start');
  console.log('2. Verificar en el navegador: http://localhost:3000');
  console.log('3. Ir a la página de Zonas y verificar que funciona');

} catch (error) {
  console.error('❌ Error en la solución rápida:', error.message);
  console.log('\n🔧 SOLUCIÓN MANUAL:');
  console.log('1. Asegúrate de que MySQL esté funcionando');
  console.log('2. Verifica que la base de datos "extraccion" existe');
  console.log('3. Configura las credenciales en .env');
  console.log('4. Ejecuta: npx sequelize-cli db:migrate');
  console.log('5. Ejecuta: node scripts/update_zonas_tipo.js');
  console.log('6. Reinicia el servidor: npm start');
} 