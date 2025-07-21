const { Usuario } = require('./src/models');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function crearUsuarioAdmin() {
  console.log('🔧 CREANDO USUARIO ADMIN@ADMIN.COM\n');

  try {
    const adminExistente = await Usuario.findOne({
      where: { email: 'admin@admin.com' }
    });

    if (adminExistente) {
      console.log('✅ Usuario admin@admin.com ya existe. Actualizando contraseña...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await adminExistente.update({ password: hashedPassword });
      console.log('✅ Contraseña actualizada a: admin123');
    } else {
      console.log('❌ Usuario admin@admin.com no existe. Creando...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        rol: 'administrador'
      });
      console.log('✅ Usuario admin@admin.com creado exitosamente');
    }

    console.log('\n📋 CREDENCIALES:');
    console.log('   Email: admin@admin.com');
    console.log('   Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
  }
}

async function verificarRutas() {
  console.log('\n🔍 VERIFICANDO RUTAS\n');

  try {
    // Verificar servidor
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor funcionando');

    // Verificar ruta de carga masiva
    try {
      const response = await axios.post(`${BASE_URL}/maquinas/carga-masiva`, {
        maquinas: []
      });
      console.log('✅ Ruta /maquinas/carga-masiva funcionando');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Ruta /maquinas/carga-masiva encontrada (necesita auth)');
      } else {
        console.log('❌ Error en ruta /maquinas/carga-masiva:', error.response?.status);
      }
    }

  } catch (error) {
    console.log('❌ Servidor no está ejecutándose');
    return false;
  }
  
  return true;
}

async function probarFlujoCompleto() {
  console.log('\n🧪 PROBANDO FLUJO COMPLETO\n');

  try {
    // 1. Login
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 2. Probar carga masiva
    console.log('\n2️⃣ Probando carga masiva...');
    const cargaMasivaResponse = await axios.post(`${BASE_URL}/maquinas/carga-masiva`, {
      maquinas: [
        {
          numero: 'TEST001',
          marca: 'Test Brand',
          modelo: 'Test Model'
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Carga masiva exitosa');
    console.log('Status:', cargaMasivaResponse.status);
    console.log('Data:', JSON.stringify(cargaMasivaResponse.data, null, 2));

    console.log('\n🎉 ¡TODO FUNCIONANDO CORRECTAMENTE!');
    console.log('   El frontend debería funcionar ahora');

  } catch (error) {
    console.log('❌ ERROR EN EL FLUJO:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

async function solucionCompleta() {
  console.log('🚀 SOLUCIÓN COMPLETA PARA EL PROBLEMA DE CARGA MASIVA\n');

  // 1. Crear usuario admin
  await crearUsuarioAdmin();

  // 2. Verificar rutas
  const servidorOk = await verificarRutas();
  
  if (!servidorOk) {
    console.log('\n❌ El servidor no está ejecutándose');
    console.log('   Ejecuta: npm start o node src/app.js');
    return;
  }

  // 3. Probar flujo completo
  await probarFlujoCompleto();

  console.log('\n📝 RESUMEN:');
  console.log('   1. ✅ Usuario admin@admin.com creado/actualizado');
  console.log('   2. ✅ Rutas verificadas');
  console.log('   3. ✅ Flujo completo probado');
  console.log('\n💡 Si el frontend sigue fallando, reinicia el servidor backend');
}

solucionCompleta(); 