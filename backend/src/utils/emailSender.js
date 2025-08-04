const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailSender {
  constructor() {
    this.transporter = null;
    this.setupTransporter();
  }

  setupTransporter() {
    // Configuración del transportador de email
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendDailyReport(pdfPath, recipients = []) {
    try {
      console.log('📧 Enviando informe diario por email...');

      // Verificar que el archivo PDF existe
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`El archivo PDF no existe: ${pdfPath}`);
      }

      // Configurar destinatarios por defecto si no se proporcionan
      const defaultRecipients = [
        process.env.REPORT_EMAIL_1,
        process.env.REPORT_EMAIL_2,
        process.env.REPORT_EMAIL_3
      ].filter(email => email);

      const emailRecipients = recipients.length > 0 ? recipients : defaultRecipients;

      if (emailRecipients.length === 0) {
        throw new Error('No se han configurado destinatarios para el informe');
      }

      const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const fileName = path.basename(pdfPath);
      const fileSize = (fs.statSync(pdfPath).size / 1024).toFixed(2); // KB

      console.log(`📎 Archivo: ${fileName} (${fileSize} KB)`);
      console.log(`👥 Destinatarios: ${emailRecipients.join(', ')}`);

      // Configurar el email
      const mailOptions = {
        from: `"Sistema de Reportes" <${process.env.SMTP_USER}>`,
        to: emailRecipients.join(', '),
        subject: `📊 Informe Diario de Daños 2025 - ${new Date().toLocaleDateString('es-ES')}`,
        html: this.generateEmailHTML(today, fileName, fileSize),
        attachments: [
          {
            filename: fileName,
            path: pdfPath,
            contentType: 'application/pdf'
          }
        ]
      };

      // Enviar el email
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email enviado exitosamente');
      console.log(`📧 Message ID: ${info.messageId}`);
      console.log(`📬 Enviado a: ${info.accepted.join(', ')}`);

      return {
        success: true,
        messageId: info.messageId,
        recipients: info.accepted,
        fileSize: fileSize
      };

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  generateEmailHTML(date, fileName, fileSize) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informe Diario de Daños 2025</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .content {
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
            color: #333;
            font-size: 18px;
            margin-bottom: 10px;
            border-left: 4px solid #007bff;
            padding-left: 15px;
          }
          .section p {
            margin: 8px 0;
            color: #555;
          }
          .highlight {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #2196f3;
            margin: 20px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .stat-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            display: block;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #666;
            font-size: 12px;
          }
          .attachment-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
          }
          .btn:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Informe Diario de Daños 2025</h1>
            <p>Fecha: ${date}</p>
            <p>Sistema Automático de Reportes</p>
          </div>

          <div class="content">
            <div class="section">
              <h2>🎯 Resumen del Informe</h2>
              <p>Se ha generado automáticamente el informe diario de daños correspondiente al día de hoy. Este documento contiene:</p>
              
              <div class="highlight">
                <ul style="margin: 0; padding-left: 20px;">
                  <li>📏 Métricas de superficie limpiada</li>
                  <li>⚠️ Estadísticas de daños por mes</li>
                  <li>👥 Análisis por operador</li>
                  <li>🗺️ Distribución por zona</li>
                  <li>📈 Comparación Hembra vs Macho</li>
                  <li>📊 Gráficos estadísticos</li>
                </ul>
              </div>
            </div>

            <div class="section">
              <h2>📎 Información del Archivo</h2>
              <div class="attachment-info">
                <p><strong>Nombre del archivo:</strong> ${fileName}</p>
                <p><strong>Tamaño:</strong> ${fileSize} KB</p>
                <p><strong>Formato:</strong> PDF</p>
                <p><strong>Generado:</strong> ${new Date().toLocaleString('es-ES')}</p>
              </div>
            </div>

            <div class="section">
              <h2>📋 Contenido del Informe</h2>
              
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-number">📏</span>
                  <span class="stat-label">Superficie Limpiada</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">⚠️</span>
                  <span class="stat-label">Daños Registrados</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">👥</span>
                  <span class="stat-label">Operadores Activos</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">🗺️</span>
                  <span class="stat-label">Sectores Activos</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>📊 Secciones Principales</h2>
              <p><strong>1. Resumen Ejecutivo:</strong> Métricas generales del año 2025</p>
              <p><strong>2. Métricas de Superficie:</strong> Análisis de metros² limpiados por mes</p>
              <p><strong>3. Métricas de Daños:</strong> Comparación real vs presupuesto</p>
              <p><strong>4. Análisis por Operador:</strong> Rendimiento individual</p>
              <p><strong>5. Distribución por Zona:</strong> Concentración geográfica</p>
              <p><strong>6. Comparación Hembra/Macho:</strong> Análisis por tipo</p>
              <p><strong>7. Gráficos Estadísticos:</strong> Visualizaciones automáticas</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>⚠️ Importante:</strong> Este es un informe automático generado por el sistema.</p>
            <p>Para consultas o modificaciones, contacte al administrador del sistema.</p>
            <p>📧 Sistema de Reportes Automáticos | Generado el ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      console.log('🔍 Probando conexión de email...');
      
      const info = await this.transporter.verify();
      console.log('✅ Conexión de email exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error en conexión de email:', error);
      return false;
    }
  }

  async sendTestEmail(recipient) {
    try {
      console.log('🧪 Enviando email de prueba...');

      const mailOptions = {
        from: `"Sistema de Reportes" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject: '🧪 Prueba de Sistema de Reportes Automáticos',
        html: `
          <h2>🧪 Email de Prueba</h2>
          <p>Este es un email de prueba para verificar la configuración del sistema de reportes automáticos.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Estado:</strong> ✅ Sistema funcionando correctamente</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de prueba enviado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de prueba:', error);
      return false;
    }
  }
}

module.exports = EmailSender; 