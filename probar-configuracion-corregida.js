const axios = require('axios');

console.log('🧪 Probando configuración corregida...\n');

// Configuración corregida (sin espacios)
const API_URL = 'http://localhost:3000/api';

console.log('📊 Configuración:');
console.log('   - API URL:', API_URL);
console.log('   - URL de prueba:', API_URL + '/auth/login');

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function probarConfiguracion() {
  try {
    // 1. Probar health check
    console.log('\n1️⃣ Probando health check...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check: OK');
    console.log('   - Status:', healthResponse.status);
    console.log('   - Database:', healthResponse.data.database);

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

    console.log('\n🎉 ¡Configuración corregida!');
    console.log('✅ El problema del espacio en la URL ha sido solucionado');
    console.log('✅ Ahora puedes usar el frontend sin errores 404');

  } catch (error) {
    if (error.response) {
      console.log('❌ Error en la respuesta:');
      console.log('   - Status:', error.response.status);
      console.log('   - URL completa:', error.config.url);
      console.log('   - Base URL:', error.config.baseURL);
      console.log('   - Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Las credenciales no son correctas, pero la URL está bien.');
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

probarConfiguracion();
