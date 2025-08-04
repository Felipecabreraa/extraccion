const axios = require('axios');

async function createTestUser() {
  console.log('👤 Creando usuario de prueba...');
  
  const apiUrl = 'https://trn-extraccion-production.up.railway.app/api';
  
  try {
    // Datos del usuario de prueba
    const testUser = {
      nombre: 'Usuario Prueba',
      email: 'test@trn.com',
      password: 'test123',
      rol: 'admin',
      activo: true
    };
    
    console.log('📋 Datos del usuario:', {
      email: testUser.email,
      password: testUser.password,
      rol: testUser.rol
    });
    
    // Crear usuario
    const response = await axios.post(`${apiUrl}/usuarios`, testUser);
    
    console.log('✅ Usuario creado exitosamente:', {
      id: response.data.id,
      email: response.data.email,
      rol: response.data.rol
    });
    
    console.log('\n🎉 Usuario de prueba creado!');
    console.log('📧 Email: test@trn.com');
    console.log('🔑 Password: test123');
    console.log('👤 Rol: admin');
    
    // Probar login con el usuario creado
    console.log('\n🔍 Probando login con el usuario creado...');
    const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login exitoso:', {
      status: loginResponse.status,
      token: loginResponse.data.token ? 'Presente' : 'Ausente',
      user: loginResponse.data.user ? 'Presente' : 'Ausente'
    });
    
  } catch (error) {
    console.error('❌ Error creando usuario:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response?.status === 409) {
      console.log('\n💡 El usuario ya existe, probando login...');
      
      try {
        const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
          email: 'test@trn.com',
          password: 'test123'
        });
        
        console.log('✅ Login exitoso con usuario existente');
        console.log('📧 Email: test@trn.com');
        console.log('🔑 Password: test123');
        
      } catch (loginError) {
        console.log('❌ Error en login:', loginError.response?.data?.message);
      }
    }
  }
}

// Ejecutar creación de usuario
createTestUser(); 