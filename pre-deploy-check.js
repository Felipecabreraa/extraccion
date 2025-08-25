const fs = require('fs');
const path = require('path');

console.log('🔍 Verificación pre-despliegue iniciada...\n');

const checks = {
  renderConfig: false,
  backendConfig: false,
  frontendConfig: false,
  databaseConfig: false,
  healthCheck: false
};

// 1. Verificar render.yaml
console.log('1️⃣ Verificando render.yaml...');
try {
  const renderConfig = fs.readFileSync('render.yaml', 'utf8');
  
  // Verificar que tenga las configuraciones correctas
     const requiredConfigs = [
     'PORT: 3000',
     'healthCheckPath: /health',
     'autoDeploy: true',
     'npm ci --only=production'
   ];
  
  const missingConfigs = requiredConfigs.filter(config => !renderConfig.includes(config));
  
  if (missingConfigs.length === 0) {
    console.log('   ✅ render.yaml configurado correctamente');
    checks.renderConfig = true;
  } else {
    console.log('   ❌ Configuraciones faltantes en render.yaml:', missingConfigs);
  }
} catch (error) {
  console.log('   ❌ Error leyendo render.yaml:', error.message);
}

// 2. Verificar configuración del backend
console.log('\n2️⃣ Verificando configuración del backend...');
try {
  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  
  if (backendPackage.scripts.start === 'node src/app.js') {
    console.log('   ✅ Script de inicio del backend correcto');
  } else {
    console.log('   ❌ Script de inicio del backend incorrecto');
  }
  
  if (backendPackage.engines && backendPackage.engines.node === '22.x') {
    console.log('   ✅ Versión de Node.js configurada correctamente');
  } else {
    console.log('   ❌ Versión de Node.js no configurada o incorrecta');
  }
  
  checks.backendConfig = true;
} catch (error) {
  console.log('   ❌ Error verificando backend:', error.message);
}

// 3. Verificar configuración del frontend
console.log('\n3️⃣ Verificando configuración del frontend...');
try {
  const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  if (frontendPackage.scripts.build === 'react-scripts build') {
    console.log('   ✅ Script de build del frontend correcto');
  } else {
    console.log('   ❌ Script de build del frontend incorrecto');
  }
  
  if (frontendPackage.engines && frontendPackage.engines.node === '18.x') {
    console.log('   ✅ Versión de Node.js del frontend configurada');
  } else {
    console.log('   ❌ Versión de Node.js del frontend no configurada');
  }
  
  checks.frontendConfig = true;
} catch (error) {
  console.log('   ❌ Error verificando frontend:', error.message);
}

// 4. Verificar configuración de base de datos
console.log('\n4️⃣ Verificando configuración de base de datos...');
try {
  const databaseConfig = fs.readFileSync('backend/src/config/database.js', 'utf8');
  
  if (databaseConfig.includes('process.env.DB_HOST') && 
      databaseConfig.includes('process.env.DB_NAME')) {
    console.log('   ✅ Configuración de base de datos correcta');
    checks.databaseConfig = true;
  } else {
    console.log('   ❌ Configuración de base de datos incorrecta');
  }
} catch (error) {
  console.log('   ❌ Error verificando configuración de BD:', error.message);
}

// 5. Verificar health check
console.log('\n5️⃣ Verificando health check...');
try {
  const healthCheck = fs.readFileSync('backend/health-check.js', 'utf8');
  
  if (healthCheck.includes('/health') && healthCheck.includes('sequelize.authenticate')) {
    console.log('   ✅ Health check configurado correctamente');
    checks.healthCheck = true;
  } else {
    console.log('   ❌ Health check no configurado correctamente');
  }
} catch (error) {
  console.log('   ❌ Error verificando health check:', error.message);
}

// Resumen final
console.log('\n📋 RESUMEN DE VERIFICACIÓN PRE-DESPLIEGUE:');
console.log('==========================================');

Object.entries(checks).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  console.log(`${status} ${name}: ${value ? 'OK' : 'ERROR'}`);
});

const allChecksPassed = Object.values(checks).every(check => check);

if (allChecksPassed) {
  console.log('\n🎉 ¡Todas las verificaciones pasaron! El despliegue está listo.');
  console.log('🚀 Puedes proceder con confianza al despliegue en Render.');
  process.exit(0);
} else {
  console.log('\n⚠️ Se encontraron problemas que deben corregirse antes del despliegue.');
  console.log('💡 Revisa los errores anteriores y corrígelos antes de continuar.');
  process.exit(1);
}
