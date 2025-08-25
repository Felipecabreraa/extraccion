require('./backend/config-db.js');
const { generateDailyReportPDF } = require('./backend/report/generateDailyReport');

async function probarGraficosReporte() {
  try {
    console.log('🎨 Probando generación de reporte con gráficos...');
    
    // Usar la fecha actual del sistema
    const fechaActual = new Date();
    const fecha = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const resultado = await generateDailyReportPDF({
      date: fecha,
      baseUrl: 'http://localhost:3000',
      authToken: null,
      cookies: []
    });
    
    console.log('✅ Reporte con gráficos generado exitosamente');
    console.log('📄 Archivo generado:', resultado);
    
  } catch (error) {
    console.error('❌ Error probando gráficos:', error.message);
    console.error('Stack:', error.stack);
  }
}

probarGraficosReporte();
