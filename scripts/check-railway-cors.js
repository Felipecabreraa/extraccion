const axios = require('axios');

async function checkRailwayCORS() {
  const railwayUrl = 'https://trn-extraccion-test.up.railway.app';
  
  console.log('🔍 Verificando configuración CORS en Railway...');
  console.log(`🌐 URL: ${railwayUrl}`);
  
  try {
    // Verificar endpoint de salud
    console.log('\n1. Verificando endpoint de salud...');
    const healthResponse = await axios.get(`${railwayUrl}/health`);
    console.log('✅ Health check exitoso:', healthResponse.status);
    
    // Verificar endpoint de API
    console.log('\n2. Verificando endpoint de API...');
    const apiResponse = await axios.get(`${railwayUrl}/api/health`);
    console.log('✅ API health check exitoso:', apiResponse.status);
    
    // Verificar CORS con preflight
    console.log('\n3. Verificando configuración CORS...');
    const corsResponse = await axios.options(`${railwayUrl}/api/auth/login`, {
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
    
  } catch (error) {
    console.error('❌ Error verificando Railway:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 404) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verificar que el backend esté desplegado en Railway');
      console.log('2. Verificar las variables de entorno CORS_ORIGIN');
      console.log('3. Reiniciar el servicio en Railway');
    }
  }
}

// Ejecutar verificación
checkRailwayCORS(); 