#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureProductionUrls() {
  console.log('🌐 CONFIGURACIÓN DE URLs DE PRODUCCIÓN');
  console.log('=======================================\n');
  
  try {
    console.log('📋 Por favor, proporciona las URLs de tu hosting:\n');
    
    // Solicitar URLs
    const backendUrl = await question('🔗 URL del Backend (ej: https://api.tudominio.com): ');
    const frontendUrl = await question('🔗 URL del Frontend (ej: https://tudominio.com): ');
    
    if (!backendUrl || !frontendUrl) {
      console.log('❌ Error: Debes proporcionar ambas URLs');
      return;
    }
    
    console.log('\n📋 Configurando archivos de producción...');
    
    // Actualizar backend/env.production
    const backendEnvPath = 'backend/env.production';
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Actualizar CORS para incluir la URL del frontend
    backendEnv = backendEnv.replace(
      /CORS_ORIGIN=.*/,
      `CORS_ORIGIN=${frontendUrl}`
    );
    
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Backend env.production actualizado');
    
    // Actualizar frontend/env.production
    const frontendEnvPath = 'frontend/env.production';
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Actualizar API URL
    frontendEnv = frontendEnv.replace(
      /REACT_APP_API_URL=.*/,
      `REACT_APP_API_URL=${backendUrl}/api`
    );
    
    // Actualizar environment
    frontendEnv = frontendEnv.replace(
      /REACT_APP_ENVIRONMENT=.*/,
      'REACT_APP_ENVIRONMENT=production'
    );
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Frontend env.production actualizado');
    
    // Crear archivo de configuración de URLs
    const urlsConfig = {
      production: {
        backend: backendUrl,
        frontend: frontendUrl,
        database: 'trn.cl/trn_extraccion',
        updated: new Date().toISOString()
      },
      deployment: {
        backend: 'hosting-directo',
        frontend: 'vercel',
        instructions: [
          '1. Backend: Subir archivos a tu hosting',
          '2. Frontend: Desplegar con Vercel',
          '3. Configurar variables de entorno',
          '4. Probar conexiones'
        ]
      }
    };
    
    fs.writeFileSync('production-urls.json', JSON.stringify(urlsConfig, null, 2));
    console.log('✅ Archivo production-urls.json creado');
    
    console.log('\n✅ ¡CONFIGURACIÓN COMPLETADA!');
    console.log('\n🌐 URLs de Producción:');
    console.log(`   - Backend: ${backendUrl}`);
    console.log(`   - Frontend: ${frontendUrl}`);
    console.log('   - Base de datos: trn.cl/trn_extraccion');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: node scripts/deploy-production.js');
    console.log('   2. Subir backend a tu hosting');
    console.log('   3. Configurar variables de entorno en hosting');
    console.log('   4. Probar conexiones');
    
  } catch (error) {
    console.error('❌ Error configurando URLs:', error.message);
  } finally {
    rl.close();
  }
}

configureProductionUrls(); 