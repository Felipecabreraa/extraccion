const axios = require('axios');

console.log('🔍 Depurando configuración de URL de API...\n');

// Simular exactamente lo que hace el frontend
const resolvedBaseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://extraccion-backend-test.onrender.com/api'
    : 'http://localhost:3000/api');

console.log('📊 Variables de entorno:');
console.log('   - REACT_APP_API_URL:', JSON.stringify(process.env.REACT_APP_API_URL));
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - URL base resuelta:', JSON.stringify(resolvedBaseURL));

// Verificar si hay espacios o caracteres extra
console.log('\n🔍 Análisis de la URL:');
console.log('   - Longitud:', resolvedBaseURL.length);
console.log('   - Caracteres ASCII:');
for (let i = 0; i < resolvedBaseURL.length; i++) {
  const char = resolvedBaseURL[i];
  const code = char.charCodeAt(0);
  console.log(`     ${i}: '${char}' (${code})`);
}

// Crear instancia de axios
const api = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Probar una llamada
async function probarLlamada() {
  try {
    console.log('\n🧪 Probando llamada a /auth/login...');
    const response = await api.post('/auth/login', {
      email: 'test@test.com',
      password: 'test123'
    });
    console.log('✅ Llamada exitosa:', response.data);
  } catch (error) {
    console.log('❌ Error en la llamada:');
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - URL completa:', error.config.url);
      console.log('   - Base URL:', error.config.baseURL);
      console.log('   - Data:', error.response.data);
    } else {
      console.log('   - Error:', error.message);
    }
  }
}

probarLlamada();
