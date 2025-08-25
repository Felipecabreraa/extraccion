const { generateDailyReportPDF } = require('../../report/generateDailyReport');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controlador para el generador de PDF integrado en el panel de control
 */
class GeneradorPDFController {
  
  /**
   * Generar PDF desde el panel de control
   */
  async generarPDF(req, res) {
    try {
      const { fecha, formato = 'A4', orientacion = 'vertical' } = req.body;
      
      console.log(`📊 Generando PDF desde panel de control para fecha: ${fecha}`);
      
      // Validar fecha
      if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
      
      // Configurar opciones
      const options = {
        date: fecha,
        baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        authToken: req.headers.authorization?.replace('Bearer ', ''),
        cookies: [],
        landscape: orientacion === 'horizontal'
      };
      
      // Generar PDF
      const startTime = Date.now();
      const filePath = await generateDailyReportPDF(options);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      // Obtener información del archivo
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);
      
      console.log(`✅ PDF generado exitosamente: ${fileName}`);
      
      return res.json({
        success: true,
        message: 'PDF generado exitosamente',
        data: {
          fileName,
          filePath: `/reports/${fileName}`,
          size: `${(stats.size / 1024).toFixed(2)} KB`,
          duration: `${duration} segundos`,
          fecha: fecha
        }
      });
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error generando PDF',
        error: error.message
      });
    }
  }
  
  /**
   * Obtener lista de PDFs generados
   */
  async listarPDFs(req, res) {
    try {
      const reportsDir = path.join(__dirname, '../../reports');
      
      // Verificar si el directorio existe
      try {
        await fs.access(reportsDir);
      } catch {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Leer archivos PDF
      const files = await fs.readdir(reportsDir);
      const pdfFiles = files
        .filter(file => file.endsWith('.pdf'))
        .map(file => {
          const filePath = path.join(reportsDir, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            filePath: `/reports/${file}`,
            size: `${(stats.size / 1024).toFixed(2)} KB`,
            fechaCreacion: stats.birthtime,
            fechaModificacion: stats.mtime
          };
        })
        .sort((a, b) => new Date(b.fechaModificacion) - new Date(a.fechaModificacion));
      
      return res.json({
        success: true,
        data: pdfFiles
      });
      
    } catch (error) {
      console.error('❌ Error listando PDFs:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error listando PDFs',
        error: error.message
      });
    }
  }
  
  /**
   * Descargar PDF específico
   */
  async descargarPDF(req, res) {
    try {
      const { fileName } = req.params;
      
      if (!fileName || !fileName.endsWith('.pdf')) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de archivo inválido'
        });
      }
      
      const filePath = path.join(__dirname, '../../reports', fileName);
      
      // Verificar que el archivo existe
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }
      
      // Enviar archivo
      res.download(filePath, fileName);
      
    } catch (error) {
      console.error('❌ Error descargando PDF:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error descargando PDF',
        error: error.message
      });
    }
  }
  
  /**
   * Eliminar PDF específico
   */
  async eliminarPDF(req, res) {
    try {
      const { fileName } = req.params;
      
      if (!fileName || !fileName.endsWith('.pdf')) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de archivo inválido'
        });
      }
      
      const filePath = path.join(__dirname, '../../reports', fileName);
      
      // Verificar que el archivo existe
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }
      
      // Eliminar archivo
      await fs.unlink(filePath);
      
      console.log(`🗑️ PDF eliminado: ${fileName}`);
      
      return res.json({
        success: true,
        message: 'PDF eliminado exitosamente'
      });
      
    } catch (error) {
      console.error('❌ Error eliminando PDF:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error eliminando PDF',
        error: error.message
      });
    }
  }
  
  /**
   * Obtener estadísticas de generación
   */
  async obtenerEstadisticas(req, res) {
    try {
      const reportsDir = path.join(__dirname, '../../reports');
      
      // Verificar si el directorio existe
      try {
        await fs.access(reportsDir);
      } catch {
        return res.json({
          success: true,
          data: {
            totalPDFs: 0,
            tamañoTotal: '0 KB',
            ultimaGeneracion: null,
            pdfsRecientes: []
          }
        });
      }
      
      // Leer archivos PDF
      const files = await fs.readdir(reportsDir);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      
      let tamañoTotal = 0;
      let ultimaGeneracion = null;
      const pdfsRecientes = [];
      
      for (const file of pdfFiles) {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);
        
        tamañoTotal += stats.size;
        
        if (!ultimaGeneracion || stats.mtime > ultimaGeneracion) {
          ultimaGeneracion = stats.mtime;
        }
        
        pdfsRecientes.push({
          fileName: file,
          fecha: stats.mtime,
          size: stats.size
        });
      }
      
      // Ordenar por fecha y tomar los 5 más recientes
      pdfsRecientes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      const pdfsRecientesFormateados = pdfsRecientes.slice(0, 5).map(pdf => ({
        fileName: pdf.fileName,
        fecha: pdf.fecha,
        size: `${(pdf.size / 1024).toFixed(2)} KB`
      }));
      
      return res.json({
        success: true,
        data: {
          totalPDFs: pdfFiles.length,
          tamañoTotal: `${(tamañoTotal / 1024).toFixed(2)} KB`,
          ultimaGeneracion: ultimaGeneracion,
          pdfsRecientes: pdfsRecientesFormateados
        }
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new GeneradorPDFController();
