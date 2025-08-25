#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Instalando dependencias para generación de PDFs...\n');

// Colores para output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'green') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function warn(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

try {
  // Verificar si estamos en el directorio correcto
  if (!fs.existsSync('backend/package.json')) {
    error('No se encontró backend/package.json. Ejecuta este script desde la raíz del proyecto.');
    process.exit(1);
  }

  // Instalar dependencias del backend
  log('Instalando dependencias del backend...', 'blue');
  process.chdir('backend');
  
  try {
    execSync('npm install puppeteer handlebars', { stdio: 'inherit' });
    success('Dependencias del backend instaladas correctamente');
  } catch (err) {
    error('Error instalando dependencias del backend');
    console.error(err);
  }

  // Volver al directorio raíz
  process.chdir('..');

  // Verificar si existe frontend
  if (fs.existsSync('frontend/package.json')) {
    log('Verificando dependencias del frontend...', 'blue');
    process.chdir('frontend');
    
    // Verificar si ya tiene las dependencias necesarias
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasDatePickers = packageJson.dependencies && 
      (packageJson.dependencies['@mui/x-date-pickers'] || 
       packageJson.dependencies['@date-io/date-fns']);

    if (!hasDatePickers) {
      warn('El frontend necesita dependencias adicionales para los selectores de fecha');
      log('Instalando dependencias del frontend...', 'blue');
      try {
        execSync('npm install @mui/x-date-pickers @date-io/date-fns', { stdio: 'inherit' });
        success('Dependencias del frontend instaladas correctamente');
      } catch (err) {
        error('Error instalando dependencias del frontend');
        console.error(err);
      }
    } else {
      success('Frontend ya tiene las dependencias necesarias');
    }

    process.chdir('..');
  }

  // Crear directorio para reportes si no existe
  const reportsDir = path.join('backend', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    success('Directorio de reportes creado');
  }

  // Crear directorio para templates si no existe
  const templatesDir = path.join('backend', 'src', 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
    success('Directorio de templates creado');
  }

  log('\n🎉 Instalación completada exitosamente!', 'green');
  log('\n📋 Próximos pasos:', 'blue');
  log('1. Reinicia el servidor backend: npm run dev (desde backend/)');
  log('2. Reinicia el servidor frontend: npm start (desde frontend/)');
  log('3. Accede a /generador-pdf en tu aplicación');
  log('4. Prueba generar un informe de prueba primero');
  
  log('\n🔧 Características implementadas:', 'blue');
  log('• Generación de PDFs con Puppeteer');
  log('• Plantillas HTML con Handlebars');
  log('• Datos de metros superficie');
  log('• Datos de daños acumulados');
  log('• Datos por género (Hembra/Macho)');
  log('• Datos consolidados por operador');
  log('• Formato profesional A4');
  log('• Indicadores de estado con colores');

} catch (err) {
  error('Error durante la instalación:');
  console.error(err);
  process.exit(1);
}


