const axios = require('axios');

async function getToken() {
  try {
    console.log('🔑 Obteniendo token de autenticación...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    console.log('✅ Token obtenido exitosamente');
    console.log('🔑 Token:', response.data.token);
    
    return response.data.token;

  } catch (error) {
    console.error('❌ Error obteniendo token:', error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = getToken;



