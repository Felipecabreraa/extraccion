const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Iniciando build directo del frontend...');

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

// Configurar variables de entorno
const env = {
  ...process.env,
  CI: 'false',
  GENERATE_SOURCEMAP: 'false',
  NODE_ENV: 'production'
};

console.log('🔨 Ejecutando build con variables de entorno:', env);

// Ejecutar build usando spawn para mejor control
const buildProcess = spawn('npm', ['run', 'build'], {
  cwd: currentDir,
  env: env,
  stdio: 'pipe'
});

buildProcess.stdout.on('data', (data) => {
  console.log('📤 stdout:', data.toString());
});

buildProcess.stderr.on('data', (data) => {
  console.log('📤 stderr:', data.toString());
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completado exitosamente');
    
    // Verificar que se creó el directorio build
    const buildDir = path.join(currentDir, 'build');
    if (fs.existsSync(buildDir)) {
      console.log('✅ Directorio build creado');
      const files = fs.readdirSync(buildDir);
      console.log('📁 Archivos en build:', files);
    } else {
      console.error('❌ No se creó el directorio build');
      process.exit(1);
    }
    
    process.exit(0);
  } else {
    console.error(`❌ Build falló con código: ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Error ejecutando build:', error.message);
  process.exit(1);
}); 