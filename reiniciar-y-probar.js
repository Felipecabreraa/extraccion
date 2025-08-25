const { spawn } = require('child_process');
const axios = require('axios');

// Configurar la URL base según el entorno
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function esperarServidor() {
  console.log('⏳ Esperando que el servidor esté listo...');
  
  for (let i = 0; i < 30; i++) {
    try {
      await api.get('/dashboard/danos/test-por-operador?year=2025');
      console.log('✅ Servidor listo');
      return true;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`⏳ Intento ${i + 1}/30 - Servidor no disponible aún...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('✅ Servidor respondiendo');
        return true;
      }
    }
  }
  
  console.log('❌ Servidor no disponible después de 30 intentos');
  return false;
}

async function probarEndpoints() {
  try {
    console.log('🔍 Probando endpoints después del reinicio...');
    
    const currentYear = new Date().getFullYear();
    
    // Probar endpoint original
    console.log(`\n📊 Probando endpoint original...`);
    const responseOriginal = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    console.log('✅ Endpoint original funciona');
    
    // Probar endpoint consolidado
    console.log(`\n📊 Probando endpoint consolidado...`);
    const responseConsolidado = await api.get(`/dashboard/danos/test-por-operador-consolidado?year=${currentYear}`);
    console.log('✅ Endpoint consolidado funciona');
    console.log(`   - Total daños: ${responseConsolidado.data.totalesAnuales?.totalDanos || 0}`);
    
    // Probar endpoint hembra
    console.log(`\n📊 Probando endpoint hembra...`);
    const responseHembra = await api.get(`/dashboard/danos/test-por-operador-hembra?year=${currentYear}`);
    console.log('✅ Endpoint hembra funciona');
    console.log(`   - Total daños: ${responseHembra.data.totalesAnuales?.totalDanos || 0}`);
    
    // Probar endpoint macho
    console.log(`\n📊 Probando endpoint macho...`);
    const responseMacho = await api.get(`/dashboard/danos/test-por-operador-macho?year=${currentYear}`);
    console.log('✅ Endpoint macho funciona');
    console.log(`   - Total daños: ${responseMacho.data.totalesAnuales?.totalDanos || 0}`);
    
    // Comparar resultados
    console.log(`\n📈 COMPARACIÓN:`);
    console.log(`   - Consolidado: ${responseConsolidado.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - Hembra: ${responseHembra.data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - Macho: ${responseMacho.data.totalesAnuales?.totalDanos || 0}`);
    
    const suma = (responseHembra.data.totalesAnuales?.totalDanos || 0) + (responseMacho.data.totalesAnuales?.totalDanos || 0);
    const consolidado = responseConsolidado.data.totalesAnuales?.totalDanos || 0;
    
    if (suma === consolidado) {
      console.log('✅ Los datos coinciden perfectamente');
    } else {
      console.log(`⚠️ Diferencia: ${consolidado - suma}`);
    }
    
    console.log('\n✅ Todos los endpoints funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error al probar endpoints:', error.message);
    
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando proceso de reinicio y prueba...');
  
  // Esperar a que el servidor esté listo
  const servidorListo = await esperarServidor();
  
  if (servidorListo) {
    // Probar endpoints
    await probarEndpoints();
  } else {
    console.log('❌ No se pudo conectar al servidor');
  }
}

// Ejecutar el proceso
main();



