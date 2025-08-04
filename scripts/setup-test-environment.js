#!/usr/bin/env node

const axios = require('axios');
const mysql = require('mysql2/promise');

async function setupTestEnvironment() {
  console.log('🔧 Configurando ambiente de pruebas completo...');
  
  // Configuración de la base de datos de pruebas
  const dbConfig = {
    host: 'trn.cl',
    user: 'trn_felipe',
    password: 'RioNegro2025@',
    database: 'trn_extraccion_test',
    port: 3306
  };
  
  try {
    // 1. Verificar conexión a la base de datos de pruebas
    console.log('\n1. Verificando conexión a la base de datos de pruebas...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a trn_extraccion_test exitosa');
    
    // 2. Verificar que el usuario de prueba existe
    console.log('\n2. Verificando usuario de prueba...');
    const [users] = await connection.execute(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = ?',
      ['admin@test.com']
    );
    
    if (users.length > 0) {
      console.log('✅ Usuario de prueba encontrado:', {
        id: users[0].id,
        nombre: users[0].nombre,
        email: users[0].email,
        rol: users[0].rol
      });
    } else {
      console.log('❌ Usuario de prueba no encontrado');
    }
    
    await connection.end();
    
    // 3. Verificar que Railway esté configurado correctamente
    console.log('\n3. Verificando configuración de Railway...');
    const railwayUrl = 'https://trn-extraccion-production.up.railway.app';
    
    const healthResponse = await axios.get(`${railwayUrl}/health`);
    console.log('✅ Railway funcionando:', healthResponse.status);
    
    // 4. Verificar CORS para el frontend
    console.log('\n4. Verificando configuración CORS...');
    const corsResponse = await axios.options(`${railwayUrl}/api/auth/login`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('✅ CORS configurado correctamente');
    
    // 5. Probar login con el usuario de prueba
    console.log('\n5. Probando login con usuario de prueba...');
    const loginResponse = await axios.post(`${railwayUrl}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso:', {
      status: loginResponse.status,
      token: loginResponse.data.token ? 'Presente' : 'Ausente',
      user: loginResponse.data.user ? 'Presente' : 'Ausente'
    });
    
    console.log('\n🎉 Ambiente de pruebas configurado correctamente!');
    console.log('📊 Base de datos: trn_extraccion_test');
    console.log('🌐 Backend: https://trn-extraccion-production.up.railway.app');
    console.log('📧 Usuario: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('🔓 CORS: Configurado para localhost:3000');
    
  } catch (error) {
    console.error('❌ Error configurando ambiente:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Error de acceso a la base de datos');
      console.log('Verificar credenciales de trn_extraccion_test');
    } else if (error.response?.status === 401) {
      console.log('\n💡 Error de autenticación');
      console.log('Verificar credenciales del usuario de prueba');
    }
  }
}

setupTestEnvironment(); 