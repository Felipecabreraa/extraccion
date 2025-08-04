#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Diagnosticando y solucionando problema de Vercel...');

// 1. Verificar estructura del proyecto
console.log('\n📋 ESTRUCTURA DEL PROYECTO:');
const directories = [
  'frontend',
  'frontend-test',
  'frontend-test-app',
  'frontend-test-public',
  'frontend-test-publico'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    const packagePath = path.join(dirPath, 'package.json');
    const buildPath = path.join(dirPath, 'build');
    const hasPackage = fs.existsSync(packagePath);
    const hasBuild = fs.existsSync(buildPath);
    console.log(`✅ ${dir}: ${hasPackage ? 'package.json' : 'NO package.json'} | ${hasBuild ? 'build' : 'NO build'}`);
  } else {
    console.log(`❌ ${dir}: NO EXISTE`);
  }
});

// 2. Crear vercel.json optimizado
console.log('\n🔧 CREANDO VERCEL.JSON OPTIMIZADO:');
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "frontend-test-publico/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "installCommand": "npm install",
        "buildCommand": "npm run build"
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

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json optimizado creado');

// 3. Crear vercel.json específico para frontend-test-publico
console.log('\n🔧 CREANDO VERCEL.JSON ESPECÍFICO:');
const frontendVercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "installCommand": "npm install",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://trn-extraccion-test-production.up.railway.app/api",
    "REACT_APP_ENVIRONMENT": "test",
    "REACT_APP_APP_NAME": "EXTRACCION TEST"
  }
};

fs.writeFileSync('frontend-test-publico/vercel.json', JSON.stringify(frontendVercelConfig, null, 2));
console.log('✅ vercel.json específico creado');

// 4. Verificar y corregir package.json del frontend
console.log('\n📦 VERIFICANDO PACKAGE.JSON:');
const packagePath = path.join(__dirname, '../frontend-test-publico/package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Asegurar que el script de build esté correcto
  packageJson.scripts = {
    ...packageJson.scripts,
    "build": "react-scripts build",
    "vercel-build": "npm run build"
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json actualizado');
} else {
  console.log('❌ package.json no encontrado');
}

// 5. Crear archivo de configuración para Vercel
console.log('\n⚙️ CREANDO CONFIGURACIÓN ADICIONAL:');
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
build/
dist/
`.trim();

fs.writeFileSync('.vercelignore', vercelIgnore);
console.log('✅ .vercelignore creado');

// 6. Verificar build
console.log('\n📦 VERIFICANDO BUILD:');
const buildPath = path.join(__dirname, '../frontend-test-publico/build/index.html');
if (fs.existsSync(buildPath)) {
  const buildContent = fs.readFileSync(buildPath, 'utf8');
  if (buildContent.includes('EXTRACCION') || buildContent.includes('Extracción')) {
    console.log('✅ Build contiene la aplicación correcta');
  } else {
    console.log('❌ Build no contiene la aplicación esperada');
  }
} else {
  console.log('❌ Build no existe');
}

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('1. Hacer commit y push de los cambios');
console.log('2. Verificar en Vercel Dashboard que el deployment se ejecute');
console.log('3. Revisar logs en Vercel para identificar problemas');
console.log('4. Si persiste el problema, considerar deploy manual');

console.log('\n📊 CONFIGURACIÓN ACTUAL:');
console.log('- Frontend: frontend-test-publico/');
console.log('- Build: frontend-test-publico/build/');
console.log('- API: https://trn-extraccion-test-production.up.railway.app/api');
console.log('- URL esperada: https://frontend-puce-eta-70-git-test.vercel.app');

// 7. Hacer commit automático
console.log('\n📦 HACIENDO COMMIT AUTOMÁTICO...');
const { execSync } = require('child_process');

try {
  execSync('git add .', { cwd: process.cwd() });
  console.log('✅ Cambios agregados');
  
  execSync('git commit -m "Fix: Optimizar configuración Vercel para frontend de pruebas"', { cwd: process.cwd() });
  console.log('✅ Commit realizado');
  
  execSync('git push origin test', { cwd: process.cwd() });
  console.log('✅ Push realizado');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎉 Diagnóstico y corrección completados. Revisa Vercel Dashboard.'); 