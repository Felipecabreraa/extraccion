const axios = require('axios');

// Configuración de URLs
const BACKEND_URL = 'http://localhost:3000';
const API_URL = `${BACKEND_URL}/api`;

async function probarConectividad() {
  console.log('🔍 Probando conectividad con el backend...\n');

  try {
    // 1. Probar endpoint raíz
    console.log('1️⃣ Probando endpoint raíz...');
    const rootResponse = await axios.get(BACKEND_URL);
    console.log('✅ Endpoint raíz funciona:', rootResponse.data);
  } catch (error) {
    console.log('❌ Error en endpoint raíz:', error.message);
  }

  try {
    // 2. Probar health check
    console.log('\n2️⃣ Probando health check...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check funciona:', healthResponse.data);
  } catch (error) {
    console.log('❌ Error en health check:', error.message);
  }

  try {
    // 3. Probar ruta de autenticación (sin datos)
    console.log('\n3️⃣ Probando ruta de login (sin datos)...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {});
    console.log('✅ Login endpoint responde:', loginResponse.data);
  } catch (error) {
    if (error.response) {
      console.log('✅ Login endpoint responde (esperado error 400):', error.response.data);
    } else {
      console.log('❌ Error en login endpoint:', error.message);
    }
  }

  try {
    // 4. Probar con credenciales de prueba
    console.log('\n4️⃣ Probando login con credenciales de prueba...');
    const testCredentials = {
      email: 'test@test.com',
      password: 'test123'
    };
    const testLoginResponse = await axios.post(`${API_URL}/auth/login`, testCredentials);
    console.log('✅ Login con credenciales de prueba:', testLoginResponse.data);
  } catch (error) {
    if (error.response) {
      console.log('✅ Login con credenciales de prueba (esperado error 401):', error.response.data);
    } else {
      console.log('❌ Error en login con credenciales de prueba:', error.message);
    }
  }

  // 5. Verificar configuración de axios del frontend
  console.log('\n5️⃣ Verificando configuración del frontend...');
  console.log('📊 URL base configurada en axios.js:');
  console.log('   - REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'No definida');
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'No definida');
  console.log('   - URL por defecto en desarrollo: http://localhost:3000/api');
  console.log('   - URL por defecto en producción: https://extraccion-backend-test.onrender.com/api');

  console.log('\n🔧 Recomendaciones:');
  console.log('1. Verifica que el backend esté ejecutándose en el puerto 3000');
  console.log('2. Verifica que no haya errores en la consola del backend');
  console.log('3. Verifica que la base de datos esté conectada');
  console.log('4. Verifica que las rutas de autenticación estén correctamente configuradas');
}

probarConectividad().catch(error => {
  console.error('❌ Error general:', error.message);
});
