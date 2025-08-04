#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Estado de Git');

try {
  // Configurar Git para no usar pager
  execSync('git config --global core.pager cat', { stdio: 'ignore' });
  
  console.log('\n📋 RAMA ACTUAL:');
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 ${currentBranch}`);
  
  console.log('\n📋 TODAS LAS RAMAS:');
  const allBranches = execSync('git branch', { encoding: 'utf8' }).trim();
  allBranches.split('\n').forEach(branch => {
    const cleanBranch = branch.replace('* ', '').trim();
    if (cleanBranch) {
      console.log(`   ${branch.includes('*') ? '🟢' : '  '} ${cleanBranch}`);
    }
  });
  
  console.log('\n📋 ESTADO ACTUAL:');
  const status = execSync('git status --short', { encoding: 'utf8' }).trim();
  if (status) {
    console.log(status);
  } else {
    console.log('✅ No hay cambios pendientes');
  }
  
  console.log('\n📋 ÚLTIMOS COMMITS:');
  const log = execSync('git log --oneline -5', { encoding: 'utf8' }).trim();
  console.log(log);
  
} catch (error) {
  console.error('❌ Error obteniendo información de Git:', error.message);
} 