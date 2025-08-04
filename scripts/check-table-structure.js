const mysql = require('mysql2/promise');

async function checkTableStructure() {
  console.log('🔍 Verificando estructura de la tabla usuario...');

  const dbConfig = {
    host: 'trn.cl',
    user: 'trn_felipe',
    password: 'RioNegro2025@',
    database: 'trn_extraccion_test',
    port: 3306
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a trn_extraccion_test exitosa');

    // Verificar estructura de la tabla usuario
    const [columns] = await connection.execute(
      'DESCRIBE usuario'
    );

    console.log('\n📋 Estructura de la tabla usuario:');
    columns.forEach((column, index) => {
      console.log(`${index + 1}. ${column.Field} | ${column.Type} | ${column.Null} | ${column.Key} | ${column.Default} | ${column.Extra}`);
    });

    // Verificar todos los usuarios
    const [users] = await connection.execute(
      'SELECT * FROM usuario ORDER BY id LIMIT 5'
    );

    console.log(`\n📋 Primeros 5 usuarios:`);
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${JSON.stringify(user)}`);
      });
    } else {
      console.log('❌ No hay usuarios en la tabla');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error verificando estructura:', {
      message: error.message,
      code: error.code
    });
  }
}

checkTableStructure(); 