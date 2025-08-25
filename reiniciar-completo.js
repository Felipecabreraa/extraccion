const { exec } = require('child_process');

console.log('🔄 Reiniciando completamente el frontend...\n');

// Función para ejecutar comandos
function ejecutarComando(comando) {
  return new Promise((resolve, reject) => {
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error ejecutando: ${comando}`);
        console.error(error.message);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️  Advertencia: ${stderr}`);
      }
      console.log(`✅ Comando ejecutado: ${comando}`);
      resolve(stdout);
    });
  });
}

async function reiniciarCompleto() {
  try {
    // 1. Detener todos los procesos de Node.js
    console.log('1️⃣ Deteniendo todos los procesos de Node.js...');
    try {
      await ejecutarComando('taskkill /F /IM node.exe');
      console.log('✅ Procesos de Node.js detenidos');
    } catch (error) {
      console.log('⚠️  No se pudieron detener todos los procesos de Node.js');
    }

    // 2. Esperar un momento
    console.log('\n2️⃣ Esperando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Verificar que el puerto 3000 esté libre para el backend
    console.log('\n3️⃣ Verificando puerto 3000...');
    const puerto3000 = await ejecutarComando('netstat -ano | findstr :3000');
    if (puerto3000) {
      console.log('✅ Puerto 3000 está en uso (backend funcionando)');
    } else {
      console.log('❌ Puerto 3000 no está en uso. Inicia el backend primero.');
      return;
    }

    // 4. Iniciar el backend si no está ejecutándose
    console.log('\n4️⃣ Iniciando backend...');
    const backendProcess = exec('cd backend && npm start', {
      cwd: process.cwd()
    });

    backendProcess.stdout.on('data', (data) => {
      console.log('Backend:', data);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('Backend Error:', data);
    });

    // 5. Esperar a que el backend se inicie
    console.log('\n5️⃣ Esperando a que el backend se inicie...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. Iniciar el frontend
    console.log('\n6️⃣ Iniciando frontend...');
    const frontendProcess = exec('cd frontend && npm start', {
      cwd: process.cwd()
    });

    frontendProcess.stdout.on('data', (data) => {
      console.log('Frontend:', data);
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error('Frontend Error:', data);
    });

    console.log('\n🎉 Servicios iniciados:');
    console.log('   - Backend: http://localhost:3000');
    console.log('   - Frontend: http://localhost:3001');
    console.log('   - API: http://localhost:3000/api');
    console.log('\n📱 Ahora puedes probar el login sin errores 404');

  } catch (error) {
    console.error('❌ Error durante el reinicio:', error.message);
  }
}

reiniciarCompleto();
