const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 SOLUCIONANDO PROBLEMA ESPECÍFICO DE ZONAS...\n');

try {
  // 1. Verificar si el servidor está funcionando
  console.log('🔍 1. Verificando estado del servidor...');
  try {
    const response = execSync('curl -s http://localhost:3001/api/health', { encoding: 'utf8' });
    console.log('✅ Servidor backend está funcionando');
  } catch (error) {
    console.log('❌ Servidor backend NO está funcionando');
    console.log('   Ejecuta: cd backend && npm start');
  }

  // 2. Verificar migración de zonas
  console.log('\n🗄️  2. Verificando migración de zonas...');
  const migrationFile = path.join(__dirname, '../migrations/20250103130000-add-tipo-to-zona.js');
  if (fs.existsSync(migrationFile)) {
    console.log('✅ Archivo de migración existe');
  } else {
    console.log('❌ Archivo de migración no encontrado');
  }

  // 3. Verificar modelo de zona
  console.log('\n📋 3. Verificando modelo de zona...');
  const zonaModelFile = path.join(__dirname, '../src/models/zona.js');
  if (fs.existsSync(zonaModelFile)) {
    const content = fs.readFileSync(zonaModelFile, 'utf8');
    if (content.includes('tipo')) {
      console.log('✅ Modelo de zona incluye campo tipo');
    } else {
      console.log('❌ Modelo de zona NO incluye campo tipo');
    }
  } else {
    console.log('❌ Archivo de modelo de zona no encontrado');
  }

  // 4. Verificar controlador de zona
  console.log('\n🎮 4. Verificando controlador de zona...');
  const zonaControllerFile = path.join(__dirname, '../src/controllers/zonaController.js');
  if (fs.existsSync(zonaControllerFile)) {
    const content = fs.readFileSync(zonaControllerFile, 'utf8');
    if (content.includes('estadisticasPorTipo')) {
      console.log('✅ Controlador incluye función estadisticasPorTipo');
    } else {
      console.log('❌ Controlador NO incluye función estadisticasPorTipo');
    }
  } else {
    console.log('❌ Archivo de controlador de zona no encontrado');
  }

  // 5. Verificar rutas de zona
  console.log('\n🛣️  5. Verificando rutas de zona...');
  const zonaRoutesFile = path.join(__dirname, '../src/routes/zonaRoutes.js');
  if (fs.existsSync(zonaRoutesFile)) {
    const content = fs.readFileSync(zonaRoutesFile, 'utf8');
    if (content.includes('estadisticas-tipo')) {
      console.log('✅ Rutas incluyen endpoint estadisticas-tipo');
    } else {
      console.log('❌ Rutas NO incluyen endpoint estadisticas-tipo');
    }
  } else {
    console.log('❌ Archivo de rutas de zona no encontrado');
  }

  // 6. Verificar archivo .env
  console.log('\n⚙️  6. Verificando configuración...');
  const envFile = path.join(__dirname, '../.env');
  if (fs.existsSync(envFile)) {
    console.log('✅ Archivo .env existe');
    const envContent = fs.readFileSync(envFile, 'utf8');
    if (envContent.includes('DB_NAME')) {
      console.log('✅ Configuración de base de datos presente');
    } else {
      console.log('❌ Configuración de base de datos faltante');
    }
  } else {
    console.log('❌ Archivo .env no encontrado');
  }

  console.log('\n🎯 SOLUCIÓN PASO A PASO:');
  console.log('\n1. 🚀 INICIAR SERVIDOR BACKEND:');
  console.log('   cd backend');
  console.log('   npm start');
  
  console.log('\n2. 🗄️  EJECUTAR MIGRACIÓN:');
  console.log('   # En otra terminal, desde el directorio backend:');
  console.log('   npx sequelize-cli db:migrate');
  
  console.log('\n3. 🔄 ACTUALIZAR ZONAS EXISTENTES:');
  console.log('   node scripts/update_zonas_tipo.js');
  
  console.log('\n4. 🌐 VERIFICAR EN NAVEGADOR:');
  console.log('   - Ir a http://localhost:3000');
  console.log('   - Hacer login');
  console.log('   - Ir a la página de Zonas');
  console.log('   - Verificar que no hay errores en la consola');
  
  console.log('\n5. 🔍 VERIFICAR ENDPOINT:');
  console.log('   # Probar directamente el endpoint:');
  console.log('   curl -H "Authorization: Bearer TU_TOKEN" http://localhost:3001/api/zonas/estadisticas-tipo');

  console.log('\n✅ Diagnóstico completado');

} catch (error) {
  console.error('❌ Error en el diagnóstico:', error.message);
  process.exit(1);
} 