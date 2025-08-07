#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Configuraciones por ambiente
const configs = {
  development: {
    backend: {
      NODE_ENV: 'development',
      PORT: '3001',
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_NAME: 'extraccion_dev',
      DB_USER: 'root',
      DB_PASSWORD: 'password',
      JWT_SECRET: 'dev_secret_key_2024',
      CORS_ORIGIN: 'http://localhost:3000',
      LOG_LEVEL: 'debug'
    },
    frontend: {
      REACT_APP_API_URL: 'http://localhost:3001/api',
      REACT_APP_ENV: 'development',
      REACT_APP_VERSION: '1.0.0-dev'
    }
  },
  staging: {
    backend: {
      NODE_ENV: 'staging',
      PORT: '3001',
      DB_HOST: 'trn.cl',
      DB_PORT: '3306',
      DB_NAME: 'trn_extraccion_test',
      DB_USER: 'trn_felipe',
      DB_PASSWORD: 'RioNegro2025@',
      JWT_SECRET: 'staging_secret_key_2024',
      CORS_ORIGIN: 'https://frontend-staging.vercel.app',
      LOG_LEVEL: 'info'
    },
    frontend: {
      REACT_APP_API_URL: 'https://backend-staging.up.railway.app/api',
      REACT_APP_ENV: 'staging',
      REACT_APP_VERSION: '1.0.0-staging'
    }
  },
  production: {
    backend: {
      NODE_ENV: 'production',
      PORT: '3000',
      DB_HOST: 'trn.cl',
      DB_PORT: '3306',
      DB_NAME: 'trn_extraccion',
      DB_USER: 'trn_felipe',
      DB_PASSWORD: 'RioNegro2025@',
      JWT_SECRET: 'extraccion_jwt_secret_2025_railway_production',
      JWT_EXPIRES_IN: '24h',
      CORS_ORIGIN: 'https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app',
      RATE_LIMIT_WINDOW_MS: '900000',
      RATE_LIMIT_MAX_REQUESTS: '100',
      LOG_LEVEL: 'info',
      HELMET_ENABLED: 'true',
      COMPRESSION_ENABLED: 'true'
    },
    frontend: {
      REACT_APP_API_URL: 'https://backend-production.up.railway.app/api',
      REACT_APP_ENV: 'production',
      REACT_APP_VERSION: '1.0.0'
    }
  }
};

function createEnvFile(config, filePath, description) {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const header = `# Configuración de ${description}\n# Generado automáticamente - ${new Date().toISOString()}\n\n`;
  
  try {
    fs.writeFileSync(filePath, header + envContent);
    log(`✅ Archivo creado: ${filePath}`, 'green');
  } catch (error) {
    log(`❌ Error al crear ${filePath}: ${error.message}`, 'red');
  }
}

function createEnvExample(config, filePath, description) {
  const envContent = Object.entries(config)
    .map(([key, value]) => {
      // Ocultar valores sensibles en los ejemplos
      if (key.includes('PASSWORD') || key.includes('SECRET')) {
        return `${key}=tu_${key.toLowerCase().replace(/_/g, '_')}_aqui`;
      }
      return `${key}=${value}`;
    })
    .join('\n');
  
  const header = `# Ejemplo de configuración para ${description}\n# Copia este archivo como .env y configura los valores\n\n`;
  
  try {
    fs.writeFileSync(filePath, header + envContent);
    log(`✅ Archivo de ejemplo creado: ${filePath}`, 'green');
  } catch (error) {
    log(`❌ Error al crear ${filePath}: ${error.message}`, 'red');
  }
}

