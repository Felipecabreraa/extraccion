#!/usr/bin/env node

/**
 * 🚀 Script de Generación Automática de Informe Diario de Daños 2025
 * 
 * Este script se ejecuta automáticamente cada día para:
 * 1. Generar un informe PDF con estadísticas de daños
 * 2. Enviar el informe por email a los destinatarios configurados
 * 3. Registrar el proceso en logs
 * 
 * Uso:
 * - Manual: node scripts/generate-daily-report.js
 * - Automático: Configurar en cron o Programador de tareas
 */

require('dotenv').config();
const ReportController = require('../src/controllers/reportController');
const fs = require('fs');
const path = require('path');

class DailyReportAutomation {
  constructor() {
    this.reportController = new ReportController();
    this.logFile = path.join(__dirname, '../logs/daily-report.log');
  }

  async run() {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log('🚀 ==========================================');
    console.log('🚀 INICIO: Generación Automática de Informe Diario');
    console.log('🚀 ==========================================');
    console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log('');

    try {
      // Verificar configuración
      await this.checkConfiguration();
      
      // Generar y enviar informe
      const result = await this.reportController.generateAndSendDailyReport();
      
      // Registrar resultado
      await this.logResult(result, startTime);
      
      // Mostrar resumen
      this.showSummary(result, startTime);
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ ERROR CRÍTICO:', error);
      await this.logError(error, startTime);
      process.exit(1);
    }
  }

  async checkConfiguration() {
    console.log('🔍 Verificando configuración del sistema...');
    
    const requiredEnvVars = [
      'SMTP_HOST',
      'SMTP_USER', 
      'SMTP_PASS',
      'REPORT_EMAIL_1'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    }
    
    console.log('✅ Configuración verificada correctamente');
    console.log(`📧 SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`);
    console.log(`👤 Usuario: ${process.env.SMTP_USER}`);
    console.log(`📬 Destinatarios: ${process.env.REPORT_EMAIL_1}${process.env.REPORT_EMAIL_2 ? ', ' + process.env.REPORT_EMAIL_2 : ''}${process.env.REPORT_EMAIL_3 ? ', ' + process.env.REPORT_EMAIL_3 : ''}`);
    console.log('');
  }

  async logResult(result, startTime) {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      success: result.success,
      duration: Date.now() - startTime,
      pdfPath: result.pdfPath,
      emailRecipients: result.emailResult?.recipients || [],
      generationTime: result.generationTime,
      totalTime: result.totalTime,
      error: result.error
    };

    const logLine = `[${logEntry.timestamp}] ${logEntry.success ? 'SUCCESS' : 'ERROR'} - ${logEntry.duration}ms - ${logEntry.error || 'OK'}\n`;
    
    fs.appendFileSync(this.logFile, logLine);
  }

  async logError(error, startTime) {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
      stack: error.stack
    };

    const logLine = `[${logEntry.timestamp}] ERROR - ${logEntry.duration}ms - ${logEntry.error}\n`;
    
    fs.appendFileSync(this.logFile, logLine);
  }

  showSummary(result, startTime) {
    const totalTime = Date.now() - startTime;
    
    console.log('');
    console.log('📊 ==========================================');
    console.log('📊 RESUMEN DEL PROCESO');
    console.log('📊 ==========================================');
    
    if (result.success) {
      console.log('✅ Estado: EXITOSO');
      console.log(`📎 PDF: ${result.pdfPath}`);
      console.log(`⏱️ Tiempo de generación: ${result.generationTime}ms`);
      console.log(`⏱️ Tiempo total: ${result.totalTime}ms`);
      console.log(`📧 Enviado a: ${result.emailResult.recipients.join(', ')}`);
      console.log(`📦 Tamaño del archivo: ${result.emailResult.fileSize} KB`);
    } else {
      console.log('❌ Estado: FALLIDO');
      console.log(`❌ Error: ${result.error}`);
    }
    
    console.log(`⏱️ Tiempo total del script: ${totalTime}ms`);
    console.log('📊 ==========================================');
    console.log('');
  }

  async testSystem() {
    console.log('🧪 Ejecutando pruebas del sistema...');
    
    try {
      const testResult = await this.reportController.testSystem();
      
      console.log('📊 Resultados de las pruebas:');
      console.log(`  📧 Conexión de email: ${testResult.results.emailConnection ? '✅' : '❌'}`);
      console.log(`  📊 Generación de PDF: ${testResult.results.pdfGeneration ? '✅' : '❌'}`);
      console.log(`  📧 Email de prueba: ${testResult.results.testEmail ? '✅' : '❌'}`);
      
      if (testResult.success) {
        console.log('✅ Sistema funcionando correctamente');
      } else {
        console.log('❌ Problemas detectados en el sistema');
      }
      
      return testResult.success;
      
    } catch (error) {
      console.error('❌ Error en pruebas:', error);
      return false;
    }
  }

  async showStatus() {
    console.log('📋 Consultando estado del sistema...');
    
    try {
      const status = await this.reportController.getReportStatus();
      const stats = await this.reportController.listRecentReports(5);
      
      console.log('📊 Estado del sistema:');
      console.log(`  📅 Fecha actual: ${status.today}`);
      console.log(`  📄 Reporte de hoy: ${status.fileExists ? '✅ Existe' : '❌ No existe'}`);
      console.log(`  📧 Email configurado: ${status.emailConfigured ? '✅' : '❌'}`);
      console.log(`  👥 Destinatarios configurados: ${status.recipientsConfigured ? '✅' : '❌'}`);
      
      if (status.fileExists) {
        console.log(`  📦 Tamaño del archivo: ${(status.fileSize / 1024).toFixed(2)} KB`);
        console.log(`  📅 Última modificación: ${status.lastModified}`);
      }
      
      console.log(`  📁 Reportes recientes: ${stats.length} archivos`);
      
      return status;
      
    } catch (error) {
      console.error('❌ Error consultando estado:', error);
      return null;
    }
  }
}

// Función principal
async function main() {
  const automation = new DailyReportAutomation();
  
  // Procesar argumentos de línea de comandos
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await automation.testSystem();
  } else if (args.includes('--status')) {
    await automation.showStatus();
  } else if (args.includes('--pdf-only')) {
    console.log('📊 Generando solo el informe PDF...');
    const result = await automation.reportController.generateReportOnly();
    console.log(`✅ PDF generado en ${result.generationTime}ms: ${result.pdfPath}`);
  } else if (args.includes('--help')) {
    console.log(`
🚀 Script de Generación Automática de Informe Diario de Daños 2025

Uso:
  node scripts/generate-daily-report.js [opciones]

Opciones:
  --test      Ejecutar pruebas del sistema
  --status    Mostrar estado del sistema
  --pdf-only  Solo generar PDF (sin enviar email)
  --help      Mostrar esta ayuda

Sin opciones: Ejecutar generación y envío automático

Ejemplos:
  node scripts/generate-daily-report.js
  node scripts/generate-daily-report.js --test
  node scripts/generate-daily-report.js --status
  node scripts/generate-daily-report.js --pdf-only
    `);
  } else {
    // Ejecución normal
    await automation.run();
  }
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ ERROR NO CAPTURADO:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESA RECHAZADA NO MANEJADA:', reason);
  process.exit(1);
});

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error en ejecución principal:', error);
    process.exit(1);
  });
}

module.exports = DailyReportAutomation; 