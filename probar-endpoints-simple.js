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

async function probarEndpointsBasicos() {
  try {
    console.log('🔍 Probando endpoints básicos...');
    console.log('📡 URL base:', API_BASE_URL);
    
    const currentYear = new Date().getFullYear();
    
    // Probar endpoint original que sabemos que funciona
    console.log(`\n📊 Probando endpoint original...`);
    const responseOriginal = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    console.log('✅ Endpoint original funciona');
    
    // Probar nuevo endpoint consolidado
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
    
    console.log('\n✅ Todos los endpoints funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ No se puede conectar al servidor. Verifica que esté ejecutándose en el puerto 3001');
    }
  }
}

// Ejecutar la prueba
probarEndpointsBasicos();



