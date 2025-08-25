const puppeteer = require('puppeteer');
const sequelize = require('../config/database');

// Generar informe completo con todas las secciones
const generarInformeCompleto = async (req, res) => {
  try {
    console.log('📊 Generando informe completo con todas las secciones...');
    
    const fechaInicio = new Date('2025-01-01');
    const fechaActual = new Date();
    
    // Obtener todos los datos necesarios
    const datos = await obtenerDatosCompletos(fechaInicio, fechaActual);
    
    // Generar HTML completo
    const html = generarHTMLCompleto(datos);
    
    // Generar PDF
    const pdfBuffer = await generarPDF(html);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="informe-completo-2025.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('✅ Informe completo generado exitosamente');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generando informe completo:', error);
    res.status(500).json({ error: 'Error generando informe completo' });
  }
};

// Obtener todos los datos necesarios
const obtenerDatosCompletos = async (fechaInicio, fechaActual) => {
  try {
    console.log('🔍 Obteniendo datos completos...');
    
    // 1. METROS SUPERFICIE - Datos por quincenas
    const [metrosSuperficie] = await sequelize.query(`
      SELECT 
        CASE 
          WHEN DAY(fechaOrdenServicio) <= 15 THEN '1ERA QUINCENA'
          ELSE '2DA QUINCENA'
        END as quincena,
        SUM(mts2) as total_mts2,
        COUNT(*) as cantidad_ordenes
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND mts2 IS NOT NULL
      GROUP BY 
        YEAR(fechaOrdenServicio),
        MONTH(fechaOrdenServicio),
        CASE 
          WHEN DAY(fechaOrdenServicio) <= 15 THEN '1ERA QUINCENA'
          ELSE '2DA QUINCENA'
        END
      ORDER BY fechaOrdenServicio
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    // 2. DAÑOS ACUMULADOS - Total y por mes
    const [totalDanos] = await sequelize.query(`
      SELECT SUM(cantidadDano) as total
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND cantidadDano IS NOT NULL
    `, {
      replacements: [fechaInicio, fechaActual]
    });

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

    // 3. DAÑOS POR OPERADOR - Con semáforos
    const [danosPorOperador] = await sequelize.query(`
      SELECT 
        nombreOperador,
        SUM(cantidadDano) as total,
        COUNT(*) as cantidad_ordenes
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND cantidadDano IS NOT NULL
      GROUP BY nombreOperador
      ORDER BY SUM(cantidadDano) DESC
      LIMIT 20
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    // 4. CONSOLIDADO POR ZONAS - HEMBRA/MACHO
    const [consolidadoZonas] = await sequelize.query(`
      SELECT 
        nombreSector,
        SUM(cantidadDano) as total_danos,
        SUM(mts2) as total_mts2,
        COUNT(*) as cantidad_ordenes
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio BETWEEN ? AND ? AND cantidadDano IS NOT NULL
      GROUP BY nombreSector
      ORDER BY nombreSector
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    // 5. DATOS PARA GRÁFICAS
    const [datosGraficas] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        SUM(cantidadDano) as danos,
        SUM(mts2) as metros_superficie
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio BETWEEN ? AND ? 
        AND cantidadDano IS NOT NULL 
        AND mts2 IS NOT NULL
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY MONTH(fechaOrdenServicio)
    `, {
      replacements: [fechaInicio, fechaActual]
    });

    const totalDanosAcumulados = totalDanos[0].total || 0;
    const totalMetrosSuperficie = metrosSuperficie.reduce((sum, item) => sum + (item.total_mts2 || 0), 0);

    // Calcular metas
    const metaAnual = 600;
    const cumplimiento = Math.round((totalDanosAcumulados / metaAnual) * 100);

    return {
      totalDanosAcumulados,
      totalMetrosSuperficie,
      metrosSuperficie,
      danosPorMes,
      danosPorOperador,
      consolidadoZonas,
      datosGraficas,
      metasDanos: {
        metaAnual,
        cumplimiento
      }
    };

  } catch (error) {
    console.error('❌ Error obteniendo datos completos:', error);
    throw error;
  }
};

// Generar HTML completo con todas las secciones
const generarHTMLCompleto = (datos) => {
  const fechaActual = new Date().toLocaleDateString('es-ES');
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informe Completo 2025</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
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
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0 0;
        }
        .section {
          margin-bottom: 40px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fafafa;
        }
        .section h2 {
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .metric-card {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          margin: 10px 0;
        }
        .metric-card h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        .metric-card .value {
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }
        .metric-card .label {
          font-size: 14px;
          opacity: 0.9;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .table-container {
          overflow-x: auto;
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #007bff;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          margin: 10px 0;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
        }
        .semaforo {
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .semaforo.verde { background: #28a745; }
        .semaforo.amarillo { background: #ffc107; }
        .semaforo.rojo { background: #dc3545; }
        .chart-placeholder {
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          color: #6c757d;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Informe Completo 2025</h1>
          <p>Reporte detallado de metros superficie, daños acumulados y análisis operacional</p>
          <p><strong>Período:</strong> 01-01-2025 al ${fechaActual}</p>
        </div>

        <!-- RESUMEN EJECUTIVO -->
        <div class="section">
          <h2>📈 Resumen Ejecutivo</h2>
          <div class="grid">
            <div class="metric-card">
              <h3>Total Daños</h3>
              <div class="value">${datos.totalDanosAcumulados.toLocaleString()}</div>
              <div class="label">Acumulados 2025</div>
            </div>
            <div class="metric-card">
              <h3>Metros Superficie</h3>
              <div class="value">${datos.totalMetrosSuperficie.toLocaleString()}</div>
              <div class="label">m² totales</div>
            </div>
            <div class="metric-card">
              <h3>Cumplimiento Meta</h3>
              <div class="value">${datos.metasDanos.cumplimiento}%</div>
              <div class="label">Meta: ${datos.metasDanos.metaAnual} daños</div>
            </div>
          </div>
        </div>

        <!-- METROS SUPERFICIE -->
        <div class="section">
          <h2>🏗️ Metros Superficie</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quincena</th>
                  <th>Total m²</th>
                  <th>Cantidad Órdenes</th>
                </tr>
              </thead>
              <tbody>
                ${datos.metrosSuperficie.map(item => `
                  <tr>
                    <td>${item.quincena}</td>
                    <td>${(item.total_mts2 || 0).toLocaleString()} m²</td>
                    <td>${item.cantidad_ordenes || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="chart-placeholder">
            📊 Gráfica de Metros Superficie por Quincenas
            <br><small>Aquí se mostraría la gráfica de Lucas con los datos de metros superficie</small>
          </div>
        </div>

        <!-- DAÑOS ACUMULADOS -->
        <div class="section">
          <h2>📊 Daños Acumulados</h2>
          <div class="metric-card">
            <h3>Total Daños Acumulados</h3>
            <div class="value">${datos.totalDanosAcumulados.toLocaleString()}</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(datos.metasDanos.cumplimiento, 100)}%"></div>
            </div>
            <div class="label">Cumplimiento: ${datos.metasDanos.cumplimiento}% de la meta anual</div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Total Daños</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                ${datos.danosPorMes.map(item => {
                  const porcentaje = ((item.total / datos.totalDanosAcumulados) * 100).toFixed(1);
                  return `
                    <tr>
                      <td>${obtenerNombreMes(item.mes)}</td>
                      <td>${item.total}</td>
                      <td>${porcentaje}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="chart-placeholder">
            📈 Gráfica de Daños Acumulados por Mes
            <br><small>Aquí se mostraría la gráfica de tendencia de daños</small>
          </div>
        </div>

        <!-- METAS DE DAÑOS -->
        <div class="section">
          <h2>🎯 Metas de Daños</h2>
          <div class="grid">
            <div class="metric-card">
              <h3>Meta Anual</h3>
              <div class="value">${datos.metasDanos.metaAnual}</div>
              <div class="label">Daños objetivo</div>
            </div>
            <div class="metric-card">
              <h3>Daños Realizados</h3>
              <div class="value">${datos.totalDanosAcumulados}</div>
              <div class="label">Acumulados</div>
            </div>
            <div class="metric-card">
              <h3>Cumplimiento</h3>
              <div class="value">${datos.metasDanos.cumplimiento}%</div>
              <div class="label">${datos.metasDanos.cumplimiento >= 100 ? '✅ Meta superada' : '⏳ En progreso'}</div>
            </div>
          </div>
          
          <div class="chart-placeholder">
            🎯 Gráfica de Cumplimiento de Metas
            <br><small>Aquí se mostraría la gráfica de progreso vs meta</small>
          </div>
        </div>

        <!-- DAÑOS POR OPERADOR -->
        <div class="section">
          <h2>👥 Daños por Operador</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Operador</th>
                  <th>Total Daños</th>
                  <th>Cantidad Órdenes</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${datos.danosPorOperador.map(item => {
                  const semaforo = item.total > 50 ? 'rojo' : item.total > 25 ? 'amarillo' : 'verde';
                  const estado = item.total > 50 ? 'Alto' : item.total > 25 ? 'Medio' : 'Bajo';
                  return `
                    <tr>
                      <td>
                        <span class="semaforo ${semaforo}"></span>
                        ${item.nombreOperador}
                      </td>
                      <td>${item.total}</td>
                      <td>${item.cantidad_ordenes}</td>
                      <td>${estado}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="chart-placeholder">
            👥 Gráfica de Daños por Operador con Semáforos
            <br><small>Aquí se mostraría la gráfica de barras con indicadores de semáforo</small>
          </div>
        </div>

        <!-- CONSOLIDADO POR ZONAS -->
        <div class="section">
          <h2>🗺️ Consolidado por Zonas</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Total Daños</th>
                  <th>Metros Superficie</th>
                  <th>Cantidad Órdenes</th>
                </tr>
              </thead>
              <tbody>
                ${datos.consolidadoZonas.map(item => `
                  <tr>
                    <td>${item.nombreSector}</td>
                    <td>${item.total_danos}</td>
                    <td>${(item.total_mts2 || 0).toLocaleString()} m²</td>
                    <td>${item.cantidad_ordenes}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="chart-placeholder">
            🗺️ Gráfica de Consolidado por Zonas (HEMBRA/MACHO)
            <br><small>Aquí se mostraría la distribución HEMBRA Zona 1 y 3 / MACHO Zona 2</small>
          </div>
        </div>

        <div class="footer">
          <p><strong>Informe generado el:</strong> ${fechaActual}</p>
          <p>📊 Sistema de Gestión de Órdenes - Río Negro</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función auxiliar para obtener nombre del mes
const obtenerNombreMes = (numeroMes) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[numeroMes - 1] || `Mes ${numeroMes}`;
};

// Generar PDF desde HTML
const generarPDF = async (html) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  return pdfBuffer;
};

// Función de prueba
const generarInformePrueba = async (req, res) => {
  try {
    console.log('🧪 Probando generación de informe completo...');
    
    const fechaInicio = new Date('2025-01-01');
    const fechaActual = new Date();
    
    const datos = await obtenerDatosCompletos(fechaInicio, fechaActual);
    console.log('✅ Datos obtenidos:', {
      totalDanos: datos.totalDanosAcumulados,
      totalMetros: datos.totalMetrosSuperficie,
      cumplimiento: datos.metasDanos.cumplimiento
    });
    
    res.json({
      mensaje: 'Informe completo generado correctamente',
      datos: {
        totalDanosAcumulados: datos.totalDanosAcumulados,
        totalMetrosSuperficie: datos.totalMetrosSuperficie,
        cumplimiento: datos.metasDanos.cumplimiento,
        operadores: datos.danosPorOperador.length,
        zonas: datos.consolidadoZonas.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generarInformeCompleto,
  generarInformePrueba,
  obtenerDatosCompletos
};



