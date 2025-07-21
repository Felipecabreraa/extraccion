const sequelize = require('./src/config/database');

async function limpiarBaseDatosConDelete() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Desactivar verificación de claves foráneas temporalmente
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Lista de tablas en orden de eliminación (de más dependiente a menos dependiente)
    const tablas = [
      'dano',
      'barredor', 
      'maquina_planilla',
      'pabellon_maquina',
      'planilla',
      'pabellon',
      'sector',
      'zona',
      'maquina',
      'operador',
      'barredor_catalogo',
      'usuario'
    ];

    console.log('🗑️  Iniciando limpieza de tablas con DELETE...');

    for (const tabla of tablas) {
      try {
        // Contar registros antes de eliminar
        const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const registrosAntes = countResult[0].count;
        
        // Eliminar todos los registros
        await sequelize.query(`DELETE FROM ${tabla}`);
        console.log(`✅ Tabla ${tabla} vaciada (${registrosAntes} registros eliminados)`);
        
        // Reiniciar auto-increment
        await sequelize.query(`ALTER TABLE ${tabla} AUTO_INCREMENT = 1`);
        console.log(`🔄 Auto-increment de ${tabla} reiniciado a 1`);
      } catch (error) {
        console.error(`❌ Error al limpiar tabla ${tabla}:`, error.message);
      }
    }

    // Reactivar verificación de claves foráneas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n🎉 ¡Limpieza completada exitosamente!');
    console.log('📊 Todas las tablas han sido vaciadas y los IDs reiniciados a 1');

    // Verificar que las tablas estén vacías
    console.log('\n🔍 Verificando estado de las tablas...');
    for (const tabla of tablas) {
      try {
        const [resultados] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const count = resultados[0].count;
        console.log(`📋 ${tabla}: ${count} registros`);
      } catch (error) {
        console.error(`❌ Error al verificar ${tabla}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la función
limpiarBaseDatosConDelete(); 