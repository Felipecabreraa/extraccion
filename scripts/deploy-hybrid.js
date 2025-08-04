#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DESPLIEGUE HÍBRIDO: Vercel + Railway + trn.cl');
console.log('==================================================\n');

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

async function deployHybrid() {
  try {
    console.log('📋 PASO 1: Configurando para Railway (Backend)...');
    
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
frontend/
    `.trim();
    
    if (!fs.existsSync('.railwayignore')) {
      fs.writeFileSync('.railwayignore', railwayIgnore);
      console.log('✅ .railwayignore creado');
    }
    
    console.log('\n📋 PASO 2: Configurando variables de entorno para Railway...');
    
    // Crear archivo de variables para Railway
    const railwayEnv = `# Variables de entorno para Railway (Backend)
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
    
    console.log('\n📋 PASO 3: Configurando frontend para Vercel...');
    
    // Crear vercel.json para el frontend
    const vercelConfig = {
      "version": 2,
      "builds": [
        {
          "src": "frontend/package.json",
          "use": "@vercel/static-build",
          "config": {
            "distDir": "build"
          }
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "/api/$1"
        },
        {
          "src": "/(.*)",
          "dest": "/frontend/$1"
        }
      ],
      "env": {
        "REACT_APP_ENVIRONMENT": "production",
        "REACT_APP_API_URL": "https://tu-backend-railway.up.railway.app/api"
      }
    };
    
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.json creado');
    
    console.log('\n📋 PASO 4: Preparando backend para Railway...');
    
    // Cambiar a configuración de producción
    runCommand('node scripts/switch-to-production.js', 'Cambiando a producción');
    
    // Instalar dependencias del backend
    runCommand('cd backend && npm install --production', 'Instalando dependencias backend');
    
    console.log('\n📋 PASO 5: Preparando frontend para Vercel...');
    
    // Instalar dependencias del frontend
    runCommand('cd frontend && npm install', 'Instalando dependencias frontend');
    
    // Construir frontend
    runCommand('cd frontend && npm run build', 'Construyendo frontend');
    
    console.log('\n📋 PASO 6: Desplegando Backend a Railway...');
    console.log('⚠️  IMPORTANTE: Se abrirá el navegador para autenticación');
    console.log('   - Inicia sesión con tu cuenta de Railway');
    console.log('   - Confirma el despliegue');
    console.log('   - Configura las variables de entorno');
    
    // Verificar si Railway CLI está instalado
    try {
      execSync('npx @railway/cli --version', { stdio: 'pipe' });
      console.log('✅ Railway CLI detectado');
    } catch {
      console.log('📦 Instalando Railway CLI...');
      runCommand('npm install -g @railway/cli', 'Instalando Railway CLI');
    }
    
    // Desplegar backend a Railway
    runCommand('npx @railway/cli login', 'Iniciando sesión en Railway');
    runCommand('npx @railway/cli init', 'Inicializando proyecto Railway');
    runCommand('npx @railway/cli up', 'Desplegando backend a Railway');
    
    console.log('\n📋 PASO 7: Desplegando Frontend a Vercel...');
    console.log('⚠️  IMPORTANTE: Se abrirá el navegador para autenticación');
    console.log('   - Inicia sesión con tu cuenta de Vercel');
    console.log('   - Confirma el despliegue');
    
    // Verificar si Vercel CLI está instalado
    try {
      execSync('npx vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI detectado');
    } catch {
      console.log('📦 Instalando Vercel CLI...');
      runCommand('npm install -g vercel', 'Instalando Vercel CLI');
    }
    
    // Desplegar frontend a Vercel
    runCommand('cd frontend && npx vercel --prod', 'Desplegando frontend a Vercel');
    
    console.log('\n✅ ¡DESPLIEGUE HÍBRIDO COMPLETADO!');
    console.log('\n🌐 URLs de Producción:');
    console.log('   - Backend: [URL de Railway]');
    console.log('   - Frontend: [URL de Vercel]');
    console.log('   - Base de datos: trn.cl/trn_extraccion');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Copiar las URLs de Railway y Vercel');
    console.log('   2. Configurar variables de entorno en Railway');
    console.log('   3. Actualizar CORS_ORIGIN en Railway con la URL de Vercel');
    console.log('   4. Actualizar REACT_APP_API_URL en Vercel con la URL de Railway');
    console.log('   5. Probar conexiones');
    
    console.log('\n🔧 Configuración en Railway:');
    console.log('   1. Ir a tu proyecto en Railway');
    console.log('   2. Variables > Agregar variables');
    console.log('   3. Copiar contenido de railway.env');
    console.log('   4. Actualizar CORS_ORIGIN con la URL de Vercel');
    console.log('   5. Guardar y redeploy');
    
    console.log('\n🔧 Configuración en Vercel:');
    console.log('   1. Ir a tu proyecto en Vercel');
    console.log('   2. Settings > Environment Variables');
    console.log('   3. Actualizar REACT_APP_API_URL con la URL de Railway');
    console.log('   4. Redeploy');
    
    // Crear archivo de configuración final
    const hybridConfig = {
      deployment: {
        frontend: "vercel",
        backend: "railway",
        database: "trn.cl",
        updated: new Date().toISOString()
      },
      urls: {
        frontend: "[URL de Vercel]",
        backend: "[URL de Railway]",
        database: "trn.cl/trn_extraccion"
      },
      nextSteps: [
        "1. Configurar variables de entorno en Railway",
        "2. Configurar variables de entorno en Vercel",
        "3. Actualizar URLs en las configuraciones",
        "4. Probar conexiones",
        "5. Verificar que todo funcione"
      ]
    };
    
    fs.writeFileSync('hybrid-deployment.json', JSON.stringify(hybridConfig, null, 2));
    console.log('✅ hybrid-deployment.json creado');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL DESPLIEGUE:');
    console.error(error.message);
    console.log('\n🔧 Para solucionar:');
    console.log('   1. Verificar conexión a internet');
    console.log('   2. Verificar cuentas de Railway y Vercel');
    console.log('   3. Verificar configuración del proyecto');
    console.log('   4. Verificar que trn.cl esté accesible');
  }
}

deployHybrid(); 