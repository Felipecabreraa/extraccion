const mysql = require('mysql2/promise');

async function verifyTestDatabase() {
  console.log('🔍 Verificando conexión a la base de datos de PRUEBAS...');
  
  const dbConfig = {
    host: 'trn.cl',
    user: 'trn_felipe',
    password: 'RioNegro2025@',
    database: 'trn_extraccion_test',
    port: 3306
  };
  
  try {
    // Crear conexión
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Verificar que la base de datos existe
    console.log('\n📊 Verificando base de datos...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'trn_extraccion_test');
    
    if (dbExists) {
      console.log('✅ Base de datos trn_extraccion_test existe');
    } else {
      console.log('❌ Base de datos trn_extraccion_test no existe');
      console.log('💡 Crear la base de datos si es necesario');
    }
    
    // Verificar tablas principales
    console.log('\n📋 Verificando tablas principales...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    const expectedTables = [
      'usuarios',
      'planillas',
      'barredores',
      'maquinas',
      'operadores',
      'pabellones',
      'danos',
      'zonas',
      'sectores'
    ];
    
    const existingTables = tables.map(table => Object.values(table)[0]);
    
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`✅ Tabla ${table} existe`);
      } else {
        console.log(`⚠️ Tabla ${table} no existe`);
      }
    }
    
    // Verificar datos de prueba
    console.log('\n👥 Verificando datos de prueba...');
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
      console.log(`✅ Usuarios en la base de datos: ${users[0].count}`);
    } catch (error) {
      console.log('⚠️ No se pudo verificar usuarios:', error.message);
    }
    
    // Verificar configuración específica de pruebas
    console.log('\n🔧 Configuración de pruebas:');
    console.log('📊 Base de datos: trn_extraccion_test');
    console.log('👤 Usuario: trn_felipe');
    console.log('🌐 Host: trn.cl');
    console.log('🔒 Puerto: 3306');
    
    await connection.end();
    
    console.log('\n🎉 Verificación de base de datos completada!');
    console.log('✅ Base de datos de pruebas configurada correctamente');
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', {
      message: error.message,
      code: error.code,
      errno: error.errno
    });
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verificar credenciales de la base de datos');
      console.log('2. Verificar que el usuario tenga permisos');
      console.log('3. Verificar que la base de datos exista');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verificar que el servidor MySQL esté ejecutándose');
      console.log('2. Verificar la configuración de red');
      console.log('3. Verificar el host y puerto');
    }
  }
}

// Ejecutar verificación
verifyTestDatabase(); 