#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de ambientes...');

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} - NO ENCONTRADO`);
    return false;
  }
}

function checkEnvFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ ${description}: ${filePath}`);
    console.log(`   📄 Tamaño: ${content.length} caracteres`);
    console.log(`   📋 Variables: ${content.split('\n').filter(line => line.includes('=')).length} variables`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} - NO ENCONTRADO`);
    return false;
  }
}

function verifyEnvironments() {
  console.log('\n📋 PASO 1: Verificando archivos de configuración de ambientes...');
  
  let allGood = true;
  
  // Verificar archivos de entorno del backend
  allGood &= checkEnvFile('backend/env.development', 'Backend - Desarrollo');
  allGood &= checkEnvFile('backend/env.test', 'Backend - Pruebas');
  allGood &= checkEnvFile('backend/env.production', 'Backend - Producción');
  
  // Verificar archivos de entorno del frontend
  allGood &= checkEnvFile('frontend/env.development', 'Frontend - Desarrollo');
  allGood &= checkEnvFile('frontend/env.test', 'Frontend - Pruebas');
  allGood &= checkEnvFile('frontend/env.production', 'Frontend - Producción');
  
  console.log('\n📋 PASO 2: Verificando archivos .env activos...');
  
  // Verificar archivos .env activos
  allGood &= checkEnvFile('backend/.env', 'Backend - .env activo');
  allGood &= checkEnvFile('frontend/.env', 'Frontend - .env activo');
  
  console.log('\n📋 PASO 3: Verificando scripts de gestión...');
  
  // Verificar scripts
  allGood &= checkFile('scripts/switch-to-development.js', 'Script - Cambiar a desarrollo');
  allGood &= checkFile('scripts/switch-to-test.js', 'Script - Cambiar a pruebas');
  allGood &= checkFile('scripts/switch-to-production.js', 'Script - Cambiar a producción');
  allGood &= checkFile('scripts/start-development.js', 'Script - Iniciar desarrollo');
  
  console.log('\n📋 PASO 4: Verificando package.json scripts...');
  
  // Verificar package.json del backend
  if (fs.existsSync('backend/package.json')) {
    const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
    const hasDevScript = backendPackage.scripts && backendPackage.scripts.dev;
    const hasTestScript = backendPackage.scripts && backendPackage.scripts.test;
    
    console.log(`✅ Backend package.json: ${hasDevScript ? 'dev script ✓' : 'dev script ✗'}`);
    console.log(`✅ Backend package.json: ${hasTestScript ? 'test script ✓' : 'test script ✗'}`);
    
    if (!hasDevScript || !hasTestScript) {
      allGood = false;
    }
  } else {
    console.log('❌ Backend package.json: NO ENCONTRADO');
    allGood = false;
  }
  
  // Verificar package.json del frontend
  if (fs.existsSync('frontend/package.json')) {
    const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    const hasStartScript = frontendPackage.scripts && frontendPackage.scripts.start;
    const hasBuildScript = frontendPackage.scripts && frontendPackage.scripts.build;
    
    console.log(`✅ Frontend package.json: ${hasStartScript ? 'start script ✓' : 'start script ✗'}`);
    console.log(`✅ Frontend package.json: ${hasBuildScript ? 'build script ✓' : 'build script ✗'}`);
    
    if (!hasStartScript || !hasBuildScript) {
      allGood = false;
    }
  } else {
    console.log('❌ Frontend package.json: NO ENCONTRADO');
    allGood = false;
  }
  
  console.log('\n📋 PASO 5: Verificando estructura de directorios...');
  
  // Verificar directorios
  const directories = [
    'backend',
    'frontend',
    'scripts',
    'backend/src',
    'frontend/src',
    'backend/config',
    'frontend/config'
  ];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ Directorio: ${dir}`);
    } else {
      console.log(`❌ Directorio: ${dir} - NO ENCONTRADO`);
      allGood = false;
    }
  });
  
  console.log('\n📋 PASO 6: Verificando configuración actual...');
  
  // Verificar configuración actual
  if (fs.existsSync('backend/.env')) {
    const backendEnv = fs.readFileSync('backend/.env', 'utf8');
    const isDevelopment = backendEnv.includes('NODE_ENV=development');
    const hasPort = backendEnv.includes('PORT=3001');
    const hasDatabase = backendEnv.includes('DB_NAME=trn_extraccion_dev');
    
    console.log(`✅ Backend .env: ${isDevelopment ? 'Desarrollo ✓' : 'Otro ambiente ✗'}`);
    console.log(`✅ Backend .env: ${hasPort ? 'Puerto 3001 ✓' : 'Puerto diferente ✗'}`);
    console.log(`✅ Backend .env: ${hasDatabase ? 'DB Desarrollo ✓' : 'DB diferente ✗'}`);
    
    if (!isDevelopment || !hasPort || !hasDatabase) {
      console.log('⚠️  El backend no está configurado para desarrollo');
    }
  }
  
  if (fs.existsSync('frontend/.env')) {
    const frontendEnv = fs.readFileSync('frontend/.env', 'utf8');
    const isDevelopment = frontendEnv.includes('REACT_APP_ENVIRONMENT=development');
    const hasApiUrl = frontendEnv.includes('REACT_APP_API_URL=http://localhost:3001/api');
    
    console.log(`✅ Frontend .env: ${isDevelopment ? 'Desarrollo ✓' : 'Otro ambiente ✗'}`);
    console.log(`✅ Frontend .env: ${hasApiUrl ? 'API URL correcta ✓' : 'API URL diferente ✗'}`);
    
    if (!isDevelopment || !hasApiUrl) {
      console.log('⚠️  El frontend no está configurado para desarrollo');
    }
  }
  
  console.log('\n📋 RESULTADO FINAL:');
  
  if (allGood) {
    console.log('🎉 ¡TODOS LOS AMBIENTES ESTÁN CONFIGURADOS CORRECTAMENTE!');
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/switch-to-development.js    # Cambiar a desarrollo');
    console.log('   - node scripts/switch-to-test.js           # Cambiar a pruebas');
    console.log('   - node scripts/switch-to-production.js     # Cambiar a producción');
    console.log('   - node scripts/start-development.js        # Iniciar desarrollo completo');
    console.log('\n🌐 URLs de Desarrollo:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - API Health: http://localhost:3001/health');
  } else {
    console.log('❌ HAY PROBLEMAS EN LA CONFIGURACIÓN');
    console.log('\n🔧 Pasos para solucionar:');
    console.log('   1. Ejecutar: node scripts/setup-environments.js');
    console.log('   2. Verificar que todos los archivos se crearon');
    console.log('   3. Ejecutar: node scripts/switch-to-development.js');
    console.log('   4. Ejecutar este script nuevamente');
  }
  
  return allGood;
}

verifyEnvironments(); 