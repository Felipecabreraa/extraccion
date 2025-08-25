const axios = require('axios');

console.log('🔍 Probando conectividad del frontend...\n');

// Simular las variables de entorno del frontend
process.env.REACT_APP_API_URL = 'http://localhost:3001/api';
process.env.NODE_ENV = 'development';

// Resolver baseURL como lo hace el frontend
const resolvedBaseURL = 
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://extraccion-backend-test.onrender.com/api'
    : 'http://localhost:3001/api');

console.log('📊 Configuración del frontend:');
console.log('   - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - URL base resuelta:', resolvedBaseURL);

// Crear instancia de axios como en el frontend
const api = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function probarFrontendLogin() {
  try {
    console.log('\n🧪 Probando login desde el frontend...\n');

    // 1. Probar health check
    console.log('1️⃣ Probando health check...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check funciona:', healthResponse.data);

    // 2. Probar login endpoint
    console.log('\n2️⃣ Probando login endpoint...');
    const loginData = {
      email: 'admin@admin.com',
      password: 'admin123'
    };
    
    const loginResponse = await api.post('/auth/login', loginData);
    console.log('✅ Login exitoso!');
    console.log('   - Token recibido:', loginResponse.data.token ? 'SÍ' : 'NO');
    console.log('   - Usuario:', loginResponse.data.usuario?.nombre);

    // 3. Probar con credenciales incorrectas
    console.log('\n3️⃣ Probando login con credenciales incorrectas...');
    try {
      const wrongLoginResponse = await api.post('/auth/login', {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      });
      console.log('❌ Error: Debería haber fallado');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Login con credenciales incorrectas (esperado error 401):', error.response.data);
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }

    console.log('\n🎉 ¡Frontend conectado correctamente!');
    console.log('✅ El problema no está en la configuración del frontend');
    console.log('✅ El backend está respondiendo correctamente');
    console.log('\n💡 Posibles causas del error en el navegador:');
    console.log('   1. El frontend no está ejecutándose en el puerto 3000');
    console.log('   2. Problema de caché del navegador');
    console.log('   3. Problema de CORS en el navegador');

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - URL:', error.config.url);
      console.log('   - Data:', error.response.data);
    } else if (error.request) {
      console.log('\n❌ Error de conexión:');
      console.log('   - No se pudo conectar al backend');
      console.log('   - Verifica que el backend esté ejecutándose en puerto 3001');
      console.log('   - URL intentada:', error.config.url);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

probarFrontendLogin();

