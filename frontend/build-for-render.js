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

// Verificar que existe el directorio public
const publicDir = path.join(currentDir, 'public');
if (!fs.existsSync(publicDir)) {
  console.error('❌ No se encontró el directorio public');
  process.exit(1);
}

// Verificar que existe index.html
const indexHtmlPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ No se encontró index.html en public/');
  process.exit(1);
}

console.log('✅ Verificaciones completadas, iniciando build...');

// Ejecutar el build
exec('npm install --audit=false && CI=false npm run build', (error, stdout, stderr) => {
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
    } else {
      console.error('❌ No se creó el directorio build');
      process.exit(1);
    }
    
    process.exit(0);
  }
}); 