async function main() {
  log('\n🚀 CONFIGURADOR DE VARIABLES DE ENTORNO', 'bright');
  log('==========================================\n', 'bright');
  
  log('Este script configurará las variables de entorno para todos los ambientes:', 'cyan');
  log('• Development (Desarrollo local)', 'yellow');
  log('• Staging (Pruebas)', 'yellow');
  log('• Production (Producción)', 'yellow');
  
  const confirm = await question('\n¿Deseas continuar? (y/n): ');
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    log('\n❌ Configuración cancelada', 'red');
    rl.close();
    return;
  }
  
  log('\n📁 Creando archivos de configuración...\n', 'cyan');
  
  // Crear archivos para cada ambiente
  for (const [env, config] of Object.entries(configs)) {
    log(`\n🔧 Configurando ambiente: ${env.toUpperCase()}`, 'magenta');
    
    // Backend
    const backendEnvPath = path.join('backend', `.env.${env}`);
    const backendEnvExamplePath = path.join('backend', `env.${env}.example`);
    createEnvFile(config.backend, backendEnvPath, `${env} - Backend`);
    createEnvExample(config.backend, backendEnvExamplePath, `${env} - Backend`);
    
    // Frontend
    const frontendEnvPath = path.join('frontend', `.env.${env}`);
    const frontendEnvExamplePath = path.join('frontend', `env.${env}.example`);
    createEnvFile(config.frontend, frontendEnvPath, `${env} - Frontend`);
    createEnvExample(config.frontend, frontendEnvExamplePath, `${env} - Frontend`);
  }
  
  // Crear archivos .env principales
  log('\n📝 Creando archivos .env principales...', 'cyan');
  
  // Backend .env (desarrollo por defecto)
  const backendEnvPath = path.join('backend', '.env');
  createEnvFile(configs.development.backend, backendEnvPath, 'Backend - Desarrollo (por defecto)');
  
  // Frontend .env (desarrollo por defecto)
  const frontendEnvPath = path.join('frontend', '.env');
  createEnvFile(configs.development.frontend, frontendEnvPath, 'Frontend - Desarrollo (por defecto)');
  
  // Crear archivo de configuración global
  log('\n🌐 Creando configuración global...', 'cyan');
  const globalConfigPath = '.env.global';
  const globalConfig = {
    PROJECT_NAME: 'extraccion',
    PROJECT_VERSION: '1.0.0',
    SUPPORT_EMAIL: 'soporte@extraccion.com',
    GITHUB_REPO: 'https://github.com/tu-usuario/extraccion'
  };
  createEnvFile(globalConfig, globalConfigPath, 'Global');
  
  log('\n✅ CONFIGURACIÓN COMPLETADA', 'bright');
  log('================================\n', 'bright');
  
  log('📋 Archivos creados:', 'cyan');
  log('Backend:', 'yellow');
  log('  • backend/.env (desarrollo)', 'green');
  log('  • backend/.env.development', 'green');
  log('  • backend/.env.staging', 'green');
  log('  • backend/.env.production', 'green');
  log('  • backend/env.*.example (ejemplos)', 'green');
  
  log('\nFrontend:', 'yellow');
  log('  • frontend/.env (desarrollo)', 'green');
  log('  • frontend/.env.development', 'green');
  log('  • frontend/.env.staging', 'green');
  log('  • frontend/.env.production', 'green');
  log('  • frontend/env.*.example (ejemplos)', 'green');
  
  log('\n🌐 Global:', 'yellow');
  log('  • .env.global', 'green');
  
  log('\n📖 INSTRUCCIONES:', 'bright');
  log('1. Revisa los archivos .env.*.example para ver ejemplos', 'cyan');
  log('2. Modifica los valores según tus necesidades', 'cyan');
  log('3. Para cambiar de ambiente, copia el archivo correspondiente:', 'cyan');
  log('   cp backend/.env.production backend/.env', 'yellow');
  log('   cp frontend/.env.production frontend/.env', 'yellow');
  
  log('\n🔒 SEGURIDAD:', 'bright');
  log('• Los archivos .env contienen información sensible', 'red');
  log('• Asegúrate de que estén en .gitignore', 'red');
  log('• Nunca subas archivos .env al repositorio', 'red');
  
  log('\n🚀 Para ejecutar el proyecto:', 'bright');
  log('Backend:  cd backend && npm start', 'yellow');
  log('Frontend: cd frontend && npm start', 'yellow');
  
  rl.close();
}

main().catch(console.error); 