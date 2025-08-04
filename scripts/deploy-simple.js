#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 DESPLIEGUE SIMPLIFICADO: Vercel + Railway + trn.cl');
console.log('=======================================================\n');

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

async function deploySimple() {
  try {
    console.log('📋 PASO 1: Configurando archivos de despliegue...');
    
    // Crear railway.json
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
    
    fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
    console.log('✅ railway.json creado');
    
    // Crear .railwayignore
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
    
    fs.writeFileSync('.railwayignore', railwayIgnore);
    console.log('✅ .railwayignore creado');
    
    // Crear vercel.json
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
          "src": "/(.*)",
          "dest": "/frontend/$1"
        }
      ]
    };
    
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.json creado');
    
    console.log('\n📋 PASO 2: Configurando ambiente de producción...');
    runCommand('node scripts/switch-to-production.js', 'Cambiando a producción');
    
    console.log('\n📋 PASO 3: Instalando dependencias...');
    runCommand('cd backend && npm install', 'Instalando dependencias backend');
    runCommand('cd frontend && npm install', 'Instalando dependencias frontend');
    
    console.log('\n📋 PASO 4: Construyendo frontend...');
    console.log('⚠️  Configurando CI=false para evitar errores...');
    
    // Construir frontend con CI=false
    const buildCommand = process.platform === 'win32' 
      ? 'set CI=false && npm run build'
      : 'CI=false npm run build';
    
    runCommand(`cd frontend && ${buildCommand}`, 'Construyendo frontend');
    
    console.log('\n📋 PASO 5: Desplegando Backend a Railway...');
    console.log('⚠️  IMPORTANTE: Se abrirá el navegador para autenticación');
    console.log('   - Inicia sesión con tu cuenta de Railway');
    console.log('   - Confirma el despliegue');
    console.log('   - Configura las variables de entorno');
    
    // Verificar Railway CLI
    try {
      execSync('npx @railway/cli --version', { stdio: 'pipe' });
      console.log('✅ Railway CLI detectado');
    } catch {
      console.log('📦 Instalando Railway CLI...');
      runCommand('npm install -g @railway/cli', 'Instalando Railway CLI');
    }
    
    // Desplegar backend
    runCommand('npx @railway/cli login', 'Iniciando sesión en Railway');
    runCommand('npx @railway/cli init', 'Inicializando proyecto Railway');
    runCommand('npx @railway/cli up', 'Desplegando backend a Railway');
    
    console.log('\n📋 PASO 6: Desplegando Frontend a Vercel...');
    console.log('⚠️  IMPORTANTE: Se abrirá el navegador para autenticación');
    console.log('   - Inicia sesión con tu cuenta de Vercel');
    console.log('   - Confirma el despliegue');
    
    // Verificar Vercel CLI
    try {
      execSync('npx vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI detectado');
    } catch {
      console.log('📦 Instalando Vercel CLI...');
      runCommand('npm install -g vercel', 'Instalando Vercel CLI');
    }
    
    // Desplegar frontend
    runCommand('cd frontend && npx vercel --prod', 'Desplegando frontend a Vercel');
    
    console.log('\n✅ ¡DESPLIEGUE COMPLETADO!');
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
    
    // Crear archivo de configuración
    const config = {
      deployment: {
        frontend: "vercel",
        backend: "railway", 
        database: "trn.cl",
        production_db: "trn_extraccion",
        test_db: "trn_extraccion_test",
        updated: new Date().toISOString()
      },
      variables: {
        DB_HOST: "trn.cl",
        DB_USER: "trn_felipe", 
        DB_PASSWORD: "RioNegro2025@",
        DB_NAME: "trn_extraccion",
        DB_PORT: "3306"
      }
    };
    
    fs.writeFileSync('deployment-config.json', JSON.stringify(config, null, 2));
    console.log('✅ deployment-config.json creado');
    
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

deploySimple(); 