const sequelize = require('../src/config/database');

async function verificarEstructura() {
  try {
    console.log('🔍 Verificando estructura de tabla planilla...\n');

    const [estructura] = await sequelize.query('DESCRIBE planilla');
    
    console.log('Estructura de tabla planilla:');
    estructura.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructura(); 