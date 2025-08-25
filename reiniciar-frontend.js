const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Reiniciando servidor de desarrollo del frontend...\n');

// Función para ejecutar comandos
function ejecutarComando(comando) {
  return new Promise((resolve, reject) => {
    exec(comando, { cwd: path.join(__dirname, 'frontend') }, (error, stdout, stderr) => {
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

// Función para verificar si el puerto está en uso
function verificarPuerto(puerto) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${puerto}`, (error, stdout) => {
      resolve(stdout.length > 0);
    });
  });
}

// Función para matar proceso en puerto
function matarProcesoEnPuerto(puerto) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${puerto}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[1].includes(`:${puerto}`)) {
            const pid = parts[4];
            console.log(`🛑 Matando proceso ${pid} en puerto ${puerto}...`);
            exec(`taskkill /F /PID ${pid}`, (killError) => {
              if (killError) {
                console.warn(`⚠️  No se pudo matar el proceso ${pid}: ${killError.message}`);
              } else {
                console.log(`✅ Proceso ${pid} terminado`);
              }
            });
          }
        }
      }
      resolve();
    });
  });
}

async function reiniciarFrontend() {
  try {
    // 1. Verificar configuración actual
    console.log('1️⃣ Verificando configuración actual...');
    const envPath = path.join(__dirname, 'frontend', 'env.development');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('📄 Contenido de env.development:');
      console.log(envContent);
    }

    // 2. Verificar si el puerto 3001 está en uso
    console.log('\n2️⃣ Verificando puerto 3001...');
    const puerto3001EnUso = await verificarPuerto(3001);
    if (puerto3001EnUso) {
      console.log('⚠️  Puerto 3001 está en uso. Deteniendo proceso...');
      await matarProcesoEnPuerto(3001);
      
      // Esperar un momento para que el proceso se termine
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 3. Verificar si el puerto 3000 está disponible para el backend
    console.log('\n3️⃣ Verificando puerto 3000 (backend)...');
    const puerto3000EnUso = await verificarPuerto(3000);
    if (puerto3000EnUso) {
      console.log('✅ Puerto 3000 está en uso (backend funcionando)');
    } else {
      console.log('❌ Puerto 3000 no está en uso. El backend no está ejecutándose.');
      console.log('🔧 Inicia el backend primero con: cd backend && npm start');
      return;
    }

    // 4. Instalar dependencias si es necesario
    console.log('\n4️⃣ Verificando dependencias...');
    const nodeModulesPath = path.join(__dirname, 'frontend', 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('📦 Instalando dependencias...');
      await ejecutarComando('npm install');
    } else {
      console.log('✅ Dependencias ya instaladas');
    }

    // 5. Iniciar servidor de desarrollo
    console.log('\n5️⃣ Iniciando servidor de desarrollo...');
    console.log('🚀 El servidor se iniciará en http://localhost:3000');
    console.log('📱 Presiona Ctrl+C para detener el servidor');
    
    // Iniciar el servidor de desarrollo
    const proceso = exec('npm start', { cwd: path.join(__dirname, 'frontend') });
    
    proceso.stdout.on('data', (data) => {
      console.log(data);
    });
    
    proceso.stderr.on('data', (data) => {
      console.error(data);
    });
    
    proceso.on('close', (code) => {
      console.log(`\n🔄 Servidor terminado con código ${code}`);
    });

  } catch (error) {
    console.error('❌ Error durante el reinicio:', error.message);
  }
}

reiniciarFrontend();
