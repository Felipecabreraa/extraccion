const puppeteer = require('puppeteer');
const { Op, fn, col } = require('sequelize');
const sequelize = require('../config/database');

// Generar informe acumulativo sincrónico
const generarInformeAcumulativo = async (req, res) => {
  try {
    const fechaActual = new Date();
    const fechaInicioAno = new Date('2025-01-01');
    
    console.log(`📊 Generando informe acumulativo desde 01-01-2025 hasta ${fechaActual.toISOString().split('T')[0]}`);

    // Obtener datos acumulativos reales
    const datosAcumulativos = await obtenerDatosAcumulativos(fechaInicioAno, fechaActual);
    
    // Generar HTML con datos acumulativos
    const html = generarHTMLAcumulativo({
      fechaActual: fechaActual.toISOString().split('T')[0],
      fechaFormateada: fechaActual.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      usuario: req.usuario ? req.usuario.nombre : 'Usuario',
      datos: datosAcumulativos
    });
      
    // Generar PDF
    const pdfBuffer = await generarPDF(html);
      
    // Configurar headers para descarga
    const nombreArchivo = `Informe_Acumulativo_2025_${fechaActual.toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generando informe acumulativo PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando informe acumulativo PDF',
      error: error.message
    });
  }
};

// Obtener datos acumulativos desde inicio del año hasta fecha actual
const obtenerDatosAcumulativos = async (fechaInicio, fechaActual) => {
  try {
    console.log(`🔍 Obteniendo datos acumulativos desde ${fechaInicio.toISOString()} hasta ${fechaActual.toISOString()}`);

    // Obtener total de daños acumulados (suma de cantidadDano)
    const [totalDanosAcumulados] = await sequelize.query(`
      SELECT SUM(cantidadDano) as total 
      FROM vw_ordenes_unificada_completa 
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND cantidadDano IS NOT NULL
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    const totalDanos = totalDanosAcumulados[0].total || 0;

    // Obtener daños acumulados por mes (suma de cantidadDano)
    const [danosPorMes] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        SUM(cantidadDano) as total
      FROM vw_ordenes_unificada_completa 
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND cantidadDano IS NOT NULL
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY MONTH(fechaOrdenServicio)
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    // Obtener daños acumulados por operador (suma de cantidadDano)
    const [danosPorOperador] = await sequelize.query(`
      SELECT 
        nombreOperador,
        SUM(cantidadDano) as total
      FROM vw_ordenes_unificada_completa 
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND cantidadDano IS NOT NULL
      GROUP BY nombreOperador
      ORDER BY SUM(cantidadDano) DESC
      LIMIT 20
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    // Obtener metros superficie acumulados
    const [metrosSuperficieAcumulados] = await sequelize.query(`
      SELECT SUM(mts2) as total_mts2
      FROM vw_ordenes_unificada_completa 
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND mts2 IS NOT NULL
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    // Obtener daños por sector acumulados (suma de cantidadDano)
    const [danosPorSector] = await sequelize.query(`
      SELECT 
        nombreSector,
        SUM(cantidadDano) as total
      FROM vw_ordenes_unificada_completa 
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND cantidadDano IS NOT NULL
      GROUP BY nombreSector
      ORDER BY SUM(cantidadDano) DESC
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    // Calcular total de metros superficie
    const totalMetrosSuperficie = metrosSuperficieAcumulados[0]?.total_mts2 || 0;

    // Crear array de meses con datos (1-12)
    const mesesConDatos = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const mesData = danosPorMes.find(d => d.mes === mes);
      return {
        mes,
        total: mesData ? mesData.total : 0
      };
    });

    // Calcular totales acumulados por mes
    let acumulado = 0;
    const mesesAcumulados = mesesConDatos.map(item => {
      acumulado += item.total;
      return {
        mes: item.mes,
        total: item.total,
        acumulado: acumulado
      };
    });

    // Datos para metas
    const metasDanos = {
      metaAnual: 600,
      cumplimiento: Math.round((totalDanos / 600) * 100)
    };

    return {
      totalDanosAcumulados: totalDanos,
      totalMetrosSuperficie,
      danosPorOperador,
      danosPorSector,
      mesesAcumulados,
      metasDanos
    };
      
  } catch (error) {
    console.error('❌ Error obteniendo datos acumulativos:', error);
    return {
      totalDanosAcumulados: 0,
      totalMetrosSuperficie: 0,
      danosPorOperador: [],
      danosPorSector: [],
      mesesAcumulados: [],
      metasDanos: {
        metaAnual: 600,
        cumplimiento: 0
      }
    };
  }
};

// Generar HTML para informe acumulativo
const generarHTMLAcumulativo = ({ fechaActual, fechaFormateada, usuario, datos }) => {
  // Generar tabla de daños por operador
  const tablaDanosPorOperador = datos.danosPorOperador.map(item => `
    <tr>
      <td>${item.nombreOperador || 'Sin operador'}</td>
      <td>${item.total}</td>
    </tr>
  `).join('');

  // Generar tabla de daños por sector
  const tablaDanosPorSector = datos.danosPorSector.map(item => `
    <tr>
      <td>${item.nombreSector || 'Sin sector'}</td>
      <td>${item.total}</td>
    </tr>
  `).join('');

  // Generar tabla de meses acumulados
  const tablaMesesAcumulados = datos.mesesAcumulados.map(item => {
    const nombreMes = new Date(2025, item.mes - 1).toLocaleString('es-CL', { month: 'short' });
    return `<td>${item.acumulado}</td>`;
  }).join('');

  // Generar tabla de meses individuales
  const tablaMesesIndividuales = datos.mesesAcumulados.map(item => {
    const nombreMes = new Date(2025, item.mes - 1).toLocaleString('es-CL', { month: 'short' });
    return `<td>${item.total}</td>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informe Acumulativo 2025 - ${fechaActual}</title>
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
        .highlight {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📊</div>
        <h1>INFORME ACUMULATIVO 2025</h1>
        <h2>Del 01-01-2025 al ${fechaFormateada}</h2>
        <div class="status">Sistema Operativo - Informe Sincrónico</div>
      </div>

      <div class="section">
        <h2>📋 Información General</h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>📅 Período del Informe</h3>
            <p>Del 01-01-2025 al ${fechaActual}</p>
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
        <h2>📊 Resumen Ejecutivo Acumulativo</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${datos.totalDanosAcumulados}</div>
            <div class="stat-label">Total Daños Acumulados</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datos.totalMetrosSuperficie.toLocaleString()}</div>
            <div class="stat-label">Metros Superficie Acumulados</div>
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
        <h2>🎯 Progreso Acumulativo vs Meta Anual</h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>📈 Progreso Acumulativo</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(datos.metasDanos.cumplimiento, 100)}%">
                ${datos.metasDanos.cumplimiento}%
              </div>
            </div>
            <p><strong>${datos.totalDanosAcumulados}</strong> de <strong>${datos.metasDanos.metaAnual}</strong> daños acumulados</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📊 Daños Acumulados por Mes - Año 2025</h2>
        <div class="highlight">
          <strong>Informe sincrónico:</strong> Datos acumulados desde enero hasta ${fechaActual}
        </div>
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
              ${tablaMesesAcumulados}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>📈 Daños por Mes (Individual) - Año 2025</h2>
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
              ${tablaMesesIndividuales}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>👥 Daños Acumulados por Operador</h2>
        <table>
          <thead>
            <tr>
              <th>Operador</th>
              <th>Total Daños Acumulados</th>
            </tr>
          </thead>
          <tbody>
            ${tablaDanosPorOperador}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>🗺️ Daños Acumulados por Sector</h2>
        <table>
          <thead>
            <tr>
              <th>Sector</th>
              <th>Total Daños Acumulados</th>
            </tr>
          </thead>
          <tbody>
            ${tablaDanosPorSector}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p><strong>Sistema de Gestión de Daños - Informe Acumulativo</strong></p>
        <p>Informe sincrónico generado el ${new Date().toLocaleString('es-CL')}</p>
        <p>Período: 01-01-2025 al ${fechaActual}</p>
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
      message: 'Controlador de PDF acumulativo funcionando correctamente',
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
  generarInformeAcumulativo,
  generarInformePrueba,
  obtenerDatosAcumulativos
};
