#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Gestor de Ambientes con Git');

const environments = {
  production: {
    branch: 'main',
    description: 'Producción - Railway + Vercel',
    backend: 'Railway Production',
    frontend: 'Vercel Production',
    database: 'trn_extraccion'
  },
  develop: {
    branch: 'develop',
    description: 'Desarrollo - Local',
    backend: 'Localhost:3001',
    frontend: 'Localhost:3000',
    database: 'trn_extraccion'
  },
  test: {
    branch: 'test',
    description: 'Pruebas - Railway Test + Vercel Test',
    backend: 'Railway Test',
    frontend: 'Vercel Test',
    database: 'trn_extraccion_test'
  }
};

function showCurrentEnvironment() {
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const env = Object.entries(environments).find(([key, value]) => value.branch === currentBranch);
    
    if (env) {
      const [envKey, envConfig] = env;
      console.log(`\n🎯 Ambiente Actual: ${envKey.toUpperCase()}`);
      console.log(`📋 Descripción: ${envConfig.description}`);
      console.log(`🔧 Backend: ${envConfig.backend}`);
      console.log(`🌐 Frontend: ${envConfig.frontend}`);
      console.log(`🗄️ Base de Datos: ${envConfig.database}`);
    } else {
      console.log(`\n⚠️ Branch actual: ${currentBranch} (no configurado)`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo branch actual:', error.message);
  }
}

function switchEnvironment(targetEnv) {
  if (!environments[targetEnv]) {
    console.log('❌ Ambiente no válido. Opciones disponibles:');
    Object.keys(environments).forEach(env => {
      console.log(`   - ${env}: ${environments[env].description}`);
    });
    return;
  }

  try {
    const targetBranch = environments[targetEnv].branch;
    console.log(`\n🔄 Cambiando a ambiente: ${targetEnv.toUpperCase()}`);
    console.log(`📋 Branch: ${targetBranch}`);
    
    // Cambiar branch
    execSync(`git checkout ${targetBranch}`, { stdio: 'inherit' });
    
    // Configurar archivos .env
    if (targetEnv === 'production') {
      execSync('copy backend\\env.production backend\\.env', { stdio: 'inherit' });
      execSync('copy frontend\\env.production frontend\\.env', { stdio: 'inherit' });
    } else if (targetEnv === 'develop') {
      execSync('copy backend\\env.development backend\\.env', { stdio: 'inherit' });
      execSync('copy frontend\\env.development frontend\\.env', { stdio: 'inherit' });
    } else if (targetEnv === 'test') {
      execSync('copy backend\\env.test.production backend\\.env', { stdio: 'inherit' });
      execSync('copy frontend\\env.test.production frontend\\.env', { stdio: 'inherit' });
    }
    
    console.log(`\n✅ Ambiente ${targetEnv.toUpperCase()} configurado correctamente`);
    showCurrentEnvironment();
    
  } catch (error) {
    console.error(`❌ Error cambiando a ambiente ${targetEnv}:`, error.message);
  }
}

function showHelp() {
  console.log('\n📖 Uso del script:');
  console.log('   node scripts/git-switch-environments.js [ambiente]');
  console.log('\n🎯 Ambientes disponibles:');
  Object.entries(environments).forEach(([key, config]) => {
    console.log(`   ${key}: ${config.description}`);
  });
  console.log('\n💡 Ejemplos:');
  console.log('   node scripts/git-switch-environments.js production');
  console.log('   node scripts/git-switch-environments.js develop');
  console.log('   node scripts/git-switch-environments.js test');
}

// Ejecutar script
const targetEnv = process.argv[2];

if (!targetEnv) {
  showCurrentEnvironment();
  showHelp();
} else if (targetEnv === 'help' || targetEnv === '--help' || targetEnv === '-h') {
  showHelp();
} else {
  switchEnvironment(targetEnv);
} 