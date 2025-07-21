const { spawn } = require('child_process');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function esperarServidor() {
  console.log('⏳ Esperando que el servidor esté listo...');
  
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(`${BASE_URL}/health`);
      console.log('✅ Servidor listo');
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('❌ Servidor no respondió en 30 segundos');
  return false;
}

async function verificarRutas() {
  console.log('\n🔍 VERIFICANDO RUTAS DESPUÉS DEL REINICIO\n');

  try {
    // 1. Verificar ruta de carga masiva
    console.log('1️⃣ Verificando ruta /maquinas/carga-masiva...');
    
    try {
      const response = await axios.post(`${BASE_URL}/maquinas/carga-masiva`, {
        maquinas: []
      });
      console.log('✅ Ruta funcionando correctamente');
      console.log('Status:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Ruta encontrada (necesita autenticación)');
        console.log('Status:', error.response.status);
      } else {
        console.log('❌ Error en la ruta:');
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
      }
    }

    // 2. Verificar ruta de máquinas
    console.log('\n2️⃣ Verificando ruta /maquinas...');
    
    try {
      const response = await axios.get(`${BASE_URL}/maquinas`);
      console.log('✅ Ruta funcionando correctamente');
      console.log('Status:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Ruta encontrada (necesita autenticación)');
        console.log('Status:', error.response.status);
      } else {
        console.log('❌ Error en la ruta:');
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
      }
    }

  } catch (error) {
    console.log('❌ Error verificando rutas:', error.message);
  }
}

async function reiniciarServidor() {
  console.log('🔄 REINICIANDO SERVIDOR\n');

  // Detener procesos existentes en el puerto 3001
  console.log('1️⃣ Deteniendo procesos existentes...');
  
  const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe'], { 
    stdio: 'pipe',
    shell: true 
  });

  await new Promise((resolve) => {
    killProcess.on('close', () => {
      console.log('✅ Procesos detenidos');
      resolve();
    });
  });

  // Esperar un momento
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Iniciar el servidor
  console.log('\n2️⃣ Iniciando servidor...');
  
  const server = spawn('node', ['src/app.js'], {
    stdio: 'pipe',
    shell: true
  });

  server.stdout.on('data', (data) => {
    console.log(`📤 ${data.toString().trim()}`);
  });

  server.stderr.on('data', (data) => {
    console.log(`📤 ERROR: ${data.toString().trim()}`);
  });

  // Esperar a que el servidor esté listo
  const servidorListo = await esperarServidor();
  
  if (servidorListo) {
    await verificarRutas();
  }

  // Mantener el proceso ejecutándose
  server.on('close', (code) => {
    console.log(`\n❌ Servidor terminado con código ${code}`);
  });
}

reiniciarServidor(); 