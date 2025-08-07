#!/usr/bin/env node

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

// Configuración del frontend
const frontendConfig = {
  development: {
    REACT_APP_API_URL: 'http://localhost:3001/api',
    REACT_APP_ENV: 'development',
    REACT_APP_VERSION: '1.0.0-dev'
  },
  staging: {
    REACT_APP_API_URL: 'https://backend-staging.up.railway.app/api',
    REACT_APP_ENV: 'staging',
    REACT_APP_VERSION: '1.0.0-staging'
  },
  production: {
    REACT_APP_API_URL: 'https://backend-production.up.railway.app/api',
    REACT_APP_ENV: 'production',
    REACT_APP_VERSION: '1.0.0'
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

function main() {
  log('\n🚀 CONFIGURADOR DE FRONTEND', 'bright');
  log('============================\n', 'bright');
  
  log('Configurando archivos .env para el frontend...', 'cyan');
  
  // Crear archivos para cada ambiente
  for (const [env, config] of Object.entries(frontendConfig)) {
    log(`\n🔧 Configurando ambiente: ${env.toUpperCase()}`, 'magenta');
    
    const envPath = path.join('frontend', `.env.${env}`);
    const envExamplePath = path.join('frontend', `env.${env}.example`);
    
    createEnvFile(config, envPath, `${env} - Frontend`);
    
    // Crear ejemplo seguro
    const exampleConfig = Object.entries(config).map(([key, value]) => {
      if (key.includes('SECRET') || key.includes('PASSWORD')) {
        return `${key}=tu_${key.toLowerCase().replace(/_/g, '_')}_aqui`;
      }
      return `${key}=${value}`;
    }).join('\n');
    
    const exampleHeader = `# Ejemplo de configuración para ${env} - Frontend\n# Copia este archivo como .env y configura los valores\n\n`;
    
    try {
      fs.writeFileSync(envExamplePath, exampleHeader + exampleConfig);
      log(`✅ Archivo de ejemplo creado: ${envExamplePath}`, 'green');
    } catch (error) {
      log(`❌ Error al crear ${envExamplePath}: ${error.message}`, 'red');
    }
  }
  
  // Crear archivo .env principal (desarrollo por defecto)
  log('\n📝 Creando archivo .env principal...', 'cyan');
  const mainEnvPath = path.join('frontend', '.env');
  createEnvFile(frontendConfig.development, mainEnvPath, 'Frontend - Desarrollo (por defecto)');
  
  log('\n✅ CONFIGURACIÓN DE FRONTEND COMPLETADA', 'bright');
  log('========================================\n', 'bright');
  
  log('📋 Archivos creados:', 'cyan');
  log('  • frontend/.env (desarrollo)', 'green');
  log('  • frontend/.env.development', 'green');
  log('  • frontend/.env.staging', 'green');
  log('  • frontend/.env.production', 'green');
  log('  • frontend/env.*.example (ejemplos)', 'green');
  
  log('\n📖 INSTRUCCIONES:', 'bright');
  log('1. El archivo frontend/.env está configurado para desarrollo', 'cyan');
  log('2. Para cambiar ambiente: cp frontend/.env.production frontend/.env', 'cyan');
  log('3. Para ejecutar: cd frontend && npm start', 'cyan');
  
  log('\n🚀 Para ejecutar el proyecto completo:', 'bright');
  log('npm run dev', 'yellow');
  
  log('\n📁 Estructura de archivos:', 'cyan');
  log('frontend/', 'yellow');
  log('├── .env                    # Desarrollo (por defecto)', 'green');
  log('├── .env.development        # Desarrollo local', 'green');
  log('├── .env.staging           # Ambiente de pruebas', 'green');
  log('├── .env.production        # Producción', 'green');
  log('└── env.*.example          # Ejemplos seguros', 'green');
}

main().catch(console.error); 