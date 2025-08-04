#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURACIÓN PARA RAILWAY');
console.log('==========================================\n');

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: EXISTE`);
    return true;
  } else {
    console.log(`❌ ${description}: NO EXISTE`);
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
    console.log(`✅ ${description}: EXISTE`);
    return true;
  } else {
    console.log(`❌ ${description}: NO EXISTE`);
    return false;
  }
}

async function verifyRailwaySetup() {
  console.log('📋 VERIFICANDO ARCHIVOS CRÍTICOS:\n');

  // Verificar archivos críticos para Railway
  const criticalFiles = [
    { path: 'Procfile', desc: 'Procfile (configuración de Railway)' },
    { path: 'railway.json', desc: 'railway.json (configuración de Railway)' },
    { path: 'package.json', desc: 'package.json raíz' },
    { path: 'backend/package.json', desc: 'package.json del backend' },
    { path: 'backend/package-lock.json', desc: 'package-lock.json del backend' },
    { path: 'backend/src/app.js', desc: 'app.js del backend' },
    { path: 'railway.env', desc: 'Variables de entorno de Railway' }
  ];

  let criticalFilesOk = 0;
  criticalFiles.forEach(file => {
    if (checkFile(file.path, file.desc)) {
      criticalFilesOk++;
    }
  });

  console.log('\n📋 VERIFICANDO DIRECTORIOS:\n');
  
  const criticalDirs = [
    { path: 'backend', desc: 'Directorio backend' },
    { path: 'backend/src', desc: 'Directorio src del backend' },
    { path: 'backend/node_modules', desc: 'node_modules del backend' },
    { path: 'frontend', desc: 'Directorio frontend' }
  ];

  let criticalDirsOk = 0;
  criticalDirs.forEach(dir => {
    if (checkDirectory(dir.path, dir.desc)) {
      criticalDirsOk++;
    }
  });

  console.log('\n📋 VERIFICANDO CONTENIDO DE ARCHIVOS CRÍTICOS:\n');

  // Verificar contenido del Procfile
  if (fs.existsSync('Procfile')) {
    const procfileContent = fs.readFileSync('Procfile', 'utf8');
    console.log('📄 Contenido del Procfile:');
    console.log(procfileContent);
    
    if (procfileContent.includes('cd backend && npm start')) {
      console.log('✅ Procfile configurado correctamente para backend');
    } else {
      console.log('❌ Procfile NO está configurado para backend');
    }
  }

  // Verificar contenido del package.json raíz
  if (fs.existsSync('package.json')) {
    const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('\n📄 Scripts del package.json raíz:');
    console.log(JSON.stringify(packageContent.scripts, null, 2));
    
    if (packageContent.scripts.start && packageContent.scripts.start.includes('backend')) {
      console.log('✅ Script start configurado para backend');
    } else {
      console.log('❌ Script start NO está configurado para backend');
    }
  }

  // Verificar variables de entorno
  if (fs.existsSync('railway.env')) {
    console.log('\n📄 Variables de entorno en railway.env:');
    const envContent = fs.readFileSync('railway.env', 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    envLines.forEach(line => {
      if (line.includes('DB_') || line.includes('NODE_ENV') || line.includes('PORT')) {
        console.log(`   ${line}`);
      }
    });
  }

  console.log('\n🎯 RESUMEN DE VERIFICACIÓN:');
  console.log(`📁 Archivos críticos: ${criticalFilesOk}/${criticalFiles.length}`);
  console.log(`📂 Directorios críticos: ${criticalDirsOk}/${criticalDirs.length}`);

  if (criticalFilesOk === criticalFiles.length && criticalDirsOk === criticalDirs.length) {
    console.log('\n✅ ¡CONFIGURACIÓN COMPLETA PARA RAILWAY!');
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('1. Hacer commit de todos los cambios');
    console.log('2. Subir a Railway');
    console.log('3. Verificar deployment');
  } else {
    console.log('\n❌ HAY PROBLEMAS EN LA CONFIGURACIÓN');
    console.log('\n🔧 SOLUCIONES:');
    console.log('1. Instalar dependencias faltantes');
    console.log('2. Verificar archivos de configuración');
    console.log('3. Corregir rutas y scripts');
  }

  console.log('\n📋 COMANDOS PARA DESPLEGAR:');
  console.log('git add .');
  console.log('git commit -m "fix: actualizar configuración para Railway"');
  console.log('git push origin main');
}

verifyRailwaySetup().catch(console.error); 