const puppeteer = require('puppeteer');
const { Op, fn, col } = require('sequelize');
const VwOrdenesUnificadaCompleta = require('../models/vwOrdenesUnificadaCompleta');

// Generar informe diario completo
const generarInformeDiario = async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaInforme = fecha ? new Date(fecha) : new Date();
    
    console.log(`📊 Generando informe diario para: ${fechaInforme.toISOString().split('T')[0]}`);

    // Obtener datos reales de la base de datos
    const datosReales = await obtenerDatosReales(fechaInforme);
    
    // Generar HTML con datos reales
    const html = generarHTMLConDatos({
      fecha: fechaInforme.toISOString().split('T')[0],
      fechaFormateada: fechaInforme.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      usuario: req.usuario ? req.usuario.nombre : 'Usuario',
      datos: datosReales
    });
      
    // Generar PDF
    const pdfBuffer = await generarPDF(html);
      
    // Configurar headers para descarga
    const nombreArchivo = `Informe_Danos_${fechaInforme.toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generando informe PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando informe PDF',
      error: error.message
    });
  }
};

// Obtener datos reales de la base de datos
const obtenerDatosReales = async (fecha) => {
  try {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    console.log(`🔍 Obteniendo datos para: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);

    // Obtener estadísticas de daños
    const totalDanos = await VwOrdenesUnificadaCompleta.count({
      where: {
        fecha_inicio: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        tipo_dano: {
          [Op.ne]: null
        }
      }
    });

    // Obtener daños por sector
    const danosPorZona = await VwOrdenesUnificadaCompleta.findAll({
      where: {
        fecha_inicio: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        tipo_dano: {
          [Op.ne]: null
        }
      },
      attributes: [
        'sector',
        [fn('COUNT', col('id')), 'total']
      ],
      group: ['sector'],
      order: [[fn('COUNT', col('id')), 'DESC']]
    });

    // Obtener daños por operador
    const danosPorOperador = await VwOrdenesUnificadaCompleta.findAll({
      where: {
        fecha_inicio: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        tipo_dano: {
          [Op.ne]: null
        }
      },
      attributes: [
        'operador',
        [fn('COUNT', col('id')), 'total']
      ],
      group: ['operador'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    });

    // Obtener últimos daños registrados
    const ultimosDanos = await VwOrdenesUnificadaCompleta.findAll({
      where: {
        fecha_inicio: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        tipo_dano: {
          [Op.ne]: null
        }
      },
      attributes: [
        'fecha_inicio',
        'sector',
        'operador',
        'descripcion_dano',
        'tipo_dano'
      ],
      order: [['fecha_inicio', 'DESC']],
      limit: 10
    });

    // Obtener datos de daños acumulados por mes
    const danosAcumulados = await VwOrdenesUnificadaCompleta.findAll({
      where: {
        fecha_inicio: {
          [Op.gte]: new Date(fecha.getFullYear(), 0, 1) // Desde enero del año actual
        },
        tipo_dano: {
          [Op.ne]: null
        }
      },
      attributes: [
        [fn('MONTH', col('fecha_inicio')), 'mes'],
        [fn('COUNT', col('id')), 'total']
      ],
      group: [fn('MONTH', col('fecha_inicio'))],
      order: [fn('MONTH', col('fecha_inicio'))]
    });

    // Obtener datos de metros superficie
    const metrosSuperficie = await VwOrdenesUnificadaCompleta.findAll({
      where: {
        fecha_inicio: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        mts2: {
          [Op.ne]: null
        }
      },
      attributes: [
        'fecha_inicio',
        'sector',
        'mts2'
      ],
      order: [['fecha_inicio', 'ASC']],
      limit: 10
    });

    // Datos de ejemplo para metas de daños
    const metasDanos = {
      metaMensual: 50,
      metaAnual: 600,
      cumplimiento: Math.round((totalDanos / 600) * 100)
    };

    return {
      totalDanos,
      danosPorZona,
      danosPorOperador,
      ultimosDanos,
      danosAcumulados,
      metrosSuperficie,
      metasDanos
    };
      
  } catch (error) {
    console.error('❌ Error obteniendo datos reales:', error);
    return {
      totalDanos: 0,
      danosPorZona: [],
      danosPorOperador: [],
      ultimosDanos: [],
      danosAcumulados: [],
      metrosSuperficie: [],
      metasDanos: {
        metaMensual: 50,
        metaAnual: 600,
        cumplimiento: 0
      }
    };
  }
};

