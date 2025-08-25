const { Sequelize } = require('sequelize');

// Configuración simple para probar
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: '',
  database: 'extraccion',
  logging: false
});

async function probarServidor() {
  console.log('🔍 Probando conexión simple...\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Probar una consulta simple
    const [result] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Consulta simple exitosa:', result[0]);
    
    // Verificar si la vista existe
    try {
      const [viewResult] = await sequelize.query('SELECT COUNT(*) as total FROM vw_ordenes_unificada_completa LIMIT 1');
      console.log('✅ Vista vw_ordenes_unificada_completa existe');
      console.log('📊 Total registros:', viewResult[0].total);
    } catch (viewError) {
      console.log('❌ Error con la vista:', viewError.message);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
}

probarServidor().catch(console.error);
