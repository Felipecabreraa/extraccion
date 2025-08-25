const { generatePDF, generateSampleHTML } = require('../../alternative-pdf-generator');

/**
 * Controlador simple para generar PDFs
 */
class GeneradorPDFSimpleController {
  
  /**
   * Generar PDF simple
   */
  async generar(req, res) {
    try {
      const { fecha, orientacion = 'vertical' } = req.body;
      
      console.log(`📊 Generando PDF simple para fecha: ${fecha}, orientación: ${orientacion}`);
      
      // Validar fecha
      if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
      
      // Generar HTML
      const htmlContent = generateSampleHTML({ fecha, orientacion });
      
      // Configurar opciones de PDF
      const pdfOptions = {
        format: 'A4',
        landscape: orientacion === 'horizontal',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      };
      
      // Generar PDF
      const startTime = Date.now();
      const result = await generatePDF(htmlContent, pdfOptions);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log(`✅ PDF generado exitosamente (${result.size} bytes) en ${duration}s`);
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-${fecha}.pdf"`);
      res.setHeader('Content-Length', result.size);
      
      // Enviar PDF
      res.send(result.pdf);
      
    } catch (error) {
      console.error('❌ Error generando PDF simple:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error generando PDF',
        error: error.message
      });
    }
  }
  
  /**
   * Generar PDF con contenido personalizado
   */
  async generarPersonalizado(req, res) {
    try {
      const { html, options = {} } = req.body;
      
      console.log('📊 Generando PDF personalizado');
      
      if (!html) {
        return res.status(400).json({
          success: false,
          message: 'Contenido HTML requerido'
        });
      }
      
      // Configurar opciones por defecto
      const defaultOptions = {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      };
      
      const pdfOptions = { ...defaultOptions, ...options };
      
      // Generar PDF
      const startTime = Date.now();
      const result = await generatePDF(html, pdfOptions);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log(`✅ PDF personalizado generado exitosamente (${result.size} bytes) en ${duration}s`);
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-personalizado-${Date.now()}.pdf"`);
      res.setHeader('Content-Length', result.size);
      
      // Enviar PDF
      res.send(result.pdf);
      
    } catch (error) {
      console.error('❌ Error generando PDF personalizado:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error generando PDF',
        error: error.message
      });
    }
  }
  
  /**
   * Probar generación de PDF
   */
  async probar(req, res) {
    try {
      console.log('🧪 Probando generación de PDF...');
      
      // Generar HTML de prueba
      const htmlContent = generateSampleHTML({ 
        fecha: new Date().toISOString().split('T')[0], 
        orientacion: 'vertical' 
      });
      
      // Configurar opciones básicas
      const pdfOptions = {
        format: 'A4',
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        printBackground: true
      };
      
      // Generar PDF
      const result = await generatePDF(htmlContent, pdfOptions);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log(`✅ Prueba exitosa - PDF generado (${result.size} bytes)`);
      
      return res.json({
        success: true,
        message: 'Prueba de generación de PDF exitosa',
        data: {
          size: result.size,
          sizeKB: (result.size / 1024).toFixed(2)
        }
      });
      
    } catch (error) {
      console.error('❌ Error en prueba de PDF:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error en prueba de generación de PDF',
        error: error.message
      });
    }
  }
}

module.exports = new GeneradorPDFSimpleController();
