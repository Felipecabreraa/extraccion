const axios = require('axios');

console.log('🔍 Probando conectividad completa...\n');

// Configuración
const BACKEND_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3000';

console.log('📊 Configuración:');
console.log('   - Backend:', BACKEND_URL);
console.log('   - Frontend:', FRONTEND_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function probarConectividadCompleta() {
  try {
    // 1. Probar health check
    console.log('\n1️⃣ Probando health check...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check: OK');
    console.log('   - Status:', healthResponse.status);
    console.log('   - Database:', healthResponse.data.database);

    // 2. Probar rutas del generador de PDF
    console.log('\n2️⃣ Probando rutas del generador de PDF...');
    
    const listarResponse = await api.get('/generador-pdf-simple/listar');
    console.log('✅ Listar PDFs: OK');
    console.log('   - PDFs encontrados:', listarResponse.data.data.length);
    
    const statsResponse = await api.get('/generador-pdf-simple/estadisticas');
    console.log('✅ Estadísticas: OK');
    console.log('   - Total PDFs:', statsResponse.data.data.totalPDFs);

    // 3. Probar login endpoint
    console.log('\n3️⃣ Probando login endpoint...');
    const loginData = {
      email: 'admin@admin.com',
      password: 'admin123'
    };
    
    const loginResponse = await api.post('/auth/login', loginData);
    console.log('✅ Login exitoso!');
    console.log('   - Token recibido:', loginResponse.data.token ? 'SÍ' : 'NO');
    console.log('   - Usuario:', loginResponse.data.usuario?.nombre);

    // 4. Probar rutas protegidas con token
    console.log('\n4️⃣ Probando rutas protegidas...');
    const token = loginResponse.data.token;
    
    const protectedResponse = await api.get('/generador-pdf-simple/listar', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Rutas protegidas: OK');

    console.log('\n🎉 ¡Conectividad completa funcionando!');
    console.log('\n📱 Ahora puedes:');
    console.log('   1. Abrir http://localhost:3000 en tu navegador');
    console.log('   2. Usar las credenciales: admin@admin.com / admin123');
    console.log('   3. El login debería funcionar sin errores 404');
    console.log('   4. El generador de PDF debería funcionar correctamente');

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - URL:', error.config.url);
      console.log('   - Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Las credenciales no son correctas, pero la URL está bien.');
        console.log('   El backend está funcionando correctamente.');
      }
    } else if (error.request) {
      console.log('\n❌ Error de conexión:');
      console.log('   - No se pudo conectar al backend');
      console.log('   - Verifica que el backend esté ejecutándose en puerto 3001');
    }
  }
}

probarConectividadCompleta();

