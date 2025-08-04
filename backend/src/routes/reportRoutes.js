const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/auth');

const reportController = new ReportController();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// 🚀 Generar y enviar informe diario completo
router.post('/generate-and-send', async (req, res) => {
  try {
    const { recipients } = req.body;
    
    console.log('📊 Solicitud de generación y envío de informe diario');
    console.log(`👥 Destinatarios adicionales: ${recipients ? recipients.join(', ') : 'Ninguno'}`);
    
    const result = await reportController.generateAndSendDailyReport(recipients);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Informe generado y enviado exitosamente',
        data: {
          pdfPath: result.pdfPath,
          emailResult: result.emailResult,
          generationTime: result.generationTime,
          totalTime: result.totalTime,
          timestamp: result.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error en el proceso de reporte',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error en ruta generate-and-send:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// 📊 Generar solo el PDF (sin enviar)
router.post('/generate-pdf', async (req, res) => {
  try {
    console.log('📊 Solicitud de generación de PDF');
    
    const result = await reportController.generateReportOnly();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'PDF generado exitosamente',
        data: {
          pdfPath: result.pdfPath,
          generationTime: result.generationTime,
          timestamp: result.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error generando PDF',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error en ruta generate-pdf:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// 📧 Enviar PDF existente por email
router.post('/send-pdf', async (req, res) => {
  try {
    const { pdfPath, recipients } = req.body;
    
    if (!pdfPath) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere la ruta del archivo PDF'
      });
    }
    
    console.log('📧 Solicitud de envío de PDF existente');
    console.log(`📎 Archivo: ${pdfPath}`);
    console.log(`👥 Destinatarios: ${recipients ? recipients.join(', ') : 'Por defecto'}`);
    
    const result = await reportController.sendReportOnly(pdfPath, recipients);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'PDF enviado exitosamente',
        data: {
          emailResult: result.emailResult,
          timestamp: result.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error enviando PDF',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error en ruta send-pdf:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// 🧪 Probar sistema completo
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Solicitud de prueba del sistema');
    
    const result = await reportController.testSystem();
    
    res.json({
      success: result.success,
      message: result.success ? 'Sistema funcionando correctamente' : 'Problemas detectados en el sistema',
      data: {
        results: result.results,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    console.error('❌ Error en ruta test:', error);
    res.status(500).json({
      success: false,
      message: 'Error en pruebas del sistema',
      error: error.message
    });
  }
});

// 📋 Obtener estado del reporte de hoy
router.get('/status', async (req, res) => {
  try {
    console.log('📋 Consultando estado del reporte');
    
    const status = await reportController.getReportStatus();
    
    res.json({
      success: true,
      message: 'Estado del reporte obtenido',
      data: status
    });
  } catch (error) {
    console.error('❌ Error en ruta status:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado del reporte',
      error: error.message
    });
  }
});

// 📁 Listar reportes recientes
router.get('/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    console.log(`📁 Listando reportes recientes (límite: ${limit})`);
    
    const reports = await reportController.listRecentReports(parseInt(limit));
    
    res.json({
      success: true,
      message: 'Reportes listados exitosamente',
      data: {
        reports,
        count: reports.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Error en ruta list:', error);
    res.status(500).json({
      success: false,
      message: 'Error listando reportes',
      error: error.message
    });
  }
});

// 🗑️ Eliminar reportes antiguos
router.delete('/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.query;
    
    console.log(`🗑️ Eliminando reportes antiguos (mantener: ${daysToKeep} días)`);
    
    const result = await reportController.deleteOldReports(parseInt(daysToKeep));
    
    res.json({
      success: true,
      message: 'Limpieza completada',
      data: result
    });
  } catch (error) {
    console.error('❌ Error en ruta cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error en limpieza de reportes',
      error: error.message
    });
  }
});

// 📊 Obtener estadísticas del sistema
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas del sistema');
    
    const status = await reportController.getReportStatus();
    const recentReports = await reportController.listRecentReports(30);
    
    const stats = {
      system: {
        emailConfigured: status.emailConfigured,
        recipientsConfigured: status.recipientsConfigured,
        todayReportExists: status.fileExists
      },
      reports: {
        totalRecent: recentReports.length,
        totalSize: recentReports.reduce((sum, report) => sum + report.size, 0),
        averageSize: recentReports.length > 0 ? 
          Math.round(recentReports.reduce((sum, report) => sum + report.size, 0) / recentReports.length) : 0
      },
      lastReport: recentReports.length > 0 ? recentReports[0] : null
    };
    
    res.json({
      success: true,
      message: 'Estadísticas obtenidas',
      data: stats
    });
  } catch (error) {
    console.error('❌ Error en ruta stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

// 🔧 Configuración del sistema
router.get('/config', async (req, res) => {
  try {
    console.log('🔧 Consultando configuración del sistema');
    
    const config = {
      email: {
        smtpHost: process.env.SMTP_HOST || 'No configurado',
        smtpPort: process.env.SMTP_PORT || 'No configurado',
        smtpUser: process.env.SMTP_USER ? 'Configurado' : 'No configurado',
        smtpPass: process.env.SMTP_PASS ? 'Configurado' : 'No configurado'
      },
      recipients: {
        email1: process.env.REPORT_EMAIL_1 || 'No configurado',
        email2: process.env.REPORT_EMAIL_2 || 'No configurado',
        email3: process.env.REPORT_EMAIL_3 || 'No configurado'
      },
      cleanup: {
        enabled: process.env.CLEANUP_TEMP_FILES === 'true',
        daysToKeep: process.env.REPORTS_DAYS_TO_KEEP || 30
      }
    };
    
    res.json({
      success: true,
      message: 'Configuración obtenida',
      data: config
    });
  } catch (error) {
    console.error('❌ Error en ruta config:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuración',
      error: error.message
    });
  }
});

module.exports = router; 