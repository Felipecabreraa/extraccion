#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 DESPLIEGUE A RENDER');
console.log('=======================\n');

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

async function deployToRender() {
  try {
    console.log('📋 PASO 1: Configurando para Render...');
    
    // Crear render.yaml si no existe
    const renderConfig = `services:
  - type: web
    name: extraccion-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DB_HOST
        value: trn.cl
      - key: DB_USER
        value: trn_felipe
      - key: DB_PASSWORD
        value: RioNegro2025@
      - key: DB_NAME
        value: trn_extraccion
      - key: DB_PORT
        value: 3306
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 24h
      - key: CORS_ORIGIN
        value: https://tu-frontend-vercel.vercel.app
      - key: LOG_LEVEL
        value: info
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 100
      - key: UPLOAD_MAX_SIZE
        value: 10485760
      - key: BCRYPT_ROUNDS
        value: 12
    `;
    
    if (!fs.existsSync('render.yaml')) {
      fs.writeFileSync('render.yaml', renderConfig);
      console.log('✅ render.yaml creado');
    }
    
    // Crear .renderignore si no existe
    const renderIgnore = `
# Archivos que no se suben a Render
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
    
    if (!fs.existsSync('.renderignore')) {
      fs.writeFileSync('.renderignore', renderIgnore);
      console.log('✅ .renderignore creado');
    }
    
    console.log('\n📋 PASO 2: Preparando backend...');
    
    // Cambiar a configuración de producción
    runCommand('node scripts/switch-to-production.js', 'Cambiando a producción');
    
    // Instalar dependencias
    runCommand('cd backend && npm install --production', 'Instalando dependencias');
    
    console.log('\n📋 PASO 3: Configurando Git para Render...');
    
    // Verificar que estamos en Git
    try {
      execSync('git status', { stdio: 'pipe' });
      console.log('✅ Repositorio Git detectado');
    } catch {
      console.log('📦 Inicializando Git...');
      runCommand('git init', 'Inicializando Git');
      runCommand('git add .', 'Agregando archivos');
      runCommand('git commit -m "feat: preparar para Render"', 'Haciendo commit');
    }
    
    console.log('\n📋 PASO 4: Instrucciones para Render...');
    console.log('🚀 Para desplegar a Render:');
    console.log('');
    console.log('1. Ve a https://render.com');
    console.log('2. Crea una cuenta gratuita');
    console.log('3. Conecta tu repositorio de GitHub');
    console.log('4. Selecciona este repositorio');
    console.log('5. Configura como "Web Service"');
    console.log('6. Usa estas configuraciones:');
    console.log('   - Build Command: cd backend && npm install');
    console.log('   - Start Command: cd backend && npm start');
    console.log('   - Environment: Node');
    console.log('7. Agrega las variables de entorno del archivo render.yaml');
    console.log('8. Deploy!');
    
    console.log('\n✅ ¡CONFIGURACIÓN PARA RENDER COMPLETADA!');
    console.log('\n📁 Archivos creados:');
    console.log('   - render.yaml (configuración)');
    console.log('   - .renderignore (archivos a ignorar)');
    
    console.log('\n🌐 URLs de Producción:');
    console.log('   - Backend: [URL de Render]');
    console.log('   - Frontend: [URL de Vercel]');
    console.log('   - Base de datos: trn.cl/trn_extraccion');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Crear cuenta en Render.com');
    console.log('   2. Conectar repositorio GitHub');
    console.log('   3. Configurar variables de entorno');
    console.log('   4. Deploy y obtener URL');
    console.log('   5. Actualizar frontend con la URL del backend');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA CONFIGURACIÓN:');
    console.error(error.message);
    console.log('\n🔧 Para solucionar:');
    console.log('   1. Verificar conexión a internet');
    console.log('   2. Verificar configuración de Git');
    console.log('   3. Verificar permisos de archivos');
  }
}

deployToRender(); 