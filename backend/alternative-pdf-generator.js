const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Función principal para generar PDF
async function generatePDF(htmlContent, options = {}) {
  let browser = null;
  
  try {
    console.log('🔧 Iniciando generación de PDF...');
    
    // Configuración por defecto
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
    
    console.log('📄 Configuración PDF:', JSON.stringify(pdfOptions, null, 2));
    
    // Intentar múltiples configuraciones de Puppeteer
    const puppeteerConfigs = [
      {
        name: 'Configuración estándar',
        options: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        }
      },
      {
        name: 'Configuración mínima',
        options: {
          headless: true,
          args: ['--no-sandbox']
        }
      },
      {
        name: 'Configuración con Chrome descargado',
        options: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
        }
      }
    ];
    
    let lastError = null;
    
    for (const config of puppeteerConfigs) {
      try {
        console.log(`🔄 Intentando: ${config.name}`);
        
        browser = await puppeteer.launch(config.options);
        console.log(`✅ ${config.name} exitosa`);
        
        const page = await browser.newPage();
        
        // Configurar viewport
        await page.setViewport({ width: 1200, height: 800 });
        
        // Establecer contenido HTML
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generar PDF
        const pdfBuffer = await page.pdf(pdfOptions);
        
        console.log(`✅ PDF generado exitosamente (${pdfBuffer.length} bytes)`);
        
        await browser.close();
        browser = null;
        
        return {
          success: true,
          pdf: pdfBuffer,
          size: pdfBuffer.length
        };
        
      } catch (error) {
        console.error(`❌ ${config.name} falló:`, error.message);
        lastError = error;
        
        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            console.error('Error cerrando browser:', closeError.message);
          }
          browser = null;
        }
        
        // Continuar con la siguiente configuración
        continue;
      }
    }
    
    // Si todas las configuraciones fallaron
    throw new Error(`Todas las configuraciones de Puppeteer fallaron. Último error: ${lastError?.message}`);
    
  } catch (error) {
    console.error('❌ Error en generación de PDF:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error cerrando browser:', closeError.message);
      }
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para generar HTML de ejemplo
function generateSampleHTML(data = {}) {
  const { fecha = new Date().toISOString().split('T')[0], orientacion = 'vertical' } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte - ${fecha}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
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
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .title {
                color: #007bff;
                font-size: 24px;
                margin: 0;
            }
            .subtitle {
                color: #666;
                font-size: 16px;
                margin: 10px 0 0 0;
            }
            .content {
                line-height: 1.6;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            .info-label {
                font-weight: bold;
                color: #495057;
            }
            .info-value {
                color: #007bff;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #dee2e6;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">Sistema de Extracción</h1>
                <p class="subtitle">Reporte Generado</p>
            </div>
            
            <div class="content">
                <div class="info-row">
                    <span class="info-label">Fecha de Generación:</span>
                    <span class="info-value">${fecha}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Orientación:</span>
                    <span class="info-value">${orientacion}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">Completado</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Generado por:</span>
                    <span class="info-value">Sistema Automático</span>
                </div>
                
                <p style="margin-top: 30px; text-align: center; color: #28a745; font-weight: bold;">
                    ✅ Reporte generado exitosamente
                </p>
            </div>
            
            <div class="footer">
                <p>Este documento fue generado automáticamente por el Sistema de Extracción</p>
                <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = {
  generatePDF,
  generateSampleHTML
};
