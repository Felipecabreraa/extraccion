const sequelize = require('./src/config/database');

async function checkData() {
  try {
    console.log('🔍 Verificando datos en la vista...');
    
    // Verificar datos por año y mes
    const [datosPorMes] = await sequelize.query(`
      SELECT 
        YEAR(fechaOrdenServicio) as anio, 
        MONTH(fechaOrdenServicio) as mes, 
        COUNT(*) as total 
      FROM vw_ordenes_2025_actual 
      GROUP BY YEAR(fechaOrdenServicio), MONTH(fechaOrdenServicio) 
      ORDER BY anio DESC, mes DESC 
      LIMIT 12
    `);
    
    console.log('📊 Datos por año y mes:', datosPorMes);
    
    // Verificar datos de los últimos 6 meses
    const [ultimos6Meses] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones
      FROM vw_ordenes_2025_actual
      WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `);
    
    console.log('📈 Datos últimos 6 meses:', ultimos6Meses);
    
    // Verificar datos del mes actual
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [datosMesActual] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones
      FROM vw_ordenes_2025_actual
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
    `, {
      replacements: [currentYear, currentMonth]
    });
    
    console.log(`📅 Datos del mes actual (${currentMonth}/${currentYear}):`, datosMesActual[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData(); 