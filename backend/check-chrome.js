const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function checkChrome() {
  console.log('🔍 Verificando navegadores disponibles...');
  
  const possiblePaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/chrome',
    '/opt/google/chrome/chrome',
    '/usr/bin/google-chrome-stable'
  ];
  
  console.log('📂 Verificando rutas de Chrome:');
  for (const chromePath of possiblePaths) {
    try {
      if (fs.existsSync(chromePath)) {
        console.log(`   ✅ ${chromePath} - EXISTE`);
        
        // Verificar si es ejecutable
        try {
          fs.accessSync(chromePath, fs.constants.X_OK);
          console.log(`   ✅ ${chromePath} - ES EJECUTABLE`);
        } catch (error) {
          console.log(`   ❌ ${chromePath} - NO ES EJECUTABLE`);
        }
      } else {
        console.log(`   ❌ ${chromePath} - NO EXISTE`);
      }
    } catch (error) {
      console.log(`   ❌ ${chromePath} - ERROR: ${error.message}`);
    }
  }
  
  // Verificar con comandos del sistema
  console.log('\n🔧 Verificando con comandos del sistema:');
  
  const commands = [
    'which google-chrome',
    'which chromium-browser',
    'which chromium',
    'which chrome',
    'google-chrome --version',
    'chromium-browser --version'
  ];
  
  for (const command of commands) {
    try {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`   ❌ ${command}: ${error.message}`);
        } else {
          console.log(`   ✅ ${command}: ${stdout.trim()}`);
        }
      });
    } catch (error) {
      console.log(`   ❌ ${command}: ${error.message}`);
    }
  }
  
  // Verificar variables de entorno
  console.log('\n🌍 Variables de entorno Puppeteer:');
  console.log(`   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: ${process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD}`);
  console.log(`   PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  console.log(`   PUPPETEER_CACHE_DIR: ${process.env.PUPPETEER_CACHE_DIR}`);
  
  // Verificar directorio de node_modules
  console.log('\n📦 Verificando Puppeteer instalado:');
  const puppeteerPath = path.join(__dirname, 'node_modules', 'puppeteer');
  if (fs.existsSync(puppeteerPath)) {
    console.log('   ✅ Puppeteer está instalado');
    
    // Verificar si tiene Chrome descargado
    const chromePath = path.join(puppeteerPath, '.local-chromium');
    if (fs.existsSync(chromePath)) {
      console.log('   ✅ Chrome local encontrado en Puppeteer');
    } else {
      console.log('   ❌ Chrome local NO encontrado en Puppeteer');
    }
  } else {
    console.log('   ❌ Puppeteer NO está instalado');
  }
}

checkChrome();
