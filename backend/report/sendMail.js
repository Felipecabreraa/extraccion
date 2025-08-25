const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Configurar transportador de correo
 */
function createTransporter() {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Enviar reporte por correo
 * @param {Object} options - Opciones de envío
 * @param {string} options.filePath - Ruta del archivo PDF
 * @param {Array} options.recipients - Lista de destinatarios
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.date - Fecha del reporte
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendReport({ filePath, recipients, subject, date }) {
  try {
    console.log(`📧 Enviando reporte por correo para fecha: ${date}`);
    
    // Verificar que el archivo existe
    await fs.access(filePath);
    
    // Crear transportador
    const transporter = createTransporter();
    
    // Configurar opciones del correo
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipients.join(', '),
      subject: subject || `Reporte Diario de Daños – ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">📊 Reporte Diario de Daños</h2>
          <p>Se adjunta el reporte diario de daños correspondiente a la fecha <strong>${date}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">📋 Contenido del Reporte:</h3>
            <ul>
              <li>📋 Reporte Detallado - Metros Superficie (1era y 2da quincena)</li>
              <li>📊 Daños Acumulados - Reporte de daños acumulados</li>
              <li>🎯 Metas de Daños - Metas y proyecciones</li>
              <li>👥 Daños por Operador - Vista general</li>
              <li>🏗️ Consolidado (Zonas 1-2-3)</li>
              <li>👩 Hembra (Zona 1 y 3)</li>
              <li>👨 Macho (Zona 2)</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Este reporte fue generado automáticamente por el Sistema de Gestión de Daños.<br>
            Fecha de generación: ${new Date().toLocaleString('es-CL')}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Reporte_Danos_${date}.pdf`,
          path: filePath,
          contentType: 'application/pdf'
        }
      ]
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Correo enviado exitosamente a ${recipients.length} destinatarios`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipients: recipients,
      filePath: filePath
    };
    
  } catch (error) {
    console.error('❌ Error enviando correo:', error.message);
    throw new Error(`Error enviando correo: ${error.message}`);
  }
}

/**
 * Enviar reporte con configuración por defecto
 * @param {string} filePath - Ruta del archivo PDF
 * @param {string} date - Fecha del reporte
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendDailyReport(filePath, date) {
  const recipients = process.env.REPORT_RECIPIENTS 
    ? process.env.REPORT_RECIPIENTS.split(',') 
    : ['admin@empresa.com'];
  
  return sendReport({
    filePath,
    recipients,
    subject: `Reporte Diario de Daños – ${date}`,
    date
  });
}

/**
 * Enviar reporte semanal
 * @param {string} filePath - Ruta del archivo PDF
 * @param {string} startDate - Fecha de inicio de la semana
 * @param {string} endDate - Fecha de fin de la semana
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendWeeklyReport(filePath, startDate, endDate) {
  const recipients = process.env.WEEKLY_REPORT_RECIPIENTS 
    ? process.env.WEEKLY_REPORT_RECIPIENTS.split(',') 
    : ['admin@empresa.com', 'gerencia@empresa.com'];
  
  return sendReport({
    filePath,
    recipients,
    subject: `Reporte Semanal de Daños – ${startDate} al ${endDate}`,
    date: `${startDate} - ${endDate}`
  });
}

/**
 * Enviar reporte mensual
 * @param {string} filePath - Ruta del archivo PDF
 * @param {string} month - Mes del reporte (YYYY-MM)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendMonthlyReport(filePath, month) {
  const recipients = process.env.MONTHLY_REPORT_RECIPIENTS 
    ? process.env.MONTHLY_REPORT_RECIPIENTS.split(',') 
    : ['admin@empresa.com', 'gerencia@empresa.com', 'directores@empresa.com'];
  
  return sendReport({
    filePath,
    recipients,
    subject: `Reporte Mensual de Daños – ${month}`,
    date: month
  });
}

/**
 * Verificar configuración de correo
 * @returns {Promise<boolean>} - True si la configuración es válida
 */
async function verifyEmailConfig() {
  try {
    const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
      return false;
    }
    
    const transporter = createTransporter();
    await transporter.verify();
    
    console.log('✅ Configuración de correo válida');
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando configuración de correo:', error.message);
    return false;
  }
}

/**
 * Ejemplo de uso con cron
 */
function showCronEmailExample() {
  console.log('\n📧 Ejemplo de configuración cron con envío por correo:');
  console.log('');
  console.log('# Variables de entorno necesarias (.env):');
  console.log('SMTP_HOST=smtp.gmail.com');
  console.log('SMTP_PORT=587');
  console.log('SMTP_USER=tu-email@gmail.com');
  console.log('SMTP_PASS=tu-password-app');
  console.log('REPORT_RECIPIENTS=admin@empresa.com,gerente@empresa.com');
  console.log('');
  console.log('# Cron para reporte diario con envío por correo:');
  console.log('5 7 * * * cd /ruta/al/proyecto && node -e "');
  console.log('  const { generateDailyReportPDF } = require(\'./backend/report/generateDailyReport\');');
  console.log('  const { sendDailyReport } = require(\'./backend/report/sendMail\');');
  console.log('  (async () => {');
  console.log('    const date = new Date().toISOString().split(\'T\')[0];');
  console.log('    const filePath = await generateDailyReportPDF({ date });');
  console.log('    await sendDailyReport(filePath, date);');
  console.log('  })();');
  console.log('"');
}

module.exports = {
  sendReport,
  sendDailyReport,
  sendWeeklyReport,
  sendMonthlyReport,
  verifyEmailConfig,
  showCronEmailExample
};
