const mysql = require('mysql2/promise');
require('dotenv').config();

async function actualizarEstadosPlanillas() {
  console.log('🔄 Iniciando actualización de estados de planillas...\n');

  let connection;
  
  try {
    // Configurar conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'extraction_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conexión a la base de datos establecida');

    // 1. Verificar estados actuales
    console.log('\n1️⃣ Verificando estados actuales...');
    const [estadosActuales] = await connection.execute(`
      SELECT estado, COUNT(*) as cantidad 
      FROM planilla 
      GROUP BY estado
    `);
    
    console.log('   Estados actuales:');
    estadosActuales.forEach(estado => {
      console.log(`     - ${estado.estado || 'NULL'}: ${estado.cantidad} planillas`);
    });

    // 2. Iniciar transacción
    console.log('\n2️⃣ Iniciando actualización de estados...');
    await connection.beginTransaction();

    try {
      // Actualizar estados existentes
      const [resultadoPendientes] = await connection.execute(`
        UPDATE planilla 
        SET estado = 'PENDIENTE' 
        WHERE estado = 'ABIERTO' OR estado IS NULL
      `);
      console.log(`   📋 Planillas actualizadas a PENDIENTE: ${resultadoPendientes.affectedRows}`);

      const [resultadoCompletadas] = await connection.execute(`
        UPDATE planilla 
        SET estado = 'COMPLETADA' 
        WHERE estado = 'CERRADO'
      `);
      console.log(`   ✅ Planillas actualizadas a COMPLETADA: ${resultadoCompletadas.affectedRows}`);

      // 3. Actualizar el ENUM en la base de datos
      console.log('\n3️⃣ Actualizando estructura de la tabla...');
      await connection.execute(`
        ALTER TABLE planilla 
        MODIFY COLUMN estado ENUM('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA') 
        NOT NULL DEFAULT 'PENDIENTE'
      `);
      console.log('   🗂️ Estructura de tabla actualizada');

      // Confirmar transacción
      await connection.commit();
      console.log('\n✅ Transacción confirmada. Actualización completada exitosamente.');

      // 4. Verificar estados finales
      console.log('\n4️⃣ Verificando estados finales...');
      const [estadosFinales] = await connection.execute(`
        SELECT estado, COUNT(*) as cantidad 
        FROM planilla 
        GROUP BY estado
        ORDER BY estado
      `);
      
      console.log('   Estados finales:');
      estadosFinales.forEach(estado => {
        console.log(`     - ${estado.estado}: ${estado.cantidad} planillas`);
      });

      console.log('\n🎉 Actualización de estados de planillas completada exitosamente!');

    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error durante la actualización:', error.message);
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 Transacción revertida debido al error.');
      } catch (rollbackError) {
        console.error('❌ Error al revertir transacción:', rollbackError.message);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a la base de datos cerrada.');
    }
  }
}

// Ejecutar actualización
actualizarEstadosPlanillas()
  .then(() => {
    console.log('\n✅ Script de actualización completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  }); 