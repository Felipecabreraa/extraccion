#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando ambiente de DESARROLLO LOCAL...');

// Función para copiar archivo de configuración
function copyEnvFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}:`, error.message);
  }
}

// Función para ejecutar comando en paralelo
function runParallel(commands) {
  const processes = commands.map(cmd => {
    const [command, ...args] = cmd.split(' ');
    return spawn(command, args, { 
      stdio: 'inherit',
      shell: true,
      cwd: cmd.cwd || process.cwd()
    });
  });

  // Manejar salida de procesos
  processes.forEach((process, index) => {
    process.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Proceso ${index + 1} terminó con código ${code}`);
      }
    });
  });

  return processes;
}

async function startDevelopment() {
  try {
    console.log('\n📋 PASO 1: Configurando backend para desarrollo...');
    
    // Copiar configuración de desarrollo al backend
    copyEnvFile(
      path.join(__dirname, '../backend/env.development'),
      path.join(__dirname, '../backend/.env')
    );
    
    console.log('\n📋 PASO 2: Configurando frontend para desarrollo...');
    
    // Copiar configuración de desarrollo al frontend
    copyEnvFile(
      path.join(__dirname, '../frontend/env.development'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\n📋 PASO 3: Instalando dependencias...');
    
    // Instalar dependencias del backend
    console.log('📦 Instalando dependencias del backend...');
    execSync('npm install', { 
      cwd: path.join(__dirname, '../backend'),
      stdio: 'inherit'
    });
    
    // Instalar dependencias del frontend
    console.log('📦 Instalando dependencias del frontend...');
    execSync('npm install', { 
      cwd: path.join(__dirname, '../frontend'),
      stdio: 'inherit'
    });
    
    console.log('\n📋 PASO 4: Iniciando servicios en paralelo...');
    
    // Iniciar backend y frontend en paralelo
    const processes = runParallel([
      {
        command: 'npm start',
        cwd: path.join(__dirname, '../backend')
      },
      {
        command: 'npm start',
        cwd: path.join(__dirname, '../frontend')
      }
    ]);
    
    console.log('\n✅ ¡Ambiente de desarrollo iniciado!');
    console.log('\n🌐 URLs de Desarrollo:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('\n📝 Para detener los servicios, presiona Ctrl+C');
    
    // Manejar señal de terminación
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo servicios...');
      processes.forEach(proc => proc.kill('SIGINT'));
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Error iniciando desarrollo:', error.message);
    process.exit(1);
  }
}

startDevelopment(); 