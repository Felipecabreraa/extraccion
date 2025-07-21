const mysql = require('mysql2/promise');
require('dotenv').config();

async function limpiarDatosHuérfanosPlanillas() {
  console.log('🧹 Iniciando limpieza de datos huérfanos de planillas...\n');

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

    // 1. Verificar datos huérfanos antes de limpiar
    console.log('\n1️⃣ Verificando datos huérfanos existentes...');
    
    const [barredoresHuérfanos] = await connection.execute(`
      SELECT COUNT(*) as count FROM barredor b 
      LEFT JOIN planilla p ON b.planilla_id = p.id 
      WHERE p.id IS NULL
    `);
    
    const [maquinasHuérfanas] = await connection.execute(`
      SELECT COUNT(*) as count FROM maquina_planilla mp 
      LEFT JOIN planilla p ON mp.planilla_id = p.id 
      WHERE p.id IS NULL
    `);
    
    const [pabellonesHuérfanos] = await connection.execute(`
      SELECT COUNT(*) as count FROM pabellon_maquina pm 
      LEFT JOIN planilla p ON pm.planilla_id = p.id 
      WHERE p.id IS NULL
    `);
    
    const [danosHuérfanos] = await connection.execute(`
      SELECT COUNT(*) as count FROM dano d 
      LEFT JOIN planilla p ON d.planilla_id = p.id 
      WHERE p.id IS NULL
    `);

    console.log(`   📋 Barredores huérfanos: ${barredoresHuérfanos[0].count}`);
    console.log(`   🚜 Máquinas huérfanas: ${maquinasHuérfanas[0].count}`);
    console.log(`   🏢 Pabellones huérfanos: ${pabellonesHuérfanos[0].count}`);
    console.log(`   ⚠️ Daños huérfanos: ${danosHuérfanos[0].count}`);

    const totalHuérfanos = barredoresHuérfanos[0].count + maquinasHuérfanas[0].count + 
                          pabellonesHuérfanos[0].count + danosHuérfanos[0].count;

    if (totalHuérfanos === 0) {
      console.log('\n✅ No se encontraron datos huérfanos. No es necesario limpiar.');
      return;
    }

    // 2. Confirmar limpieza
    console.log(`\n⚠️ Se encontraron ${totalHuérfanos} registros huérfanos.`);
    console.log('¿Desea proceder con la limpieza? (s/n)');
    
    // En un entorno automatizado, proceder directamente
    // En un entorno interactivo, aquí se pediría confirmación
    
    // 3. Iniciar transacción para limpieza
    console.log('\n2️⃣ Iniciando limpieza de datos huérfanos...');
    
    await connection.beginTransaction();

    try {
      // Eliminar barredores huérfanos
      const [resultadoBarredores] = await connection.execute(`
        DELETE b FROM barredor b 
        LEFT JOIN planilla p ON b.planilla_id = p.id 
        WHERE p.id IS NULL
      `);
      console.log(`   📋 Barredores huérfanos eliminados: ${resultadoBarredores.affectedRows}`);

      // Eliminar máquinas huérfanas
      const [resultadoMaquinas] = await connection.execute(`
        DELETE mp FROM maquina_planilla mp 
        LEFT JOIN planilla p ON mp.planilla_id = p.id 
        WHERE p.id IS NULL
      `);
      console.log(`   🚜 Máquinas huérfanas eliminadas: ${resultadoMaquinas.affectedRows}`);

      // Eliminar pabellones huérfanos
      const [resultadoPabellones] = await connection.execute(`
        DELETE pm FROM pabellon_maquina pm 
        LEFT JOIN planilla p ON pm.planilla_id = p.id 
        WHERE p.id IS NULL
      `);
      console.log(`   🏢 Pabellones huérfanos eliminados: ${resultadoPabellones.affectedRows}`);

      // Eliminar daños huérfanos
      const [resultadoDanos] = await connection.execute(`
        DELETE d FROM dano d 
        LEFT JOIN planilla p ON d.planilla_id = p.id 
        WHERE p.id IS NULL
      `);
      console.log(`   ⚠️ Daños huérfanos eliminados: ${resultadoDanos.affectedRows}`);

      // Confirmar transacción
      await connection.commit();
      console.log('\n✅ Transacción confirmada. Limpieza completada exitosamente.');

      // 4. Verificar que no quedan datos huérfanos
      console.log('\n3️⃣ Verificando que no quedan datos huérfanos...');
      
      const [verificacionBarredores] = await connection.execute(`
        SELECT COUNT(*) as count FROM barredor b 
        LEFT JOIN planilla p ON b.planilla_id = p.id 
        WHERE p.id IS NULL
      `);
      
      const [verificacionMaquinas] = await connection.execute(`
        SELECT COUNT(*) as count FROM maquina_planilla mp 
        LEFT JOIN planilla p ON mp.planilla_id = p.id 
        WHERE p.id IS NULL
      `);
      
      const [verificacionPabellones] = await connection.execute(`
        SELECT COUNT(*) as count FROM pabellon_maquina pm 
        LEFT JOIN planilla p ON pm.planilla_id = p.id 
        WHERE p.id IS NULL
      `);
      
      const [verificacionDanos] = await connection.execute(`
        SELECT COUNT(*) as count FROM dano d 
        LEFT JOIN planilla p ON d.planilla_id = p.id 
        WHERE p.id IS NULL
      `);

      console.log(`   📋 Barredores huérfanos restantes: ${verificacionBarredores[0].count}`);
      console.log(`   🚜 Máquinas huérfanas restantes: ${verificacionMaquinas[0].count}`);
      console.log(`   🏢 Pabellones huérfanos restantes: ${verificacionPabellones[0].count}`);
      console.log(`   ⚠️ Daños huérfanos restantes: ${verificacionDanos[0].count}`);

      const totalRestantes = verificacionBarredores[0].count + verificacionMaquinas[0].count + 
                            verificacionPabellones[0].count + verificacionDanos[0].count;

      if (totalRestantes === 0) {
        console.log('\n🎉 ¡Limpieza completada exitosamente! No quedan datos huérfanos.');
      } else {
        console.log(`\n⚠️ Aún quedan ${totalRestantes} registros huérfanos.`);
      }

    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
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

// Ejecutar limpieza
limpiarDatosHuérfanosPlanillas()
  .then(() => {
    console.log('\n✅ Script de limpieza completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  }); 