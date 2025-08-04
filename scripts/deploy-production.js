#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO DESPLIEGUE A PRODUCCIÓN');
console.log('=====================================\n');

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

async function deployToProduction() {
  try {
    console.log('📋 PASO 1: Configurando ambiente de producción...');
    
    // Cambiar a configuración de producción
    runCommand('node scripts/switch-to-production.js', 'Cambiando a configuración de producción');
    
    console.log('\n📋 PASO 2: Verificando configuración de producción...');
    runCommand('node scripts/verify-environments.js', 'Verificando configuración');
    
    console.log('\n📋 PASO 3: Instalando dependencias del backend...');
    runCommand('cd backend && npm install --production', 'Instalando dependencias backend');
    
    console.log('\n📋 PASO 4: Instalando dependencias del frontend...');
    runCommand('cd frontend && npm install', 'Instalando dependencias frontend');
    
    console.log('\n📋 PASO 5: Construyendo frontend para producción...');
    runCommand('cd frontend && npm run build', 'Construyendo frontend');
    
    console.log('\n📋 PASO 6: Desplegando frontend a Vercel...');
    
    // Verificar si Vercel CLI está instalado
    try {
      execSync('npx vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI detectado');
    } catch {
      console.log('📦 Instalando Vercel CLI...');
      runCommand('npm install -g vercel', 'Instalando Vercel CLI');
    }
    
    // Desplegar a Vercel
    console.log('🚀 Desplegando frontend a Vercel...');
    console.log('⚠️  IMPORTANTE: Se abrirá el navegador para autenticación');
    console.log('   - Inicia sesión con tu cuenta de Vercel');
    console.log('   - Confirma el despliegue');
    
    runCommand('cd frontend && npx vercel --prod', 'Desplegando frontend a Vercel');
    
    console.log('\n📋 PASO 7: Configurando backend para hosting...');
    
    // Crear archivo de configuración para hosting
    const hostingConfig = {
      backend: {
        port: process.env.PORT || 3001,
        database: {
          host: 'trn.cl',
          port: 3306,
          user: 'trn_felipe',
          password: 'RioNegro2025@',
          database: 'trn_extraccion'
        }
      },
      deployment: {
        type: 'hosting-directo',
        instructions: [
          '1. Subir archivos del backend a tu hosting',
          '2. Configurar variables de entorno en el hosting',
          '3. Instalar dependencias: npm install --production',
          '4. Iniciar servidor: npm start'
        ]
      }
    };
    
    fs.writeFileSync('backend/hosting-config.json', JSON.stringify(hostingConfig, null, 2));
    console.log('✅ Archivo de configuración para hosting creado');
    
    console.log('\n✅ ¡DESPLIEGUE DE PRODUCCIÓN COMPLETADO!');
    console.log('\n🌐 URLs de Producción:');
    console.log('   - Backend: [Tu hosting]');
    console.log('   - Frontend: [URL de Vercel]');
    console.log('   - Base de datos: trn.cl/trn_extraccion');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Subir archivos del backend a tu hosting');
    console.log('   2. Configurar variables de entorno en el hosting');
    console.log('   3. Actualizar URLs en frontend/env.production');
    console.log('   4. Probar conexión a la base de datos');
    
    console.log('\n📁 Archivos para hosting:');
    console.log('   - backend/ (carpeta completa)');
    console.log('   - backend/hosting-config.json (configuración)');
    console.log('   - backend/.env (variables de entorno)');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL DESPLIEGUE:');
    console.error(error.message);
    console.log('\n🔧 Para solucionar:');
    console.log('   1. Verificar conexión a internet');
    console.log('   2. Verificar credenciales de Vercel');
    console.log('   3. Verificar configuración de hosting');
  }
}

deployToProduction(); 