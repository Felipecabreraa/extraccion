const ExcelReportGenerator = require('../src/utils/excelGenerator');

async function generateExcelReport() {
  try {
    console.log('🚀 Iniciando generación de reporte Excel...');
    
    const excelGenerator = new ExcelReportGenerator();
    const filePath = await excelGenerator.generateDailyExcelReport();
    
    console.log('✅ Reporte Excel generado exitosamente!');
    console.log(`📁 Archivo: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('❌ Error generando reporte Excel:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateExcelReport()
    .then(() => {
      console.log('🎉 Proceso completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { generateExcelReport }; 