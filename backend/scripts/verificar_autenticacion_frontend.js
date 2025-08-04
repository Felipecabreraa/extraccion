const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarAutenticacionFrontend() {
  try {
    console.log('🔍 Verificando estado de autenticación del frontend...\n');

    // 1. Intentar login para obtener token
    console.log('1. Intentando login...');
    let token = null;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      
      token = loginResponse.data.token;
      console.log('✅ Login exitoso');
      console.log(`   - Token obtenido: ${token ? 'SÍ' : 'NO'}`);
    } catch (error) {
      console.log('❌ Error en login:', error.response?.status, error.response?.data?.message);
      
      // Intentar con credenciales alternativas
      try {
        const loginResponse2 = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'admin@example.com',
          password: 'password'
        });
        
        token = loginResponse2.data.token;
        console.log('✅ Login exitoso con credenciales alternativas');
      } catch (error2) {
        console.log('❌ Error en login alternativo:', error2.response?.status, error2.response?.data?.message);
      }
    }

    if (!token) {
      console.log('\n⚠️  No se pudo obtener token. Verificando rutas sin autenticación...');
      
      // Probar rutas sin token
      const rutasSinAuth = [
        '/auth/login',
        '/auth/register'
      ];
      
      for (const ruta of rutasSinAuth) {
        try {
          const response = await axios.get(`${BASE_URL}${ruta}`);
          console.log(`✅ ${ruta}: ${response.status}`);
        } catch (error) {
          console.log(`❌ ${ruta}: ${error.response?.status} - ${error.response?.data?.message}`);
        }
      }
      
      return;
    }

    // 2. Probar rutas con token
    console.log('\n2. Probando rutas con token...');
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const rutasConAuth = [
      '/metros-superficie/estadisticas',
      '/metros-superficie/mes-anterior',
      '/metros-superficie',
      '/zonas'
    ];

    for (const ruta of rutasConAuth) {
      try {
        const response = await axios.get(`${BASE_URL}${ruta}`, { headers });
        console.log(`✅ ${ruta}: ${response.status}`);
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            console.log(`   - Datos: ${response.data.length} elementos`);
          } else if (typeof response.data === 'object') {
            console.log(`   - Datos: ${Object.keys(response.data).length} propiedades`);
          }
        }
      } catch (error) {
        console.log(`❌ ${ruta}: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }

    // 3. Verificar configuración del frontend
    console.log('\n3. Verificando configuración del frontend...');
    console.log('   📝 El frontend debería:');
    console.log('   - Almacenar el token en localStorage después del login');
    console.log('   - Incluir el token en el header Authorization de todas las peticiones');
    console.log('   - Manejar errores 401 redirigiendo al login');
    console.log('   - Renovar el token cuando expire');

    // 4. Simular petición del frontend
    console.log('\n4. Simulando petición del frontend...');
    
    // Simular token del localStorage
    const tokenFrontend = token;
    
    if (tokenFrontend) {
      try {
        const response = await axios.get(`${BASE_URL}/metros-superficie/estadisticas`, {
          headers: {
            'Authorization': `Bearer ${tokenFrontend}`
          }
        });
        console.log('✅ Petición simulada exitosa');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Datos recibidos: ${response.data ? 'SÍ' : 'NO'}`);
      } catch (error) {
        console.log('❌ Error en petición simulada:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n✅ Verificación completada!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verificarAutenticacionFrontend(); 