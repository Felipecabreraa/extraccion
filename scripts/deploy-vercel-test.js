#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando deploy correcto para Vercel...');

// 1. Verificar que estamos en la rama correcta
console.log('\n📋 VERIFICANDO RAMA:');
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`✅ Rama actual: ${currentBranch}`);
  
  if (currentBranch !== 'test') {
    console.log('⚠️  Cambiando a rama test...');
    execSync('git checkout test', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Error verificando rama:', error.message);
}

// 2. Crear un vercel.json específico para el frontend-test-publico
console.log('\n📝 CREANDO CONFIGURACIÓN ESPECÍFICA:');
const frontendVercelConfig = {
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "env": {
    "REACT_APP_API_URL": "https://trn-extraccion-test-production.up.railway.app/api",
    "REACT_APP_ENVIRONMENT": "test",
    "REACT_APP_APP_NAME": "EXTRACCION TEST"
  }
};

fs.writeFileSync('frontend-test-publico/vercel.json', JSON.stringify(frontendVercelConfig, null, 2));
console.log('✅ vercel.json creado en frontend-test-publico/');

// 3. Verificar que el build existe y es correcto
console.log('\n📦 VERIFICANDO BUILD:');
const buildPath = path.join(__dirname, '../frontend-test-publico/build/index.html');
if (fs.existsSync(buildPath)) {
  console.log('✅ Build existe');
  
  // Verificar contenido
  const buildContent = fs.readFileSync(buildPath, 'utf8');
  if (buildContent.includes('EXTRACCION') || buildContent.includes('Extracción')) {
    console.log('✅ Build contiene la aplicación correcta');
  } else {
    console.log('⚠️  Build puede necesitar actualización');
  }
} else {
  console.log('❌ Build no existe - creando...');
  try {
    process.chdir(path.join(__dirname, '../frontend-test-publico'));
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir(__dirname + '/..');
    console.log('✅ Build creado exitosamente');
  } catch (error) {
    console.error('❌ Error creando build:', error.message);
  }
}

// 4. Crear un archivo .env en frontend-test-publico si no existe
console.log('\n🔧 VERIFICANDO VARIABLES DE ENTORNO:');
const envPath = path.join(__dirname, '../frontend-test-publico/.env');
if (!fs.existsSync(envPath)) {
  const envContent = `REACT_APP_API_URL=https://trn-extraccion-test-production.up.railway.app/api
REACT_APP_ENVIRONMENT=test
REACT_APP_APP_NAME=EXTRACCION TEST`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado en frontend-test-publico/');
} else {
  console.log('✅ Archivo .env ya existe');
}

// 5. Hacer commit y push
console.log('\n📦 HACIENDO COMMIT Y PUSH:');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Fix: Configuración correcta para Vercel deploy"', { stdio: 'inherit' });
  execSync('git push origin test', { stdio: 'inherit' });
  console.log('✅ Cambios enviados a rama test');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎯 CONFIGURACIÓN PARA VERCEL DASHBOARD:');
console.log('\n📋 CONFIGURACIÓN OBLIGATORIA:');
console.log('1. Ve a tu proyecto en Vercel Dashboard');
console.log('2. Ve a Settings > General');
console.log('3. Configura:');
console.log('   - Root Directory: frontend-test-publico');
console.log('   - Build Command: npm run build');
console.log('   - Output Directory: build');
console.log('   - Install Command: npm install');

console.log('\n🔧 VARIABLES DE ENTORNO (en Vercel):');
console.log('REACT_APP_API_URL = https://trn-extraccion-test-production.up.railway.app/api');
console.log('REACT_APP_ENVIRONMENT = test');
console.log('REACT_APP_APP_NAME = EXTRACCION TEST');

console.log('\n📊 URLs IMPORTANTES:');
console.log('Backend: https://trn-extraccion-test-production.up.railway.app');
console.log('API Health: https://trn-extraccion-test-production.up.railway.app/api/health');
console.log('Frontend: https://trn-extraccion-test-frontend.vercel.app');

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('1. Configura el Root Directory como "frontend-test-publico" en Vercel');
console.log('2. Configura el Output Directory como "build" en Vercel');
console.log('3. Haz clic en "Redeploy"');
console.log('4. Verifica que el deploy sea exitoso');

console.log('\n💡 CONSEJO:');
console.log('Si no puedes cambiar la configuración en el dashboard,');
console.log('puedes crear un nuevo proyecto en Vercel y seleccionar:');
console.log('- Root Directory: frontend-test-publico');
console.log('- Framework: Create React App');
console.log('- Branch: test');

console.log('\n🎉 ¡Configuración lista! Ahora Vercel debería encontrar el build correctamente.'); 