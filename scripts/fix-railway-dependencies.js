#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 SOLUCIONANDO PROBLEMAS DE DEPENDENCIAS EN RAILWAY');
console.log('====================================================\n');

function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    const result = execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completado`);
    return result;
  } catch (error) {
    console.error(`❌ Error en: ${description}`);
    console.error(error.message);
    throw error;
  }
}

async function fixRailwayDependencies() {
  try {
    console.log('📋 PASO 1: Limpiando archivos de lock y node_modules...');
    
    // Eliminar archivos de lock y node_modules
    const filesToDelete = [
      'package-lock.json',
      'yarn.lock',
      'node_modules'
    ];
    
    filesToDelete.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          console.log(`🗑️  Eliminando directorio: ${file}`);
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          console.log(`🗑️  Eliminando archivo: ${file}`);
          fs.unlinkSync(filePath);
        }
      }
    });
    
    console.log('\n📋 PASO 2: Limpiando backend...');
    const backendPath = path.join(process.cwd(), 'backend');
    if (fs.existsSync(backendPath)) {
      const backendFilesToDelete = [
        'package-lock.json',
        'yarn.lock',
        'node_modules'
      ];
      
      backendFilesToDelete.forEach(file => {
        const filePath = path.join(backendPath, file);
        if (fs.existsSync(filePath)) {
          if (fs.lstatSync(filePath).isDirectory()) {
            console.log(`🗑️  Eliminando directorio backend/${file}`);
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            console.log(`🗑️  Eliminando archivo backend/${file}`);
            fs.unlinkSync(filePath);
          }
        }
      });
    }
    
    console.log('\n📋 PASO 3: Limpiando frontend...');
    const frontendPath = path.join(process.cwd(), 'frontend');
    if (fs.existsSync(frontendPath)) {
      const frontendFilesToDelete = [
        'package-lock.json',
        'yarn.lock',
        'node_modules'
      ];
      
      frontendFilesToDelete.forEach(file => {
        const filePath = path.join(frontendPath, file);
        if (fs.existsSync(filePath)) {
          if (fs.lstatSync(filePath).isDirectory()) {
            console.log(`🗑️  Eliminando directorio frontend/${file}`);
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            console.log(`🗑️  Eliminando archivo frontend/${file}`);
            fs.unlinkSync(filePath);
          }
        }
      });
    }
    
    console.log('\n📋 PASO 4: Instalando dependencias del backend...');
    runCommand('cd backend && npm install', 'Instalando dependencias del backend');
    
    console.log('\n📋 PASO 5: Instalando dependencias del frontend...');
    runCommand('cd frontend && npm install', 'Instalando dependencias del frontend');
    
    console.log('\n📋 PASO 6: Verificando estructura de archivos...');
    
    // Verificar que los archivos de lock se crearon correctamente
    const lockFiles = [
      'backend/package-lock.json',
      'frontend/package-lock.json'
    ];
    
    lockFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} existe`);
      } else {
        console.log(`❌ ${file} NO existe`);
      }
    });
    
    console.log('\n✅ ¡PROBLEMA DE DEPENDENCIAS SOLUCIONADO!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Hacer commit de los nuevos package-lock.json');
    console.log('2. Subir cambios a Railway');
    console.log('3. Verificar que el deployment funcione');
    
    console.log('\n🚀 COMANDOS PARA DESPLEGAR:');
    console.log('git add .');
    console.log('git commit -m "fix: actualizar dependencias para Railway"');
    console.log('git push origin main');
    
  } catch (error) {
    console.error('\n❌ ERROR SOLUCIONANDO DEPENDENCIAS:');
    console.error(error.message);
    console.log('\n🔧 SOLUCIONES ALTERNATIVAS:');
    console.log('1. Verificar que Node.js esté instalado correctamente');
    console.log('2. Verificar que npm esté actualizado');
    console.log('3. Intentar con yarn en lugar de npm');
  }
}

fixRailwayDependencies().catch(console.error); 