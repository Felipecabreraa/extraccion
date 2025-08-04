#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚂 DESPLIEGUE A RAILWAY');
console.log('========================\n');

function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    const result = execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completado`);
    return result;
  } catch (error) {
    console.error(`❌ Error en: ${description}`);
    console.error(error.message);
    throw error;
  }
}

async function deployToRailway() {
  try {
    console.log('📋 PASO 1: Verificando Railway CLI...');
    
    // Verificar si Railway CLI está instalado
    try {
      execSync('npx @railway/cli --version', { stdio: 'pipe' });
      console.log('✅ Railway CLI detectado');
    } catch {
      console.log('📦 Instalando Railway CLI...');
      runCommand('npm install -g @railway/cli', 'Instalando Railway CLI');
    }
    
    console.log('\n📋 PASO 2: Configurando para Railway...');
    
    // Crear railway.json si no existe
    const railwayConfig = {
      "$schema": "https://railway.app/railway.schema.json",
      "build": {
        "builder": "NIXPACKS"
      },
      "deploy": {
        "numReplicas": 1,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
      }
    };
    
    if (!fs.existsSync('railway.json')) {
      fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
      console.log('✅ railway.json creado');
    }
    
    // Crear .railwayignore si no existe
    const railwayIgnore = `
# Archivos que no se suben a Railway
node_modules/
.env
.env.local
.env.development
.env.test
.env.production
logs/
uploads/
*.log
.DS_Store
    `.trim();
    
    if (!fs.existsSync('.railwayignore')) {
      fs.writeFileSync('.railwayignore', railwayIgnore);
      console.log('✅ .railwayignore creado');
    }
    
    console.log('\n📋 PASO 3: Configurando variables de entorno...');
    
    // Crear archivo de variables para Railway
    const railwayEnv = `# Variables de entorno para Railway
NODE_ENV=production
PORT=3001
DB_HOST=trn.cl
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@
DB_NAME=trn_extraccion
DB_PORT=3306

JWT_SECRET=tu-jwt-secret-produccion-muy-seguro
JWT_EXPIRES_IN=24h

CORS_ORIGIN=https://tu-frontend-vercel.vercel.app

LOG_LEVEL=info
LOG_FILE=logs/production.log

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=uploads/

BCRYPT_ROUNDS=12
    `.trim();
    
    fs.writeFileSync('railway.env', railwayEnv);
    console.log('✅ railway.env creado');
    
    console.log('\n📋 PASO 4: Preparando backend...');
    
    // Cambiar a configuración de producción
    runCommand('node scripts/switch-to-production.js', 'Cambiando a producción');
    
    // Instalar dependencias
    runCommand('cd backend && npm install --production', 'Instalando dependencias');
    
    console.log('\n📋 PASO 5: Iniciando despliegue a Railway...');
    console.log('⚠️  IMPORTANTE: Se abrirá el navegador para autenticación');
    console.log('   - Inicia sesión con tu cuenta de Railway');
    console.log('   - Confirma el despliegue');
    console.log('   - Configura las variables de entorno');
    
    // Desplegar a Railway
    runCommand('npx @railway/cli login', 'Iniciando sesión en Railway');
    runCommand('npx @railway/cli init', 'Inicializando proyecto Railway');
    runCommand('npx @railway/cli up', 'Desplegando a Railway');
    
    console.log('\n✅ ¡DESPLIEGUE A RAILWAY COMPLETADO!');
    console.log('\n🌐 URLs de Producción:');
    console.log('   - Backend: [URL de Railway]');
    console.log('   - Frontend: [URL de Vercel]');
    console.log('   - Base de datos: trn.cl/trn_extraccion');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Copiar la URL de Railway');
    console.log('   2. Configurar variables de entorno en Railway');
    console.log('   3. Actualizar frontend con la URL del backend');
    console.log('   4. Probar conexiones');
    
    console.log('\n🔧 Configuración en Railway:');
    console.log('   1. Ir a tu proyecto en Railway');
    console.log('   2. Variables > Agregar variables');
    console.log('   3. Copiar contenido de railway.env');
    console.log('   4. Guardar y redeploy');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL DESPLIEGUE:');
    console.error(error.message);
    console.log('\n🔧 Para solucionar:');
    console.log('   1. Verificar conexión a internet');
    console.log('   2. Verificar cuenta de Railway');
    console.log('   3. Verificar configuración del proyecto');
  }
}

deployToRailway(); 