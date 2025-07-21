const { spawn } = require('child_process');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function esperarServidor() {
  console.log('⏳ Esperando que el servidor esté listo...');
  
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
      console.log('✅ Servidor listo');
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('❌ Servidor no respondió en 30 segundos');
  return false;
}

async function probarOrdenamiento() {
  console.log('\n🧪 PROBANDO ORDENAMIENTO DESPUÉS DEL REINICIO\n');

  try {
    // 1. Login
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 2. Obtener máquinas y verificar ordenamiento
    console.log('\n2️⃣ Obteniendo máquinas ordenadas...');
    
    const maquinasResponse = await axios.get(`${BASE_URL}/maquinas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const maquinas = maquinasResponse.data;
    console.log(`✅ Se obtuvieron ${maquinas.length} máquinas`);

    // Mostrar las primeras 15 máquinas ordenadas
    console.log('\n📋 PRIMERAS 15 MÁQUINAS (ORDENADAS POR NÚMERO):');
    maquinas.slice(0, 15).forEach((maquina, index) => {
      console.log(`${index + 1}. Número: ${maquina.numero} | Marca: ${maquina.marca} | Modelo: ${maquina.modelo}`);
    });

    // Verificar si están ordenadas numéricamente
    console.log('\n🔍 VERIFICANDO ORDENAMIENTO NUMÉRICO...');
    let ordenCorrecto = true;
    let errores = [];
    
    for (let i = 1; i < Math.min(maquinas.length, 15); i++) {
      const numeroActual = parseInt(maquinas[i-1].numero);
      const numeroSiguiente = parseInt(maquinas[i].numero);
      
      if (!isNaN(numeroActual) && !isNaN(numeroSiguiente) && numeroActual > numeroSiguiente) {
        errores.push(`${maquinas[i-1].numero} > ${maquinas[i].numero}`);
        ordenCorrecto = false;
      }
    }

    if (ordenCorrecto) {
      console.log('✅ Las máquinas están ordenadas correctamente de menor a mayor');
    } else {
      console.log('❌ Las máquinas NO están ordenadas correctamente');
      console.log('Errores encontrados:', errores.slice(0, 5));
    }

    // 3. Mostrar estadísticas
    console.log('\n📊 ESTADÍSTICAS:');
    console.log(`Total de máquinas: ${maquinas.length}`);
    
    if (maquinas.length > 0) {
      const numeros = maquinas.map(m => parseInt(m.numero)).filter(n => !isNaN(n));
      if (numeros.length > 0) {
        console.log(`Número más bajo: ${Math.min(...numeros)}`);
        console.log(`Número más alto: ${Math.max(...numeros)}`);
      }
    }

  } catch (error) {
    console.log('❌ ERROR EN LA PRUEBA:');
    console.log('Error:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

async function reiniciarServidor() {
  console.log('🔄 REINICIANDO SERVIDOR PARA APLICAR CAMBIOS DE ORDENAMIENTO\n');

  // Detener procesos existentes
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
  console.log('\n2️⃣ Iniciando servidor con cambios de ordenamiento...');
  
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
    await probarOrdenamiento();
  }

  // Mantener el proceso ejecutándose
  server.on('close', (code) => {
    console.log(`\n❌ Servidor terminado con código ${code}`);
  });
}

reiniciarServidor(); 