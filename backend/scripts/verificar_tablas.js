const sequelize = require('../src/config/database');

async function verificarTablas() {
  try {
    console.log('🔍 Verificando tablas existentes...\n');

    const [tablas] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('planilla', 'usuario', 'sector', 'maquina_planilla', 'maquina', 'operador', 'barredor', 'dano')
      ORDER BY TABLE_NAME
    `);
    
    console.log('Tablas encontradas:');
    tablas.forEach(tabla => {
      console.log(`   - ${tabla.TABLE_NAME}`);
    });

    // Verificar estructura de barredor si existe
    try {
      const [estructuraBarredor] = await sequelize.query('DESCRIBE barredor');
      console.log('\nEstructura de tabla barredor:');
      estructuraBarredor.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log('\n❌ Tabla barredor no existe');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarTablas(); 