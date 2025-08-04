#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Forzando detección de frontend-test-publico en Vercel...');

// 1. Crear un vercel.json en la raíz que apunte específicamente a frontend-test-publico
console.log('\n📝 CREANDO VERCEL.JSON ESPECÍFICO:');
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
console.log('✅ vercel.json creado en raíz');

// 2. Crear un package.json en la raíz que redirija a frontend-test-publico
console.log('\n📦 CREANDO PACKAGE.JSON EN RAÍZ:');
const rootPackageJson = {
  "name": "extraccion-monorepo",
  "version": "1.0.0",
  "description": "Sistema de Extracción - Monorepo",
  "scripts": {
    "build": "cd frontend-test-publico && npm install && npm run build",
    "start": "cd frontend-test-publico && npm start",
    "test": "cd frontend-test-publico && npm test"
  },
  "workspaces": [
    "frontend-test-publico"
  ],
  "private": true
};

fs.writeFileSync('package.json', JSON.stringify(rootPackageJson, null, 2));
console.log('✅ package.json creado en raíz');

// 3. Crear un .vercelignore que excluya todo excepto frontend-test-publico
console.log('\n📁 CREANDO .VERCELIGNORE:');
const vercelIgnore = `
# Excluir todo excepto frontend-test-publico
*
!frontend-test-publico/
!frontend-test-publico/**
!package.json
!vercel.json
`.trim();

fs.writeFileSync('.vercelignore', vercelIgnore);
console.log('✅ .vercelignore creado');

// 4. Verificar que frontend-test-publico tenga todo lo necesario
console.log('\n🔍 VERIFICANDO FRONTEND-TEST-PUBLICO:');
const requiredFiles = [
  'frontend-test-publico/package.json',
  'frontend-test-publico/public/index.html',
  'frontend-test-publico/src/index.js',
  'frontend-test-publico/src/App.js',
  'frontend-test-publico/README.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: EXISTE`);
  } else {
    console.log(`❌ ${file}: FALTANTE`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  Algunos archivos faltan. Creando estructura básica...');
  
  // Crear src/index.js si no existe
  if (!fs.existsSync('frontend-test-publico/src/index.js')) {
    const indexJsContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    
    if (!fs.existsSync('frontend-test-publico/src')) {
      fs.mkdirSync('frontend-test-publico/src', { recursive: true });
    }
    fs.writeFileSync('frontend-test-publico/src/index.js', indexJsContent);
    console.log('✅ src/index.js creado');
  }
  
  // Crear src/App.js si no existe
  if (!fs.existsSync('frontend-test-publico/src/App.js')) {
    const appJsContent = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>EXTRACCION TEST</h1>
        <p>Sistema de Extracción - Ambiente de Pruebas</p>
      </header>
    </div>
  );
}

export default App;`;
    
    fs.writeFileSync('frontend-test-publico/src/App.js', appJsContent);
    console.log('✅ src/App.js creado');
  }
  
  // Crear src/App.css si no existe
  if (!fs.existsSync('frontend-test-publico/src/App.css')) {
    const appCssContent = `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}

.App-header h1 {
  margin: 0;
  font-size: 2rem;
}

.App-header p {
  margin: 10px 0 0 0;
  font-size: 1.2rem;
}`;
    
    fs.writeFileSync('frontend-test-publico/src/App.css', appCssContent);
    console.log('✅ src/App.css creado');
  }
  
  // Crear src/index.css si no existe
  if (!fs.existsSync('frontend-test-publico/src/index.css')) {
    const indexCssContent = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`;
    
    fs.writeFileSync('frontend-test-publico/src/index.css', indexCssContent);
    console.log('✅ src/index.css creado');
  }
}

// 5. Hacer commit y push
console.log('\n📦 HACIENDO COMMIT Y PUSH:');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Fix: Configuración monorepo para Vercel"', { stdio: 'inherit' });
  execSync('git push origin test', { stdio: 'inherit' });
  console.log('✅ Cambios enviados a rama test');
} catch (error) {
  console.error('❌ Error en git:', error.message);
}

console.log('\n🎯 INSTRUCCIONES PARA VERCEL:');
console.log('\n📋 OPCIÓN 1: Usar Directorio Raíz');
console.log('1. En el modal actual, selecciona "extraccion" (directorio raíz)');
console.log('2. Haz clic en "Continue"');
console.log('3. Después de crear el proyecto, ve a Settings > General');
console.log('4. Configura Root Directory como: frontend-test-publico');

console.log('\n📋 OPCIÓN 2: Crear Nuevo Proyecto');
console.log('1. Haz clic en "Cancel"');
console.log('2. Ve a "New Project"');
console.log('3. Selecciona tu repositorio "extraccion"');
console.log('4. Ahora debería aparecer "frontend-test-publico" en la lista');
console.log('5. Selecciónalo y haz clic en "Continue"');

console.log('\n🔧 VARIABLES DE ENTORNO (en Vercel):');
console.log('REACT_APP_API_URL = https://trn-extraccion-test-production.up.railway.app/api');
console.log('REACT_APP_ENVIRONMENT = test');
console.log('REACT_APP_APP_NAME = EXTRACCION TEST');

console.log('\n💡 CONSEJO:');
console.log('Si aún no aparece "frontend-test-publico",');
console.log('usa la OPCIÓN 1 y configura el Root Directory manualmente.');

console.log('\n🎉 ¡Configuración monorepo lista! Ahora Vercel debería funcionar correctamente.'); 