// Generar HTML con datos reales
const generarHTMLConDatos = ({ fecha, fechaFormateada, usuario, datos }) => {
  // Generar tabla de daños por zona
  const tablaDanosPorZona = datos.danosPorZona.map(item => `
    <tr>
      <td>${item.sector || 'Sin sector'}</td>
      <td>${item.dataValues.total}</td>
    </tr>
  `).join('');

  // Generar tabla de daños por operador
  const tablaDanosPorOperador = datos.danosPorOperador.map(item => `
    <tr>
      <td>${item.operador || 'Sin operador'}</td>
      <td>${item.dataValues.total}</td>
    </tr>
  `).join('');

  // Generar tabla de últimos daños
  const tablaUltimosDanos = datos.ultimosDanos.map(dano => `
    <tr>
      <td>${dano.fecha_inicio ? new Date(dano.fecha_inicio).toLocaleDateString('es-CL') : 'N/A'}</td>
      <td>${dano.sector || 'Sin sector'}</td>
      <td>${dano.operador || 'Sin operador'}</td>
      <td>${dano.descripcion_dano || 'Sin descripción'}</td>
    </tr>
  `).join('');

  // Generar tabla de metros superficie
  const tablaMetrosSuperficie = datos.metrosSuperficie.map(item => `
    <tr>
      <td>${item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-CL') : 'N/A'}</td>
      <td>${item.sector || 'Sin sector'}</td>
      <td>${item.mts2 || 0}</td>
    </tr>
  `).join('');

  // Generar tabla de daños acumulados por mes
  const tablaDanosAcumulados = datos.danosAcumulados.map(item => {
    const mes = item.dataValues.mes;
    const nombreMes = new Date(2025, mes - 1).toLocaleString('es-CL', { month: 'short' });
    return `<td>${item.dataValues.total}</td>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informe de Daños - ${fecha}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1976d2;
          padding-bottom: 20px;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 30px;
          border-radius: 10px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #1976d2;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        h1 {
          color: #1976d2;
          margin: 0;
          font-size: 28px;
        }
        h2 {
          color: #1976d2;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
          margin-top: 0;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .info-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #1976d2;
        }
        .info-item h3 {
          margin: 0 0 10px 0;
          color: #1976d2;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }
        .stat-number {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 0.9em;
          opacity: 0.9;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #1976d2;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .progress-bar {
          background-color: #f0f0f0;
          border-radius: 15px;
          margin: 20px 0;
          position: relative;
          overflow: hidden;
        }
        .progress-fill {
          background: linear-gradient(90deg, #4CAF50, #45a049);
          height: 30px;
          border-radius: 15px;
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📊</div>
        <h1>INFORME DE DAÑOS</h1>
        <h2>${fechaFormateada}</h2>
        <div class="status">Sistema Operativo</div>
      </div>

      <div class="section">
        <h2>📋 Información General</h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>📅 Fecha del Informe</h3>
            <p>${fechaFormateada}</p>
          </div>
          <div class="info-item">
            <h3>👤 Generado por</h3>
            <p>${usuario}</p>
          </div>
          <div class="info-item">
            <h3>🏢 Sistema</h3>
            <p>Plataforma de Gestión de Daños</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📊 Resumen Ejecutivo</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${datos.totalDanos}</div>
            <div class="stat-label">Total de Daños</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datos.metasDanos.metaMensual}</div>
            <div class="stat-label">Meta Mensual</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datos.metasDanos.metaAnual}</div>
            <div class="stat-label">Meta Anual</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datos.metasDanos.cumplimiento}%</div>
            <div class="stat-label">Cumplimiento Meta</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>🎯 Metas de Daños</h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>📈 Progreso Anual</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(datos.metasDanos.cumplimiento, 100)}%">
                ${datos.metasDanos.cumplimiento}%
              </div>
            </div>
            <p><strong>${datos.totalDanos}</strong> de <strong>${datos.metasDanos.metaAnual}</strong> daños registrados</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📊 Daños Acumulados por Mes - Año 2025</h2>
        <table>
          <thead>
            <tr>
              <th>Ene</th>
              <th>Feb</th>
              <th>Mar</th>
              <th>Abr</th>
              <th>May</th>
              <th>Jun</th>
              <th>Jul</th>
              <th>Ago</th>
              <th>Sep</th>
              <th>Oct</th>
              <th>Nov</th>
              <th>Dic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              ${tablaDanosAcumulados}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>🏗️ Metros Superficie</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Sector</th>
              <th>Metros Superficie</th>
            </tr>
          </thead>
          <tbody>
            ${tablaMetrosSuperficie}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>👥 Daños por Operador</h2>
        <table>
          <thead>
            <tr>
              <th>Operador</th>
              <th>Total de Daños</th>
            </tr>
          </thead>
          <tbody>
            ${tablaDanosPorOperador}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>🗺️ Daños por Sector</h2>
        <table>
          <thead>
            <tr>
              <th>Sector</th>
              <th>Total de Daños</th>
            </tr>
          </thead>
          <tbody>
            ${tablaDanosPorZona}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>📋 Últimos Daños Registrados</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Sector</th>
              <th>Operador</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${tablaUltimosDanos}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p><strong>Sistema de Gestión de Daños</strong></p>
        <p>Informe generado automáticamente el ${new Date().toLocaleString('es-CL')}</p>
        <p>© 2025 - Todos los derechos reservados</p>
      </div>
    </body>
    </html>
  `;
};

// Generar PDF desde HTML usando Puppeteer
const generarPDF = async (html) => {
  let browser;
  try {
    // Lanzar navegador
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Configurar contenido
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Configurar formato PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: false
    });

    return pdfBuffer;

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Generar informe de prueba
const generarInformePrueba = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Controlador de PDF funcionando correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en controlador de prueba',
      error: error.message
    });
  }
};

module.exports = {
  generarInformeDiario,
  generarInformePrueba
};



