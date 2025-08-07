#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkEnvironment() {
  log('\n🔍 Verificando configuración del proyecto...', 'cyan');
  
  const checks = [
    { name: 'Backend .env', path: 'backend/.env', required: true },
    { name: 'Frontend .env', path: 'frontend/.env', required: true },
    { name: 'Backend package.json', path: 'backend/package.json', required: true },
    { name: 'Frontend package.json', path: 'frontend/package.json', required: true }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    if (checkFileExists(check.path)) {
      log(`  ✅ ${check.name}`, 'green');
    } else {
      log(`  ❌ ${check.name}`, 'red');
      if (check.required) {
        allGood = false;
      }
    }
  });
  
  return allGood;
}

function installDependencies() {
  log('\n📦 Instalando dependencias...', 'cyan');
  
  const projects = ['backend', 'frontend'];
  
  projects.forEach(project => {
    log(`\n🔄 Instalando dependencias de ${project}...`, 'yellow');
    
    try {
      const result = require('child_process').execSync('npm install', {
        stdio: 'inherit',
        cwd: path.join(__dirname, project)
      });
      log(`✅ Dependencias de ${project} instaladas`, 'green');
    } catch (error) {
      log(`❌ Error instalando dependencias de ${project}`, 'red');
      return false;
    }
  });
  
  return true;
}

function startBackend() {
  log('\n🚀 Iniciando backend...', 'cyan');
  
  const backendProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'backend'),
    shell: true
  });
  
  backendProcess.on('error', (error) => {
    log(`❌ Error iniciando backend: ${error.message}`, 'red');
  });
  
  return backendProcess;
}

function startFrontend() {
  log('\n🚀 Iniciando frontend...', 'cyan');
  
  const frontendProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'frontend'),
    shell: true
  });
  
  frontendProcess.on('error', (error) => {
    log(`❌ Error iniciando frontend: ${error.message}`, 'red');
  });
  
  return frontendProcess;
}

function runDevScript() {
  log('\n🚀 Ejecutando script de desarrollo...', 'cyan');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  devProcess.on('error', (error) => {
    log(`❌ Error ejecutando script de desarrollo: ${error.message}`, 'red');
  });
  
  return devProcess;
}

function main() {
  log('\n🎯 EJECUTOR DE PROYECTO', 'bright');
  log('========================\n', 'bright');
  
  // Verificar configuración
  const envOk = checkEnvironment();
  
  if (!envOk) {
    log('\n❌ Configuración incompleta', 'red');
    log('Ejecuta primero: node configurar-variables-entorno.js', 'yellow');
    return;
  }
  
  // Instalar dependencias
  const depsOk = installDependencies();
  
  if (!depsOk) {
    log('\n❌ Error instalando dependencias', 'red');
    return;
  }
  
  log('\n🎉 Configuración verificada y dependencias instaladas', 'green');
  
  // Verificar si existe script de desarrollo
  const packageJsonPath = path.join(__dirname, 'package.json');
  let hasDevScript = false;
  
  if (checkFileExists(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      hasDevScript = packageJson.scripts && packageJson.scripts.dev;
    } catch (error) {
      // Ignorar error
    }
  }
  
  if (hasDevScript) {
    log('\n📋 Opciones de ejecución:', 'cyan');
    log('1. Ejecutar ambos servicios (recomendado): npm run dev', 'yellow');
    log('2. Ejecutar servicios por separado', 'yellow');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n¿Deseas ejecutar ambos servicios juntos? (y/n): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        log('\n🚀 Ejecutando ambos servicios...', 'cyan');
        const devProcess = runDevScript();
        
        devProcess.on('exit', (code) => {
          log(`\n📊 Proceso terminado con código: ${code}`, 'yellow');
        });
      } else {
        log('\n🚀 Ejecutando servicios por separado...', 'cyan');
        
        const backendProcess = startBackend();
        const frontendProcess = startFrontend();
        
        // Manejar terminación de procesos
        process.on('SIGINT', () => {
          log('\n🛑 Deteniendo servicios...', 'yellow');
          backendProcess.kill('SIGINT');
          frontendProcess.kill('SIGINT');
          process.exit(0);
        });
      }
    });
  } else {
    log('\n🚀 Ejecutando servicios por separado...', 'cyan');
    
    const backendProcess = startBackend();
    const frontendProcess = startFrontend();
    
    // Manejar terminación de procesos
    process.on('SIGINT', () => {
      log('\n🛑 Deteniendo servicios...', 'yellow');
      backendProcess.kill('SIGINT');
      frontendProcess.kill('SIGINT');
      process.exit(0);
    });
  }
  
  log('\n📖 Información:', 'bright');
  log('• Backend: http://localhost:3001', 'cyan');
  log('• Frontend: http://localhost:3000', 'cyan');
  log('• Para detener: Ctrl+C', 'yellow');
}

main().catch(console.error); 