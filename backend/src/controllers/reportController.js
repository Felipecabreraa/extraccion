const PDFReportGenerator = require('../utils/pdfGenerator');
const EmailSender = require('../utils/emailSender');
const fs = require('fs');
const path = require('path');

class ReportController {
  constructor() {
    this.pdfGenerator = new PDFReportGenerator();
    this.emailSender = new EmailSender();
  }

  async generateAndSendDailyReport(recipients = []) {
    try {
      console.log('🚀 Iniciando proceso de generación y envío de informe diario...');
      
      const startTime = Date.now();
      
      // Paso 1: Generar el PDF
      console.log('📊 Paso 1: Generando informe PDF...');
      const pdfPath = await this.pdfGenerator.generateDailyReport();
      
      const generationTime = Date.now() - startTime;
      console.log(`✅ PDF generado en ${generationTime}ms`);
      
      // Paso 2: Enviar por email
      console.log('📧 Paso 2: Enviando informe por email...');
      const emailResult = await this.emailSender.sendDailyReport(pdfPath, recipients);
      
      const totalTime = Date.now() - startTime;
      
      // Paso 3: Limpiar archivo temporal (opcional)
      if (process.env.CLEANUP_TEMP_FILES === 'true') {
        try {
          fs.unlinkSync(pdfPath);
          console.log('🧹 Archivo temporal eliminado');
        } catch (error) {
          console.log('⚠️ No se pudo eliminar archivo temporal:', error.message);
        }
      }
      
      const result = {
        success: true,
        pdfPath,
        emailResult,
        generationTime,
        totalTime,
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ Proceso completado exitosamente');
      console.log(`📊 Tiempo total: ${totalTime}ms`);
      console.log(`📧 Email enviado a: ${emailResult.recipients.join(', ')}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en el proceso de reporte:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateReportOnly() {
    try {
      console.log('📊 Generando solo el informe PDF...');
      
      const startTime = Date.now();
      const pdfPath = await this.pdfGenerator.generateDailyReport();
      const generationTime = Date.now() - startTime;
      
      console.log(`✅ PDF generado en ${generationTime}ms: ${pdfPath}`);
      
      return {
        success: true,
        pdfPath,
        generationTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async sendReportOnly(pdfPath, recipients = []) {
    try {
      console.log('📧 Enviando informe existente por email...');
      
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`El archivo PDF no existe: ${pdfPath}`);
      }
      
      const emailResult = await this.emailSender.sendDailyReport(pdfPath, recipients);
      
      return {
        success: true,
        emailResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testSystem() {
    try {
      console.log('🧪 Probando sistema de reportes...');
      
      const results = {
        emailConnection: false,
        pdfGeneration: false,
        testEmail: false
      };
      
      // Probar conexión de email
      console.log('1. Probando conexión de email...');
      results.emailConnection = await this.emailSender.testConnection();
      
      // Probar generación de PDF
      console.log('2. Probando generación de PDF...');
      const pdfResult = await this.generateReportOnly();
      results.pdfGeneration = pdfResult.success;
      
      // Probar envío de email de prueba
      if (results.emailConnection && process.env.SMTP_USER) {
        console.log('3. Enviando email de prueba...');
        results.testEmail = await this.emailSender.sendTestEmail(process.env.SMTP_USER);
      }
      
      console.log('✅ Pruebas completadas:', results);
      
      return {
        success: results.emailConnection && results.pdfGeneration,
        results,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error en pruebas del sistema:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getReportStatus() {
    try {
      const reportsDir = path.join(__dirname, '../../reports');
      const today = new Date().toISOString().split('T')[0];
      const expectedFileName = `informe_danos_${today}.pdf`;
      const expectedPath = path.join(reportsDir, expectedFileName);
      
      const status = {
        today: today,
        expectedFile: expectedFileName,
        fileExists: false,
        fileSize: 0,
        lastModified: null,
        emailConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
        recipientsConfigured: !!(process.env.REPORT_EMAIL_1 || process.env.REPORT_EMAIL_2 || process.env.REPORT_EMAIL_3)
      };
      
      if (fs.existsSync(expectedPath)) {
        const stats = fs.statSync(expectedPath);
        status.fileExists = true;
        status.fileSize = stats.size;
        status.lastModified = stats.mtime;
      }
      
      return status;
      
    } catch (error) {
      console.error('❌ Error obteniendo estado del reporte:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async listRecentReports(limit = 10) {
    try {
      const reportsDir = path.join(__dirname, '../../reports');
      
      if (!fs.existsSync(reportsDir)) {
        return [];
      }
      
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.endsWith('.pdf'))
        .map(file => {
          const filePath = path.join(reportsDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.modified - a.modified)
        .slice(0, limit);
      
      return files;
      
    } catch (error) {
      console.error('❌ Error listando reportes:', error);
      return [];
    }
  }

  async deleteOldReports(daysToKeep = 30) {
    try {
      const reportsDir = path.join(__dirname, '../../reports');
      
      if (!fs.existsSync(reportsDir)) {
        return { deleted: 0, error: 'Directorio no existe' };
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.endsWith('.pdf'))
        .map(file => {
          const filePath = path.join(reportsDir, file);
          const stats = fs.statSync(filePath);
          return { file, path: filePath, modified: stats.mtime };
        })
        .filter(file => file.modified < cutoffDate);
      
      let deletedCount = 0;
      
      for (const file of files) {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
          console.log(`🗑️ Eliminado: ${file.file}`);
        } catch (error) {
          console.error(`❌ Error eliminando ${file.file}:`, error.message);
        }
      }
      
      return {
        deleted: deletedCount,
        total: files.length,
        cutoffDate: cutoffDate.toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error eliminando reportes antiguos:', error);
      return { deleted: 0, error: error.message };
    }
  }
}

module.exports = ReportController; 