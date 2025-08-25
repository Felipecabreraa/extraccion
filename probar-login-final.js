const axios = require('axios');

console.log('🧪 Probando login con configuración final...\n');

// Configuración correcta
const API_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:3001';

console.log('📊 Configuración:');
console.log('   - Backend API: ' + API_URL);
console.log('   - Frontend: ' + FRONTEND_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function probarLogin() {
  try {
    // 1. Probar health check
    console.log('\n1️⃣ Probando health check...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check: OK');
    console.log('   - Status:', healthResponse.status);
    console.log('   - Database:', healthResponse.data.database);

    // 2. Probar login con credenciales de prueba
    console.log('\n2️⃣ Probando login con credenciales de prueba...');
    const loginData = {
      email: 'admin@admin.com',
      password: 'admin123'
    };
    
    const loginResponse = await api.post('/auth/login', loginData);
    console.log('✅ Login exitoso!');
    console.log('   - Token recibido:', loginResponse.data.token ? 'SÍ' : 'NO');
    console.log('   - Usuario:', loginResponse.data.usuario?.nombre);
    console.log('   - Rol:', loginResponse.data.usuario?.rol);

    // 3. Probar verificación de token
    console.log('\n3️⃣ Probando verificación de token...');
    const token = loginResponse.data.token;
    const verifyResponse = await api.get('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Verificación de token: OK');
    console.log('   - Usuario verificado:', verifyResponse.data.usuario?.nombre);

    console.log('\n🎉 ¡Todo funciona correctamente!');
    console.log('\n📱 Ahora puedes:');
    console.log('   1. Abrir http://localhost:3001 en tu navegador');
    console.log('   2. Usar las credenciales: admin@admin.com / admin123');
    console.log('   3. El login debería funcionar sin errores 404');

  } catch (error) {
    if (error.response) {
      console.log('❌ Error en la respuesta:');
      console.log('   - Status:', error.response.status);
      console.log('   - Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Las credenciales de prueba no existen.');
        console.log('   Esto es normal si no has creado el usuario admin.');
        console.log('   El backend está funcionando correctamente.');
      }
    } else if (error.request) {
      console.log('❌ Error de conexión:');
      console.log('   - No se pudo conectar al backend');
      console.log('   - Verifica que el backend esté ejecutándose en puerto 3000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

probarLogin();
