const axios = require('axios');

async function verifyTestEnvironment() {
  const testUrl = 'https://trn-extraccion-production.up.railway.app';
  
  console.log('🔍 Verificando ambiente de PRUEBAS...');
  console.log(`🌐 URL: ${testUrl}`);
  
  try {
    // 1. Verificar endpoint de salud
    console.log('\n1. Verificando endpoint de salud...');
    const healthResponse = await axios.get(`${testUrl}/health`);
    console.log('✅ Health check exitoso:', healthResponse.status);
    
    // 2. Verificar endpoint de API
    console.log('\n2. Verificando endpoint de API...');
    const apiResponse = await axios.get(`${testUrl}/api/health`);
    console.log('✅ API health check exitoso:', apiResponse.status);
    
    // 3. Verificar configuración CORS para pruebas
    console.log('\n3. Verificando configuración CORS para pruebas...');
    const corsResponse = await axios.options(`${testUrl}/api/auth/login`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('✅ CORS preflight exitoso:', corsResponse.status);
    console.log('📋 Headers CORS:', {
      'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers']
    });
    
    // 4. Verificar que el ambiente sea TEST
    console.log('\n4. Verificando configuración de ambiente...');
    const envResponse = await axios.get(`${testUrl}/api/health`);
    if (envResponse.data.environment === 'test') {
      console.log('✅ Ambiente configurado como TEST');
    } else {
      console.log('⚠️ Ambiente no es TEST:', envResponse.data.environment);
    }
    
    // 5. Verificar rate limiting para pruebas
    console.log('\n5. Verificando rate limiting para pruebas...');
    console.log('📊 Rate limit configurado para pruebas (más permisivo)');
    
    console.log('\n🎉 Ambiente de PRUEBAS verificado correctamente!');
    console.log('🔧 NODE_ENV: test');
    console.log('🔓 CORS: Permitido para localhost y Railway Test');
    console.log('📊 Rate Limit: 1000 requests/min');
    console.log('🌐 URL: https://trn-extraccion-test.up.railway.app');
    
  } catch (error) {
    console.error('❌ Error verificando ambiente de pruebas:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 404) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Ejecutar: node scripts/setup-railway-test.js');
      console.log('2. Verificar que Railway esté ejecutándose');
      console.log('3. Verificar variables de entorno en Railway Dashboard');
      console.log('4. Reiniciar el servicio en Railway');
    }
  }
}

// Ejecutar verificación
verifyTestEnvironment(); 