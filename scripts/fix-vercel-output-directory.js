#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando problema de Output Directory en Vercel...');

// 1. Crear vercel.json en la raíz con la configuración correcta
console.log('\n📝 CREANDO VERCEL.JSON EN RAÍZ:');
const rootVercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "frontend-test-publico/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend-test-publico/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://trn-extraccion-test-production.up.railway.app/api",
    "REACT_APP_ENVIRONMENT": "test",
    "REACT_APP_APP_NAME": "EXTRACCION TEST"
  }
};

fs.writeFileSync('vercel.json', JSON.stringify(rootVercelConfig, null, 2));
console.log('✅ vercel.json creado en raíz con configuración correcta');

// 2. Verificar que el build existe en el directorio correcto
console.log('\n📦 VERIFICANDO BUILD:');
const buildPath = path.join(__dirname, '../frontend-test-publico/build/index.html');
if (fs.existsSync(buildPath)) {
  console.log('✅ Build existe en frontend-test-publico/build/');
  
  // Verificar contenido del build
  const buildContent = fs.readFileSync(buildPath, 'utf8');
  if (buildContent.includes('EXTRACCION') || buildContent.includes('Extracción')) {
    console.log('✅ Build contiene la aplicación correcta');
  } else {
    console.log('⚠️  Build puede necesitar actualización');
  }
} else {
  console.log('❌ Build no existe - creando...');
  
  // Crear build si no existe
  const { execSync } = require('child_process');
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

// 3. Crear un archivo de configuración específico para Vercel
console.log('\n⚙️ CREANDO CONFIGURACIÓN ESPECÍFICA:');
const vercelIgnore = `
# Archivos que no se suben a Vercel
node_modules/
.env.local
.env.development
.env.test
.env.production
*.log
.DS_Store
coverage/
dist/
`.trim();

fs.writeFileSync('.vercelignore', vercelIgnore);
console.log('✅ .vercelignore creado');

// 4. Hacer commit y push
console.log('\n📦 HACIENDO COMMIT Y PUSH:');
const { execSync } = require('child_process');

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Fix: Configurar output directory correcto para Vercel"', { stdio: 'inherit' });
  execSync('git push origin test', { stdio: 'inherit' });
  console.log('✅ Cambios enviados a rama test');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎯 CONFIGURACIÓN CORREGIDA:');
console.log('\n📋 CONFIGURACIÓN PARA VERCEL:');
console.log('- Root Directory: frontend-test-publico');
console.log('- Output Directory: build (dentro de frontend-test-publico)');
console.log('- Build Command: npm run build');
console.log('- Install Command: npm install');

console.log('\n🔧 VARIABLES DE ENTORNO:');
console.log('REACT_APP_API_URL = https://trn-extraccion-test-production.up.railway.app/api');
console.log('REACT_APP_ENVIRONMENT = test');
console.log('REACT_APP_APP_NAME = EXTRACCION TEST');

console.log('\n📊 URLs IMPORTANTES:');
console.log('Backend: https://trn-extraccion-test-production.up.railway.app');
console.log('API Health: https://trn-extraccion-test-production.up.railway.app/api/health');
console.log('Frontend: https://trn-extraccion-test-frontend.vercel.app');

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('1. Ve a Vercel Dashboard');
console.log('2. Configura Output Directory como: frontend-test-publico/build');
console.log('3. Haz clic en "Redeploy"');
console.log('4. Verifica que el deploy sea exitoso');

console.log('\n🎉 ¡Configuración corregida! Ahora Vercel debería encontrar el build correctamente.'); 