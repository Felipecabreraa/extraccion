#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Flujo de Trabajo Git para Ambiente de Prueba');

// Función para ejecutar comandos Git de forma segura
function runGitCommand(command, description) {
  try {
    console.log(`\n📋 ${description}...`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completado`);
    return result.trim();
  } catch (error) {
    console.error(`❌ Error en: ${description}`);
    console.error(`   Comando: ${command}`);
    console.error(`   Error: ${error.message}`);
    return null;
  }
}

// Función para mostrar información de ramas
function showBranchInfo() {
  console.log('\n📋 INFORMACIÓN DE RAMAS ACTUALES:');
  
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Rama actual: ${currentBranch}`);
    
    const allBranches = execSync('git branch', { encoding: 'utf8' }).trim();
    console.log('\n🌿 Ramas locales:');
    allBranches.split('\n').forEach(branch => {
      const cleanBranch = branch.replace('* ', '').trim();
      if (cleanBranch) {
        console.log(`   ${branch.includes('*') ? '🟢' : '  '} ${cleanBranch}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo información de ramas:', error.message);
  }
}

async function gitWorkflowPrueba() {
  try {
    console.log('\n🎯 FLUJO DE TRABAJO RECOMENDADO PARA PRUEBAS:\n');
    
    // Mostrar información actual
    showBranchInfo();
    
    console.log('\n📋 OPCIONES DISPONIBLES:\n');
    console.log('1. 🆕 Crear nueva rama de prueba');
    console.log('2. 🔄 Cambiar a rama existente');
    console.log('3. 💾 Guardar cambios actuales');
    console.log('4. 📤 Subir cambios al repositorio');
    console.log('5. 🔍 Ver estado actual');
    console.log('6. 🧪 Configurar ambiente de prueba');
    console.log('7. 🔙 Volver a main');
    
    console.log('\n📋 COMANDOS MANUALES ÚTILES:\n');
    console.log('🆕 Crear nueva rama:');
    console.log('   git checkout -b feature/nombre-funcionalidad');
    console.log('');
    console.log('🔄 Cambiar de rama:');
    console.log('   git checkout nombre-rama');
    console.log('');
    console.log('💾 Guardar cambios:');
    console.log('   git add .');
    console.log('   git commit -m "descripción de cambios"');
    console.log('');
    console.log('📤 Subir cambios:');
    console.log('   git push origin nombre-rama');
    console.log('');
    console.log('🔍 Ver estado:');
    console.log('   git status');
    console.log('   git log --oneline -5');
    
    console.log('\n⚠️  REGLAS IMPORTANTES:\n');
    console.log('✅ SIEMPRE trabajar en ramas separadas (no en main)');
    console.log('✅ Hacer commits frecuentes con mensajes descriptivos');
    console.log('✅ Probar cambios antes de hacer merge');
    console.log('✅ Usar ambiente de prueba para desarrollo');
    console.log('❌ NUNCA trabajar directamente en main');
    console.log('❌ NUNCA hacer merge sin probar');
    
    console.log('\n🎯 FLUJO RECOMENDADO:\n');
    console.log('1. Crear rama: git checkout -b feature/nueva-funcionalidad');
    console.log('2. Configurar prueba: node scripts/switch-to-test.js');
    console.log('3. Trabajar y hacer commits frecuentes');
    console.log('4. Probar cambios en ambiente de prueba');
    console.log('5. Subir rama: git push origin feature/nueva-funcionalidad');
    console.log('6. Crear Pull Request cuando esté listo');
    console.log('7. Hacer merge solo después de pruebas');
    
  } catch (error) {
    console.error('\n❌ Error en el flujo de trabajo:', error.message);
    process.exit(1);
  }
}

// Función para crear nueva rama de prueba
function createTestBranch(branchName) {
  console.log(`\n🆕 Creando rama de prueba: ${branchName}`);
  
  // Verificar que no estemos en main
  const currentBranch = runGitCommand('git branch --show-current', 'Obteniendo rama actual');
  if (currentBranch === 'main') {
    console.log('⚠️  ADVERTENCIA: Estás en la rama main');
    console.log('   Se recomienda crear una rama de desarrollo');
  }
  
  // Crear nueva rama
  const newBranch = runGitCommand(`git checkout -b ${branchName}`, `Creando rama ${branchName}`);
  if (newBranch) {
    console.log(`✅ Rama ${branchName} creada y activada`);
    
    // Configurar ambiente de prueba
    console.log('\n🧪 Configurando ambiente de prueba...');
    try {
      execSync('node scripts/switch-to-test.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  No se pudo configurar ambiente automáticamente');
      console.log('   Ejecuta manualmente: node scripts/switch-to-test.js');
    }
  }
}

// Función para guardar cambios
function saveChanges(commitMessage) {
  console.log('\n💾 Guardando cambios...');
  
  const status = runGitCommand('git status --porcelain', 'Verificando cambios');
  if (!status) {
    console.log('✅ No hay cambios para guardar');
    return;
  }
  
  console.log('📝 Cambios detectados:');
  console.log(status);
  
  // Agregar todos los cambios
  runGitCommand('git add .', 'Agregando cambios');
  
  // Hacer commit
  const commit = runGitCommand(`git commit -m "${commitMessage}"`, 'Haciendo commit');
  if (commit) {
    console.log('✅ Cambios guardados exitosamente');
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'create':
    const branchName = args[1] || 'feature/prueba-' + Date.now();
    createTestBranch(branchName);
    break;
    
  case 'save':
    const commitMessage = args[1] || 'Cambios en ambiente de prueba';
    saveChanges(commitMessage);
    break;
    
  default:
    gitWorkflowPrueba();
}

module.exports = { gitWorkflowPrueba, createTestBranch, saveChanges }; 