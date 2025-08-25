const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando caché y reiniciando frontend...\n');

async function limpiarYReiniciar() {
  try {
    // 1. Detener procesos de Node.js
    console.log('1️⃣ Deteniendo procesos de Node.js...');
    await ejecutarComando('taskkill /F /IM node.exe');
    console.log('✅ Procesos detenidos');

    // 2. Limpiar caché de npm
    console.log('\n2️⃣ Limpiando caché de npm...');
    await ejecutarComando('npm cache clean --force');
    console.log('✅ Caché de npm limpiado');

    // 3. Eliminar node_modules y reinstalar
    console.log('\n3️⃣ Reinstalando dependencias...');
    if (fs.existsSync('node_modules')) {
      await ejecutarComando('rmdir /s /q node_modules');
      console.log('✅ node_modules eliminado');
    }
    
    await ejecutarComando('npm install');
    console.log('✅ Dependencias reinstaladas');

    // 4. Limpiar caché de React
    console.log('\n4️⃣ Limpiando caché de React...');
    if (fs.existsSync('build')) {
      await ejecutarComando('rmdir /s /q build');
      console.log('✅ Build eliminado');
    }

    // 5. Verificar configuración
    console.log('\n5️⃣ Verificando configuración...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('   - Script start:', packageJson.scripts.start);
    
    // Verificar que no hay espacios extra
    if (packageJson.scripts.start.includes('http://localhost:3001/api ')) {
      console.log('❌ PROBLEMA: Hay un espacio extra en la URL');
      console.log('   - Actual:', packageJson.scripts.start);
      console.log('   - Debería ser: "set PORT=3000 && set REACT_APP_API_URL=http://localhost:3001/api&& react-scripts start"');
    } else {
      console.log('✅ Configuración correcta');
    }

    // 6. Iniciar frontend
    console.log('\n6️⃣ Iniciando frontend...');
    console.log('🚀 Ejecutando: npm start');
    console.log('⏳ Espera unos segundos para que se inicie...');
    
    const child = exec('npm start', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error iniciando frontend:', error);
        return;
      }
      console.log('✅ Frontend iniciado correctamente');
    });

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    console.log('\n🎯 Instrucciones para el usuario:');
    console.log('1. Espera a que el frontend se inicie completamente');
    console.log('2. Abre http://localhost:3000 en tu navegador');
    console.log('3. Presiona Ctrl+Shift+R para forzar recarga sin caché');
    console.log('4. O abre una ventana de incógnito/privada');
    console.log('5. Intenta acceder al Generador PDF');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function ejecutarComando(comando) {
  return new Promise((resolve, reject) => {
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        // Ignorar errores de taskkill si no hay procesos
        if (comando.includes('taskkill') && error.code === 128) {
          resolve();
        } else {
          reject(error);
        }
      } else {
        resolve(stdout);
      }
    });
  });
}

limpiarYReiniciar();

