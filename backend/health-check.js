const axios = require('axios');
const { Usuario, Sector, Planilla } = require('./src/models');
const sequelize = require('./src/config/database');

async function healthCheck() {
  console.log('🔍 Iniciando verificación de salud del sistema...\n');
  
  const results = {
    database: false,
    server: false,
    models: false,
    data: false,
    security: false
  };

  try {
    // 1. Verificar conexión a base de datos
    console.log('1️⃣ Verificando conexión a base de datos...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión a MySQL exitosa');
    results.database = true;
  } catch (error) {
    console.log('   ❌ Error de conexión a MySQL:', error.message);
  }

  try {
    // 2. Verificar que el servidor esté corriendo
    console.log('\n2️⃣ Verificando servidor backend...');
    const response = await axios.get('http://localhost:3001/api/health', { timeout: 5000 });
    console.log('   ✅ Servidor respondiendo:', response.data.status);
    results.server = true;
  } catch (error) {
    console.log('   ❌ Servidor no responde:', error.message);
  }

  try {
    // 3. Verificar modelos
    console.log('\n3️⃣ Verificando modelos de base de datos...');
    await sequelize.sync({ alter: false });
    console.log('   ✅ Modelos sincronizados correctamente');
    results.models = true;
  } catch (error) {
    console.log('   ❌ Error en modelos:', error.message);
  }

  try {
    // 4. Verificar datos básicos
    console.log('\n4️⃣ Verificando datos básicos...');
    const [usuarios, sectores, planillas] = await Promise.all([
      Usuario.count(),
      Sector.count(),
      Planilla.count()
    ]);
    
    console.log(`   📊 Usuarios: ${usuarios}`);
    console.log(`   📊 Sectores: ${sectores}`);
    console.log(`   📊 Planillas: ${planillas}`);
    
    if (usuarios > 0) {
      console.log('   ✅ Datos básicos encontrados');
      results.data = true;
    } else {
      console.log('   ⚠️ No hay usuarios registrados');
    }
  } catch (error) {
    console.log('   ❌ Error verificando datos:', error.message);
  }

  try {
    // 5. Verificar configuración de seguridad
    console.log('\n5️⃣ Verificando configuración de seguridad...');
    const jwtSecret = process.env.JWT_SECRET;
    const bcryptRounds = process.env.BCRYPT_ROUNDS;
    
    if (jwtSecret && jwtSecret !== 'secreto_super_seguro') {
      console.log('   ✅ JWT_SECRET configurado correctamente');
    } else {
      console.log('   ⚠️ JWT_SECRET usa valor por defecto');
    }
    
    if (bcryptRounds && parseInt(bcryptRounds) >= 10) {
      console.log('   ✅ BCRYPT_ROUNDS configurado correctamente');
    } else {
      console.log('   ⚠️ BCRYPT_ROUNDS no configurado o muy bajo');
    }
    
    results.security = true;
  } catch (error) {
    console.log('   ❌ Error verificando seguridad:', error.message);
  }

  // Resumen
  console.log('\n📋 RESUMEN DE VERIFICACIÓN:');
  console.log('========================');
  
  Object.entries(results).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${key.toUpperCase()}: ${value ? 'OK' : 'ERROR'}`);
  });

  const allOk = Object.values(results).every(v => v);
  
  if (allOk) {
    console.log('\n🎉 ¡Sistema funcionando correctamente!');
  } else {
    console.log('\n⚠️ Se encontraron problemas que requieren atención.');
    console.log('💡 Revisa los errores anteriores y corrígelos.');
  }

  await sequelize.close();
}

healthCheck().catch(console.error); 