const puppeteer = require('puppeteer');
const { Op, fn, col } = require('sequelize');

// Importar modelos necesarios
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
    const totalDanos = await Dano.count({
      include: [
        {
          model: Planilla,
          as: 'planilla',
          where: {
            fecha_inicio: {
              [Op.between]: [fechaInicio, fechaFin]
            }
          }
        }
      ]
    });

    // Obtener daños por zona
    const danosPorZona = await Dano.findAll({
      include: [
        {
          model: Planilla,
          as: 'planilla',
      where: {
            fecha_inicio: {
              [Op.between]: [fechaInicio, fechaFin]
            }
      },
      include: [
        {
          model: Sector,
              as: 'sector',
              include: [
                {
                  model: Zona,
                  as: 'zona',
                  attributes: ['nombre']
                }
              ]
            }
          ]
        }
      ],
      attributes: [
        'planilla.sector.zona.id',
        [fn('COUNT', col('Dano.id')), 'total']
      ],
      group: ['planilla.sector.zona.id']
    });

    // Obtener daños por operador (usando planilla)
    const danosPorOperador = await Dano.findAll({
      include: [
        {
          model: Planilla,
          as: 'planilla',
          where: {
            fecha_inicio: {
              [Op.between]: [fechaInicio, fechaFin]
            }
          },
          include: [
            {
              model: Usuario,
              as: 'supervisor',
              attributes: ['nombre', 'apellido']
            }
          ]
        }
      ],
      attributes: [
        'planilla.supervisor.id',
        [fn('COUNT', col('Dano.id')), 'total']
      ],
      group: ['planilla.supervisor.id']
    });

    // Obtener últimos daños registrados
    const ultimosDanos = await Dano.findAll({
        include: [
          {
            model: Planilla,
          as: 'planilla',
          where: {
            fecha_inicio: {
              [Op.between]: [fechaInicio, fechaFin]
            }
          },
            include: [
              {
                model: Sector,
              as: 'sector',
                include: [
                  {
                    model: Zona,
                  as: 'zona',
                  attributes: ['nombre']
                  }
                ]
            },
            {
              model: Usuario,
              as: 'supervisor',
              attributes: ['nombre', 'apellido']
              }
            ]
          }
        ],
      order: [['planilla.fecha_inicio', 'DESC']],
      limit: 10
    });

    // Obtener datos de metros superficie
    const metrosSuperficie = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      include: [
        {
          model: Zona,
          as: 'zona',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'ASC']]
    });

    // Obtener datos de daños acumulados por mes
    const danosAcumulados = await Dano.findAll({
      include: [
        {
          model: Planilla,
          as: 'planilla',
          where: {
            fecha_inicio: {
              [Op.gte]: new Date(fecha.getFullYear(), 0, 1) // Desde enero del año actual
            }
          }
        }
      ],
      attributes: [
        [fn('MONTH', col('planilla.fecha_inicio')), 'mes'],
        [fn('COUNT', col('Dano.id')), 'total']
      ],
      group: [fn('MONTH', col('planilla.fecha_inicio'))],
      order: [fn('MONTH', col('planilla.fecha_inicio'))]
    });

    // Obtener datos de daños por zona (Hembra/Macho)
    const danosPorTipoZona = await Dano.findAll({
      include: [
        {
          model: Planilla,
          as: 'planilla',
      where: {
            fecha_inicio: {
              [Op.between]: [fechaInicio, fechaFin]
        }
      },
      include: [
        {
          model: Sector,
              as: 'sector',
              include: [
                {
                  model: Zona,
                  as: 'zona',
                  attributes: ['nombre', 'tipo']
                }
              ]
            }
          ]
        }
      ],
      attributes: [
        'planilla.sector.zona.id',
        [fn('COUNT', col('Dano.id')), 'total']
      ],
      group: ['planilla.sector.zona.id']
    });

    // Obtener datos de metas de daños (simulado)
    const metasDanos = {
      metaAnual: 1000,
      metaMensual: 83,
      actualAnual: totalDanos,
      actualMensual: totalDanos,
      cumplimiento: Math.round((totalDanos / 1000) * 100)
    };

    return {
      totalDanos,
      danosPorZona,
      danosPorOperador,
      ultimosDanos,
      metrosSuperficie,
      danosAcumulados,
      danosPorTipoZona,
      metasDanos
    };
      
    } catch (error) {
    console.error('❌ Error obteniendo datos reales:', error);
    return {
      totalDanos: 0,
      danosPorZona: [],
      danosPorOperador: [],
      ultimosDanos: [],
      metrosSuperficie: [],
      danosAcumulados: [],
      danosPorTipoZona: [],
      metasDanos: {
        metaAnual: 1000,
        metaMensual: 83,
        actualAnual: 0,
        actualMensual: 0,
        cumplimiento: 0
      }
    };
  }
};

