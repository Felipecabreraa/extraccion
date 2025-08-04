const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando problema SIGTERM en Railway...');

// 1. Crear Procfile correcto
const procfileContent = `web: npm start
`;
fs.writeFileSync('Procfile', procfileContent);
console.log('✅ Procfile creado');

// 2. Crear railway.json
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
};
fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
console.log('✅ Railway.json configurado');

// 3. Actualizar package.json del backend
const packagePath = path.join(__dirname, '../backend/package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.scripts = {
    ...packageJson.scripts,
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  };
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json actualizado');
}

console.log('\n📋 PASOS MANUALES:');
console.log('1. Ir a Railway Dashboard');
console.log('2. Verificar variables de entorno:');
console.log('   - NODE_ENV=test');
console.log('   - PORT=3002');
console.log('   - DB_HOST=trn.cl');
console.log('   - DB_USER=trn_felipe');
console.log('   - DB_PASSWORD=RioNegro2025@');
console.log('   - DB_NAME=trn_extraccion_test');
console.log('3. Hacer restart del deployment');
console.log('4. Verificar logs');

console.log('\n🎯 Resultado esperado: Servidor RUNNING sin SIGTERM'); 