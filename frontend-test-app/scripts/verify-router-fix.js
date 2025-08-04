const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando correcciones de React Router...');
console.log('============================================');

// Verificar archivos necesarios
const filesToCheck = [
  'src/config/routerConfig.js',
  'src/components/RouterWrapper.jsx',
  'src/App.js'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - No existe`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Algunos archivos necesarios no existen');
  process.exit(1);
}

// Verificar contenido de App.js
const appJsPath = path.join(__dirname, '..', 'src/App.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

const checks = [
  {
    name: 'RouterWrapper importado',
    check: appJsContent.includes("import RouterWrapper from './components/RouterWrapper'")
  },
  {
    name: 'RouterWrapper usado en lugar de BrowserRouter',
    check: appJsContent.includes('<RouterWrapper>') && appJsContent.includes('</RouterWrapper>')
  },
  {
    name: 'BrowserRouter no importado directamente',
    check: !appJsContent.includes("import { BrowserRouter")
  }
];

console.log('\n📋 Verificando implementación:');
checks.forEach(check => {
  if (check.check) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name}`);
  }
});

// Verificar configuración del router
const routerConfigPath = path.join(__dirname, '..', 'src/config/routerConfig.js');
const routerConfigContent = fs.readFileSync(routerConfigPath, 'utf8');

const configChecks = [
  {
    name: 'v7_startTransition configurado',
    check: routerConfigContent.includes('v7_startTransition: true')
  },
  {
    name: 'v7_relativeSplatPath configurado',
    check: routerConfigContent.includes('v7_relativeSplatPath: true')
  }
];

console.log('\n📋 Verificando configuración:');
configChecks.forEach(check => {
  if (check.check) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name}`);
  }
});

console.log('\n✅ Verificación completada');
console.log('\n📝 Para aplicar los cambios:');
console.log('1. Reinicia el servidor de desarrollo (npm start)');
console.log('2. Abre la consola del navegador');
console.log('3. Las advertencias de React Router deberían haber desaparecido'); 