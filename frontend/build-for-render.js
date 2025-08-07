const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Iniciando build del frontend para Render...');

// Verificar que estamos en el directorio correcto
const currentDir = process.cwd();
console.log('📁 Directorio actual:', currentDir);

// Listar archivos y directorios para debugging
console.log('📂 Contenido del directorio actual:');
try {
  const files = fs.readdirSync(currentDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(currentDir, file));
    const type = stats.isDirectory() ? '📁' : '📄';
    console.log(`  ${type} ${file}`);
  });
} catch (error) {
  console.error('❌ Error listando archivos:', error.message);
}

// Verificar que existe el package.json
const packageJsonPath = path.join(currentDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ No se encontró package.json en el directorio actual');
  process.exit(1);
}

console.log('✅ package.json encontrado');

// Buscar el directorio public - debe estar en el directorio frontend actual
let publicDir = null;
const possiblePublicPaths = [
  path.join(currentDir, 'public'), // Desde frontend/public
  path.join(currentDir, 'src', 'public'), // Desde frontend/src/public
];

console.log('🔍 Verificando rutas:');
for (const publicPath of possiblePublicPaths) {
  console.log(`  - ${publicPath}`);
  if (fs.existsSync(publicPath)) {
    publicDir = publicPath;
    console.log(`✅ Directorio public encontrado en: ${publicPath}`);
    break;
  }
}

if (!publicDir) {
  console.error('❌ No se encontró el directorio public en ninguna ubicación esperada');
  
  // Intentar listar el contenido del directorio actual para debugging
  console.log('🔍 Explorando directorio actual más detalladamente:');
  try {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`📁 Explorando directorio: ${file}`);
        try {
          const subFiles = fs.readdirSync(filePath);
          subFiles.forEach(subFile => {
            const subStats = fs.statSync(path.join(filePath, subFile));
            const type = subStats.isDirectory() ? '📁' : '📄';
            console.log(`  ${type} ${subFile}`);
          });
        } catch (error) {
          console.log(`  ❌ Error explorando ${file}:`, error.message);
        }
      }
    });
  } catch (error) {
    console.error('Error explorando directorio actual:', error.message);
  }
  
  process.exit(1);
}

// Verificar que existe index.html
const indexHtmlPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ No se encontró index.html en public/');
  console.log('📂 Contenido del directorio public:');
  try {
    const publicFiles = fs.readdirSync(publicDir);
    publicFiles.forEach(file => console.log(`  📄 ${file}`));
  } catch (error) {
    console.error('Error listando archivos de public:', error.message);
  }
  process.exit(1);
}

console.log('✅ index.html encontrado');

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