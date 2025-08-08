const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Iniciando build del frontend para Render...');

// Verificar que estamos en el directorio correcto
const currentDir = process.cwd();
console.log('📁 Directorio actual:', currentDir);

// Verificar que existe el package.json
const packageJsonPath = path.join(currentDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ No se encontró package.json en el directorio actual');
  process.exit(1);
}

console.log('✅ package.json encontrado');

// Buscar o crear el directorio public
let publicDir = path.join(currentDir, 'public');

if (!fs.existsSync(publicDir)) {
  console.log('📁 Creando directorio public...');
  try {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Directorio public creado');
  } catch (error) {
    console.error('❌ Error creando directorio public:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Directorio public encontrado');
}

// Verificar o crear index.html
const indexHtmlPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('📄 Creando index.html...');
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Sistema de Extracción - Gestión de datos y reportes"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Sistema de Extracción</title>
  </head>
  <body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta aplicación.</noscript>
    <div id="root"></div>
  </body>
</html>`;

  try {
    fs.writeFileSync(indexHtmlPath, indexHtmlContent);
    console.log('✅ index.html creado');
  } catch (error) {
    console.error('❌ Error creando index.html:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ index.html encontrado');
}

// Crear manifest.json si no existe
const manifestPath = path.join(publicDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log('📄 Creando manifest.json...');
  const manifestContent = `{
  "short_name": "Extracción",
  "name": "Sistema de Extracción",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}`;

  try {
    fs.writeFileSync(manifestPath, manifestContent);
    console.log('✅ manifest.json creado');
  } catch (error) {
    console.error('❌ Error creando manifest.json:', error.message);
  }
}

console.log('✅ Verificaciones completadas, iniciando build...');

// Ejecutar npm install primero
console.log('📦 Instalando dependencias...');
exec('npm install --audit=false', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error instalando dependencias:', error.message);
    console.error('stderr:', stderr);
    process.exit(1);
  }
  
  console.log('✅ Dependencias instaladas');
  console.log(stdout);
  
  // Ejecutar el build
  console.log('🔨 Ejecutando build...');
  exec('CI=false npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error durante el build:', error.message);
      console.error('stderr:', stderr);
      process.exit(1);
    } else {
      console.log('✅ Build completado exitosamente');
      console.log(stdout);
      
      // Verificar que se creó el directorio build
      const buildDir = path.join(currentDir, 'build');
      if (fs.existsSync(buildDir)) {
        console.log('✅ Directorio build creado correctamente');
        const files = fs.readdirSync(buildDir);
        console.log('📁 Archivos en build:', files);
        
        // Crear archivo de configuración para Render
        const renderConfigPath = path.join(buildDir, 'render.yaml');
        const renderConfig = `routes:
  - type: rewrite
    source: "/*"
    destination: "/index.html"`;
        
        try {
          fs.writeFileSync(renderConfigPath, renderConfig);
          console.log('✅ Archivo render.yaml creado en build/');
        } catch (error) {
          console.error('❌ Error creando render.yaml:', error.message);
        }
        
      } else {
        console.error('❌ No se creó el directorio build');
        process.exit(1);
      }
      
      process.exit(0);
    }
  });
}); 