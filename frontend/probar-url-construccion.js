const axios = require('axios');

console.log('🔍 Probando construcción de URL...\n');

// Simular diferentes configuraciones
const configuraciones = [
  {
    nombre: 'Configuración actual (package.json)',
    REACT_APP_API_URL: 'http://localhost:3001/api',
    NODE_ENV: 'development'
  },
  {
    nombre: 'Configuración con espacio extra',
    REACT_APP_API_URL: 'http://localhost:3001/api ',
    NODE_ENV: 'development'
  },
  {
    nombre: 'Configuración sin variable de entorno',
    REACT_APP_API_URL: undefined,
    NODE_ENV: 'development'
  }
];

configuraciones.forEach((config, index) => {
  console.log(`\n${index + 1}. ${config.nombre}`);
  console.log('   - REACT_APP_API_URL:', JSON.stringify(config.REACT_APP_API_URL));
  console.log('   - NODE_ENV:', config.NODE_ENV);
  
  // Resolver baseURL como lo hace el frontend
  const resolvedBaseURL = 
    config.REACT_APP_API_URL ||
    (config.NODE_ENV === 'production'
      ? 'https://extraccion-backend-test.onrender.com/api'
      : 'http://localhost:3001/api');
  
  console.log('   - URL base resuelta:', JSON.stringify(resolvedBaseURL));
  
  // Crear instancia de axios
  const api = axios.create({
    baseURL: resolvedBaseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Probar construcción de URL
  const loginUrl = api.getUri({ url: '/auth/login' });
  console.log('   - URL de login construida:', JSON.stringify(loginUrl));
  
  // Verificar si hay espacios
  if (loginUrl.includes('%20')) {
    console.log('   ❌ PROBLEMA: URL contiene espacios codificados (%20)');
  } else {
    console.log('   ✅ URL correcta sin espacios');
  }
});

console.log('\n🎯 Diagnóstico:');
console.log('El problema está en el package.json donde hay un espacio extra');
console.log('en la variable REACT_APP_API_URL que causa que la URL se construya');
console.log('como "/api /auth/login" en lugar de "/api/auth/login"');

