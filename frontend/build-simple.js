const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Iniciando build simple del frontend...');

// Verificar que estamos en el directorio correcto
const currentDir = process.cwd();
console.log('📁 Directorio actual:', currentDir);

// Verificar que existe el package.json
const packageJsonPath = path.join(currentDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ No se encontró package.json');
  process.exit(1);
}

console.log('✅ package.json encontrado');

// Crear directorio public si no existe
const publicDir = path.join(currentDir, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('📁 Creando directorio public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crear index.html si no existe
const indexHtmlPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('📄 Creando index.html...');
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Sistema de Extracción" />
    <title>Sistema de Extracción</title>
  </head>
  <body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta aplicación.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  fs.writeFileSync(indexHtmlPath, indexHtmlContent);
}

console.log('✅ Preparación completada');

// Ejecutar build
console.log('🔨 Ejecutando build...');
const buildCommand = 'CI=false npm run build';

exec(buildCommand, { cwd: currentDir }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error durante el build:');
    console.error(error.message);
    if (stderr) console.error('stderr:', stderr);
    process.exit(1);
  }
  
  console.log('✅ Build completado exitosamente');
  console.log(stdout);
  
  // Verificar que se creó el directorio build
  const buildDir = path.join(currentDir, 'build');
  if (fs.existsSync(buildDir)) {
    console.log('✅ Directorio build creado');
    const files = fs.readdirSync(buildDir);
    console.log('📁 Archivos en build:', files);
  }
  
  process.exit(0);
}); 