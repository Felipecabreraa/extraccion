const fs = require('fs');
const path = require('path');

const environments = {
  development: 'env.development',
  staging: 'env.staging',
  test: 'env.test',
  production: 'env.production.example'
};

function switchEnvironment(env) {
  if (!environments[env]) {
    console.error(`❌ Ambiente "${env}" no válido. Ambientes disponibles:`);
    Object.keys(environments).forEach(e => console.log(`  - ${e}`));
    process.exit(1);
  }

  const sourceFile = path.join(__dirname, '..', environments[env]);
  const targetFile = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Archivo de configuración para "${env}" no encontrado: ${sourceFile}`);
    process.exit(1);
  }

  try {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ Ambiente cambiado a: ${env.toUpperCase()}`);
    console.log(`📁 Archivo copiado: ${environments[env]} → .env`);
    console.log(`🔄 Reinicia el servidor de desarrollo para aplicar los cambios`);
  } catch (error) {
    console.error(`❌ Error al cambiar ambiente:`, error.message);
    process.exit(1);
  }
}

const targetEnv = process.argv[2];

if (!targetEnv) {
  console.log('🔧 Uso: node scripts/switch-environment.js <ambiente>');
  console.log('📋 Ambientes disponibles:');
  Object.keys(environments).forEach(env => {
    console.log(`  - ${env}`);
  });
  process.exit(0);
}

switchEnvironment(targetEnv); 