const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build optimizado del frontend...');

// Configurar variables de entorno para producción
process.env.NODE_ENV = 'production';
process.env.CI = 'false';
process.env.GENERATE_SOURCEMAP = 'false';

// Verificar directorio actual
const currentDir = process.cwd();
console.log('📁 Directorio actual:', currentDir);

// Verificar que estamos en el directorio frontend
if (!currentDir.includes('frontend')) {
  console.log('📁 Cambiando al directorio frontend...');
  process.chdir(path.join(currentDir, 'frontend'));
}

// Verificar package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ No se encontró package.json en el directorio frontend');
  process.exit(1);
}

console.log('✅ package.json encontrado');

// Limpiar directorio build si existe
const buildDir = path.join(process.cwd(), 'build');
if (fs.existsSync(buildDir)) {
  console.log('🧹 Limpiando directorio build anterior...');
  fs.rmSync(buildDir, { recursive: true, force: true });
}

// Instalar dependencias
console.log('📦 Instalando dependencias...');
const installProcess = spawn('npm', ['ci'], {
  stdio: 'pipe',
  env: process.env
});

installProcess.stdout.on('data', (data) => {
  console.log('📤 npm install:', data.toString());
});

installProcess.stderr.on('data', (data) => {
  console.log('📤 npm install stderr:', data.toString());
});

installProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Dependencias instaladas correctamente');
    runBuild();
  } else {
    console.error(`❌ Error instalando dependencias: ${code}`);
    process.exit(code);
  }
});

function runBuild() {
  console.log('🔨 Ejecutando build de producción...');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'pipe',
    env: process.env
  });

  buildProcess.stdout.on('data', (data) => {
    console.log('📤 build:', data.toString());
  });

  buildProcess.stderr.on('data', (data) => {
    console.log('📤 build stderr:', data.toString());
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build completado exitosamente');
      verifyBuild();
    } else {
      console.error(`❌ Build falló con código: ${code}`);
      process.exit(code);
    }
  });

  buildProcess.on('error', (error) => {
    console.error('❌ Error ejecutando build:', error.message);
    process.exit(1);
  });
}

function verifyBuild() {
  console.log('🔍 Verificando archivos generados...');
  
  if (fs.existsSync(buildDir)) {
    const files = fs.readdirSync(buildDir);
    console.log('📁 Archivos en build:', files);
    
    // Verificar archivos críticos
    const criticalFiles = ['index.html', 'static'];
    const missingFiles = criticalFiles.filter(file => !files.includes(file));
    
    if (missingFiles.length === 0) {
      console.log('✅ Todos los archivos críticos presentes');
      console.log('🎉 Build optimizado completado exitosamente');
      process.exit(0);
    } else {
      console.error('❌ Archivos críticos faltantes:', missingFiles);
      process.exit(1);
    }
  } else {
    console.error('❌ Directorio build no encontrado');
    process.exit(1);
  }
}
