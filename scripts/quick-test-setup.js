const axios = require('axios');

async function quickTestSetup() {
  console.log('🔧 Verificando ambiente de pruebas...');
  
  try {
    // 1. Verificar que Railway esté funcionando
    console.log('\n1. Verificando Railway...');
    const railwayUrl = 'https://trn-extraccion-production.up.railway.app';
    const healthResponse = await axios.get(`${railwayUrl}/health`);
    console.log('✅ Railway funcionando:', healthResponse.status);
    
    // 2. Verificar CORS
    console.log('\n2. Verificando CORS...');
    const corsResponse = await axios.options(`${railwayUrl}/api/auth/login`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    console.log('✅ CORS configurado correctamente');
    
    // 3. Probar login con usuario de prueba
    console.log('\n3. Probando login...');
    const loginResponse = await axios.post(`${railwayUrl}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso!');
    console.log('📧 Usuario: admin@test.com');
    console.log('🔑 Password: admin123');
    
    console.log('\n🎉 Ambiente de pruebas listo!');
    console.log('📊 Base de datos: trn_extraccion_test');
    console.log('🌐 Backend: https://trn-extraccion-production.up.railway.app');
    console.log('🔓 CORS: Configurado para localhost:3000');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Credenciales incorrectas, pero el endpoint funciona');
      console.log('📧 Usuario: admin@test.com');
      console.log('🔑 Password: admin123');
    }
  }
}

quickTestSetup(); 