const generarInformePrueba = async (req, res) => {
  try {
    const html = generarHTMLBasico({
      fecha: '2025-01-15',
      fechaFormateada: 'Miércoles, 15 de enero de 2025',
      usuario: req.usuario ? req.usuario.nombre : 'Usuario de Prueba'
    });

    const pdfBuffer = await generarPDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Informe_Prueba.pdf"');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generando informe de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando informe de prueba',
      error: error.message
    });
  }
};

// Generar HTML con datos reales
const generarHTMLConDatos = (datos) => {
  const { fecha, fechaFormateada, usuario, datos: datosReales } = datos;
  
  // Generar tabla de daños por zona
  const tablaDanosPorZona = datosReales.danosPorZona.map(item => `
    <tr>
      <td>${item.planilla?.sector?.zona?.nombre || 'Sin zona'}</td>
      <td>${item.dataValues.total}</td>
    </tr>
  `).join('');

  // Generar tabla de daños por operador
  const tablaDanosPorOperador = datosReales.danosPorOperador.map(item => `
    <tr>
      <td>${item.planilla?.supervisor ? `${item.planilla.supervisor.nombre} ${item.planilla.supervisor.apellido}` : 'Sin operador'}</td>
      <td>${item.dataValues.total}</td>
    </tr>
  `).join('');

  // Generar tabla de últimos daños
  const tablaUltimosDanos = datosReales.ultimosDanos.map(dano => `
    <tr>
      <td>${dano.planilla?.fecha_inicio ? new Date(dano.planilla.fecha_inicio).toLocaleDateString('es-CL') : 'N/A'}</td>
      <td>${dano.planilla?.sector?.zona?.nombre || 'Sin zona'}</td>
      <td>${dano.planilla?.supervisor ? `${dano.planilla.supervisor.nombre} ${dano.planilla.supervisor.apellido}` : 'Sin operador'}</td>
      <td>${dano.descripcion || 'Sin descripción'}</td>
    </tr>
  `).join('');

  // Generar tabla de metros superficie
  const tablaMetrosSuperficie = datosReales.metrosSuperficie.map(item => `
    <tr>
      <td>${item.fecha ? new Date(item.fecha).toLocaleDateString('es-CL') : 'N/A'}</td>
      <td>${item.zona ? item.zona.nombre : 'Sin zona'}</td>
      <td>${item.metros_cuadrados || 0}</td>
    </tr>
  `).join('');

  // Generar tabla de daños acumulados por mes
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
  const tablaDanosAcumulados = meses.map((mes, index) => {
    const datoMes = datosReales.danosAcumulados.find(d => d.dataValues.mes === index + 1);
    const total = datoMes ? datoMes.dataValues.total : 0;
    return `<td>${total}</td>`;
  }).join('');

  // Generar tabla de daños por tipo de zona (Hembra/Macho)
  const tablaDanosPorTipoZona = datosReales.danosPorTipoZona.map(item => `
    <tr>
      <td>${item.planilla?.sector?.zona?.nombre || 'Sin zona'}</td>
      <td>${item.planilla?.sector?.zona?.tipo || 'Sin tipo'}</td>
      <td>${item.dataValues.total}</td>
    </tr>
  `).join('');

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
        .header h1 {
          color: #1976d2;
          margin: 0;
          font-size: 28px;
        }
        .header h2 {
          color: #666;
          margin: 10px 0 0 0;
          font-size: 18px;
          font-weight: normal;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .section h2 {
            color: #1976d2;
          border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
          margin-top: 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .info-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #1976d2;
        }
        .info-card h3 {
          margin: 0 0 10px 0;
          color: #1976d2;
          font-size: 16px;
        }
        .info-card p {
          margin: 5px 0;
          color: #666;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          background: #4caf50;
          color: white;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #1976d2;
          border-radius: 50%;
          display: inline-block;
          margin-bottom: 20px;
          position: relative;
        }
        .logo::after {
          content: "📊";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 40px;
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
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
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
        .progress-bar {
          width: 100%;
          height: 30px;
          background-color: #f0f0f0;
          border-radius: 15px;
            margin: 20px 0;
          position: relative;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          border-radius: 15px;
          transition: width 0.3s ease;
        }
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #333;
          font-weight: bold;
          font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
        <div class="logo"></div>
          <h1>INFORME DE DAÑOS</h1>
        <h2>${fechaFormateada}</h2>
        <div class="status">Sistema Operativo</div>
        </div>

        <div class="section">
        <h2>📋 Información General</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>📅 Fecha del Informe</h3>
            <p>${fecha}</p>
          </div>
          <div class="info-card">
            <h3>👤 Generado por</h3>
            <p>${usuario}</p>
          </div>
          <div class="info-card">
            <h3>⏰ Hora de Generación</h3>
            <p>${new Date().toLocaleString('es-CL')}</p>
          </div>
          <div class="info-card">
            <h3>🌐 Sistema</h3>
            <p>Plataforma de Gestión de Daños</p>
          </div>
          </div>
        </div>

        <div class="section">
        <h2>📊 Resumen Ejecutivo</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${datosReales.totalDanos}</div>
            <div class="stat-label">Total de Daños</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datosReales.danosPorZona.length}</div>
            <div class="stat-label">Zonas Afectadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datosReales.danosPorOperador.length}</div>
            <div class="stat-label">Operadores Involucrados</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datosReales.metasDanos.cumplimiento}%</div>
            <div class="stat-label">Cumplimiento Meta</div>
          </div>
          </div>
        </div>

        <div class="section">
        <h2>🎯 Metas de Daños</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>📈 Meta Anual</h3>
            <p>${datosReales.metasDanos.metaAnual}</p>
          </div>
          <div class="info-card">
            <h3>📊 Actual Anual</h3>
            <p>${datosReales.metasDanos.actualAnual}</p>
          </div>
          <div class="info-card">
            <h3>📅 Meta Mensual</h3>
            <p>${datosReales.metasDanos.metaMensual}</p>
          </div>
          <div class="info-card">
            <h3>📋 Actual Mensual</h3>
            <p>${datosReales.metasDanos.actualMensual}</p>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${datosReales.metasDanos.cumplimiento}%"></div>
          <span class="progress-text">${datosReales.metasDanos.cumplimiento}% Cumplimiento</span>
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
              <th>Sept</th>
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
              <th>Zona</th>
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
        <h2>🗺️ Daños por Zona</h2>
        <table>
          <thead>
            <tr>
              <th>Zona</th>
              <th>Total de Daños</th>
                </tr>
          </thead>
          <tbody>
            ${tablaDanosPorZona}
            </tbody>
          </table>
        </div>

      <div class="section">
        <h2>🔀 Consolidado Hembra y Macho</h2>
        <table>
          <thead>
            <tr>
              <th>Zona</th>
              <th>Tipo</th>
              <th>Total de Daños</th>
            </tr>
          </thead>
          <tbody>
            ${tablaDanosPorTipoZona}
          </tbody>
        </table>
      </div>

      ${datosReales.danosPorZona.length > 0 ? `
      <div class="section">
        <h2>🗺️ Daños por Zona</h2>
        <table>
          <thead>
            <tr>
              <th>Zona</th>
              <th>Total de Daños</th>
            </tr>
          </thead>
          <tbody>
            ${tablaDanosPorZona}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${datosReales.danosPorOperador.length > 0 ? `
      <div class="section">
        <h2>👷 Daños por Operador</h2>
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
      ` : ''}

      ${datosReales.ultimosDanos.length > 0 ? `
      <div class="section">
        <h2>📝 Últimos Daños Registrados</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Zona</th>
              <th>Operador</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${tablaUltimosDanos}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <h2>📝 Observaciones</h2>
        <p>Este informe muestra los datos reales de daños registrados en el sistema para la fecha ${fecha}.</p>
        
        ${datosReales.totalDanos === 0 ? 
          '<p><strong>Nota:</strong> No se encontraron registros de daños para la fecha especificada.</p>' : 
          '<p>Los datos mostrados corresponden a la fecha seleccionada y reflejan el estado actual de la base de datos.</p>'
        }
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

// Generar HTML básico para el informe (mantener para pruebas)
const generarHTMLBasico = (datos) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informe de Daños - ${datos.fecha}</title>
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
        .header h1 {
          color: #1976d2;
          margin: 0;
          font-size: 28px;
        }
        .header h2 {
          color: #666;
          margin: 10px 0 0 0;
          font-size: 18px;
          font-weight: normal;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
          color: #1976d2;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
          margin-top: 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .info-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #1976d2;
        }
        .info-card h3 {
          margin: 0 0 10px 0;
          color: #1976d2;
          font-size: 16px;
        }
        .info-card p {
          margin: 5px 0;
          color: #666;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          background: #4caf50;
          color: white;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #1976d2;
          border-radius: 50%;
          display: inline-block;
          margin-bottom: 20px;
          position: relative;
        }
        .logo::after {
          content: "📊";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo"></div>
        <h1>INFORME DE DAÑOS</h1>
        <h2>${datos.fechaFormateada}</h2>
        <div class="status">Sistema Operativo</div>
      </div>

      <div class="section">
        <h2>📋 Información General</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>📅 Fecha del Informe</h3>
            <p>${datos.fecha}</p>
          </div>
          <div class="info-card">
            <h3>👤 Generado por</h3>
            <p>${datos.usuario}</p>
          </div>
          <div class="info-card">
            <h3>⏰ Hora de Generación</h3>
            <p>${new Date().toLocaleString('es-CL')}</p>
          </div>
          <div class="info-card">
            <h3>🌐 Sistema</h3>
            <p>Plataforma de Gestión de Daños</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📊 Resumen Ejecutivo</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>🔧 Estado del Sistema</h3>
            <p><span class="status">Operativo</span></p>
          </div>
          <div class="info-card">
            <h3>📈 Datos Disponibles</h3>
            <p>Sistema conectado correctamente</p>
          </div>
          <div class="info-card">
            <h3>🔍 Última Actualización</h3>
            <p>${new Date().toLocaleDateString('es-CL')}</p>
          </div>
          <div class="info-card">
            <h3>📋 Tipo de Reporte</h3>
            <p>Informe Diario Automatizado</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📝 Observaciones</h2>
        <p>Este es un informe generado automáticamente por el sistema de gestión de daños. 
        Los datos mostrados corresponden a la fecha seleccionada y reflejan el estado 
        actual de la base de datos.</p>
        
        <p>Para obtener informes más detallados con datos específicos, asegúrese de que 
        todos los módulos del sistema estén configurados correctamente.</p>
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

module.exports = {
  generarInformeDiario,
  generarInformePrueba
};
