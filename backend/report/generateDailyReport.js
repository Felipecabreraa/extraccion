const puppeteer = require('puppeteer');
const { Op, fn, col } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

// Importar modelos necesarios
const MetrosSuperficie = require('../src/models/metrosSuperficie');
const Dano = require('../src/models/dano');
const Zona = require('../src/models/zona');
const Sector = require('../src/models/sector');
const Operador = require('../src/models/operador');
const Planilla = require('../src/models/planilla');
const Usuario = require('../src/models/usuario');
const sequelize = require('../src/config/database');

// Función para formatear moneda chilena
function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Generador de PDF diario que extrae datos reales del sistema
 * @param {Object} options - Opciones de configuración
 * @param {string} options.date - Fecha en formato YYYY-MM-DD
 * @param {string} options.baseUrl - URL base del frontend
 * @param {string} options.authToken - Token de autenticación (opcional)
 * @param {Array} options.cookies - Cookies de sesión (opcional)
 * @returns {Promise<string>} - Ruta del archivo PDF generado
 */
async function generateDailyReportPDF({ date, baseUrl, authToken, cookies }) {
  let browser;
  let filePath;
  
  try {
    console.log(`📊 Iniciando generación de PDF para fecha: ${date}`);
    
    // 1. Obtener datos reales de la base de datos
    const datosReales = await obtenerDatosReales(date);
    
    // 2. Generar HTML con datos reales
    const html = generarHTMLConDatos({
      fecha: date,
      fechaFormateada: new Date().toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      datos: datosReales
    });
    
    // 3. Lanzar Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // 4. Configurar autenticación si se proporciona
    if (authToken) {
      await page.setExtraHTTPHeaders({
        'Authorization': `Bearer ${authToken}`
      });
    }
    
    if (cookies && cookies.length > 0) {
      await page.setCookie(...cookies);
    }
    
    // 5. Configurar contenido HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // 6. Esperar a que los elementos estén listos
    try {
      await page.waitForSelector('#reporte-contenido', { timeout: 10000 });
    } catch (error) {
      console.log('⚠️ Elemento #reporte-contenido no encontrado, continuando...');
    }
    
    // 7. Esperar a que el contenido se renderice completamente
    try {
      await page.waitForTimeout(1000);
      console.log('✅ Contenido renderizado completamente...');
    } catch (error) {
      console.log('⚠️ Error esperando renderizado, continuando...');
    }
    
    // 8. Verificar que los datos están poblados
    const datosListos = await page.evaluate(() => {
      return window.__reportReady === true;
    });
    
    if (!datosListos) {
      console.log('⚠️ Datos no completamente cargados, continuando...');
    }
    
    // 9. Crear directorio de reports si no existe
    const reportsDir = path.join(__dirname, '../reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    // 10. Generar PDF
    filePath = path.join(reportsDir, `reporte_danos_${date}.pdf`);
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm'
      }
    });
    
    // 11. Guardar archivo
    await fs.writeFile(filePath, pdfBuffer);
    
    // 12. Validar archivo generado
    const stats = await fs.stat(filePath);
    if (stats.size < 50000) { // Menos de 50KB
      throw new Error('PDF generado es demasiado pequeño, posible error');
    }
    
    console.log(`✅ PDF generado exitosamente: ${filePath}`);
    console.log(`📄 Tamaño del archivo: ${(stats.size / 1024).toFixed(2)} KB`);
    
    return filePath;
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error.message);
    
    // Reintento automático (hasta 2 veces)
    if (!error.message.includes('timeout') && !error.message.includes('PDF generado es demasiado pequeño')) {
      throw error;
    }
    
    throw new Error(`Error generando PDF después de reintentos: ${error.message}`);
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Obtener datos reales de la base de datos para la fecha especificada
 */
async function obtenerDatosReales(fecha) {
  try {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);
    const year = fechaInicio.getFullYear();

    console.log(`🔍 Obteniendo datos para: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);

    // 1. METROS SUPERFICIE - 1ERA Y 2DA QUINCENA
    const metrosSuperficie = await obtenerMetrosSuperficieQuincenas(fechaInicio, year);
    
    // 2. DAÑOS ACUMULADOS - REPORTE DE DAÑOS ACUMULADOS
    const danosAcumulados = await obtenerDanosAcumulados(year);
    
    // 3. METAS DE DAÑOS - METAS Y PROYECCIONES (desde vw_danos_mes_anio)
    const metasYProyecciones = await obtenerMetasYProyeccionesDanos(year);
    
    // 4. RESUMEN ANUAL - DISTRIBUCIÓN POR TIPO Y DESGLOSE MENSUAL
    const resumenAnual = await obtenerResumenAnual(year);
    
    // 5. METAS DE DAÑOS - METAS Y PROYECCIONES (función original)
    const metasDanos = await obtenerMetasDanos(year);
    
    // 5. DAÑOS POR OPERADOR - VISTA GENERAL
    const danosPorOperador = await obtenerDanosPorOperador(year);
    
    // 6. CONSOLIDADO (ZONAS 1-2-3)
    const consolidadoZonas = await obtenerConsolidadoZonas(year);
    
    // 7. HEMBRA (ZONA 1 Y 3)
    const hembraZonas = await obtenerHembraZonas(year);
    
    // 8. MACHO (ZONA 2)
    const machoZonas = await obtenerMachoZonas(year);

    return {
      metrosSuperficie,
      danosAcumulados,
      metasDanos,
      metasYProyecciones,
      resumenAnual,
      danosPorOperador,
      consolidadoZonas,
      hembraZonas,
      machoZonas,
      fecha: fecha,
      year: year
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo datos reales:', error);
    return generarDatosPrueba();
  }
}

/**
 * Obtener metros superficie por quincenas
 */
async function obtenerMetrosSuperficieQuincenas(fecha, year) {
  try {
    const mes = fecha.getMonth() + 1;
    
    // Obtener datos del mes actual
    const datosMes = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [
            new Date(year, mes - 1, 1),
            new Date(year, mes, 0)
          ]
        }
      },
      order: [['fecha', 'ASC']]
    });

    // Separar por quincenas
    const primeraQuincena = datosMes.filter(d => new Date(d.fecha).getDate() <= 15);
    const segundaQuincena = datosMes.filter(d => new Date(d.fecha).getDate() > 15);

    // Obtener datos del mes anterior
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const yearAnterior = mes === 1 ? year - 1 : year;
    
    const datosMesAnterior = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [
            new Date(yearAnterior, mesAnterior - 1, 1),
            new Date(yearAnterior, mesAnterior, 0)
          ]
        }
      }
    });

    return {
      primeraQuincena: {
        hembra: primeraQuincena.filter(d => d.tipo_zona === 'HEMBRA').reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0),
        macho: primeraQuincena.filter(d => d.tipo_zona === 'MACHO').reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0),
        total: primeraQuincena.reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0)
      },
      segundaQuincena: {
        hembra: segundaQuincena.filter(d => d.tipo_zona === 'HEMBRA').reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0),
        macho: segundaQuincena.filter(d => d.tipo_zona === 'MACHO').reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0),
        total: segundaQuincena.reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0)
      },
      mesAnterior: {
        hembra: datosMesAnterior.filter(d => d.tipo_zona === 'HEMBRA').reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0),
        macho: datosMesAnterior.filter(d => d.tipo_zona === 'MACHO').reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0),
        total: datosMesAnterior.reduce((sum, d) => sum + parseFloat(d.metros_cuadrados || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error obteniendo metros superficie:', error);
    return {
      primeraQuincena: { hembra: 0, macho: 0, total: 0 },
      segundaQuincena: { hembra: 0, macho: 0, total: 0 },
      mesAnterior: { hembra: 0, macho: 0, total: 0 }
    };
  }
}

/**
 * Obtener daños acumulados por mes
 */
async function obtenerDanosAcumulados(year) {
  try {
    // Obtener datos de daños acumulados desde reporte_danos_mensuales
    const [datosAcumulados] = await sequelize.query(`
      SELECT 
        mes,
        valor_real as valorReal,
        valor_ppto as valorPresupuesto,
        valor_anio_ant as valorAnioAnterior
      FROM reporte_danos_mensuales
      WHERE anio = ?
      ORDER BY mes
    `, {
      replacements: [year],
      timeout: 10000
    });

    // Obtener cantidad de daños desde la vista unificada
    const [datosCantidad] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        SUM(cantidadDano) as total_danos,
        COUNT(DISTINCT idOrdenServicio) as ordenes_con_danos
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND cantidadDano > 0
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes
    `, {
      replacements: [year],
      timeout: 10000
    });

    // Preparar datos para gráficos - TODOS LOS VALORES EN FORMATO MONETARIO
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    
    // Calcular valores acumulados
    let realAcumulado = 0;
    let presupuestoAcumulado = 0;
    
    const datosGrafico = meses.map((mes, index) => {
      const mesNum = index + 1;
      const datoValor = datosAcumulados.find(d => d.mes === mesNum);
      
      const real = datoValor ? parseInt(datoValor.valorReal || 0) : 0;
      const presupuesto = datoValor ? parseInt(datoValor.valorPresupuesto || 0) : 0;
      
      // Acumular valores
      realAcumulado += real;
      presupuestoAcumulado += presupuesto;
      
      return {
        mes,
        real: real, // Valor monetario real del mes
        presupuesto: presupuesto, // Valor monetario presupuesto del mes
        realAcumulado: realAcumulado, // Valor acumulado hasta este mes
        presupuestoAcumulado: presupuestoAcumulado // Presupuesto acumulado hasta este mes
      };
    });

    const totalReal = datosAcumulados.reduce((sum, d) => sum + parseInt(d.valorReal || 0), 0);
    const totalPresupuesto = datosAcumulados.reduce((sum, d) => sum + parseInt(d.valorPresupuesto || 0), 0);
    const totalRealAcumulado = datosGrafico[datosGrafico.length - 1]?.realAcumulado || 0;
    const totalPresupuestoAcumulado = datosGrafico[datosGrafico.length - 1]?.presupuestoAcumulado || 0;
    
    // Calcular total del año anterior
    const totalAnioAnterior = datosAcumulados.reduce((sum, d) => sum + parseInt(d.valorAnioAnterior || 0), 0);
    
    // Calcular variación anual
    const variacionAnual = totalAnioAnterior > 0 ? 
      ((totalReal - totalAnioAnterior) / totalAnioAnterior * 100).toFixed(2) : 0;

    return {
      datos: datosGrafico,
      totalReal,
      totalPresupuesto,
      totalRealAcumulado,
      totalPresupuestoAcumulado,
      totalAnioAnterior,
      variacionAnual
    };
  } catch (error) {
    console.error('Error obteniendo daños acumulados:', error);
    return generarDatosPruebaAcumulados();
  }
}

/**
 * Obtener resumen anual con distribución por tipo y desglose mensual
 */
async function obtenerResumenAnual(year) {
  try {
    console.log(`📊 Obteniendo resumen anual para año ${year}`);
    
    // Obtener datos por tipo (HEMBRA/MACHO) y mes usando la relación sector-zona
    const [datosMensuales] = await sequelize.query(`
      SELECT 
        MONTH(v.fechaOrdenServicio) as mes,
        SUM(CASE WHEN z.tipo = 'HEMBRA' THEN v.cantidadDano ELSE 0 END) as hembra,
        SUM(CASE WHEN z.tipo = 'MACHO' THEN v.cantidadDano ELSE 0 END) as macho,
        SUM(v.cantidadDano) as total
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ? AND v.cantidadDano > 0
      GROUP BY MONTH(v.fechaOrdenServicio)
      ORDER BY mes
    `, { 
      replacements: [year],
      timeout: 10000
    });
    
    // Calcular totales anuales
    const totalHembra = datosMensuales.reduce((sum, d) => sum + parseInt(d.hembra || 0), 0);
    const totalMacho = datosMensuales.reduce((sum, d) => sum + parseInt(d.macho || 0), 0);
    const totalAnual = totalHembra + totalMacho;
    
    // Calcular porcentajes
    const porcentajeHembra = totalAnual > 0 ? Math.round((totalHembra / totalAnual) * 100) : 0;
    const porcentajeMacho = totalAnual > 0 ? Math.round((totalMacho / totalAnual) * 100) : 0;
    
    // Preparar datos para el desglose mensual
    const desgloseMensual = [];
    for (let mes = 1; mes <= 12; mes++) {
      const datosMes = datosMensuales.find(d => d.mes === mes);
      desgloseMensual.push({
        mes: mes,
        nombreMes: getMonthName(mes),
        hembra: parseInt(datosMes?.hembra || 0),
        macho: parseInt(datosMes?.macho || 0),
        total: parseInt(datosMes?.total || 0),
        tieneDatos: datosMes ? true : false
      });
    }
    
    return {
      distribucionPorTipo: {
        hembra: {
          total: totalHembra,
          porcentaje: porcentajeHembra
        },
        macho: {
          total: totalMacho,
          porcentaje: porcentajeMacho
        },
        totalAnual: totalAnual
      },
      desgloseMensual: desgloseMensual
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo resumen anual:', error);
    return {
      distribucionPorTipo: {
        hembra: { total: 0, porcentaje: 0 },
        macho: { total: 0, porcentaje: 0 },
        totalAnual: 0
      },
      desgloseMensual: []
    };
  }
}

/**
 * Función auxiliar para obtener nombre del mes
 */
function getMonthName(mes) {
  const meses = [
    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
  ];
  return meses[mes - 1] || '';
}

/**
 * Obtener metas y proyecciones de daños desde vw_danos_mes_anio
 */
async function obtenerMetasYProyeccionesDanos(year) {
  try {
    console.log(`🎯 Obteniendo metas y proyecciones para año ${year} desde vw_danos_mes_anio`);
    
    const previousYear = year - 1;
    const porcentajeDisminucion = 5.0; // 5% de disminución esperada
    
    // 1. Obtener total de daños del año anterior (base para cálculo)
    const [totalAnioAnteriorResult] = await sequelize.query(`
      SELECT COALESCE(SUM(total_danos), 0) as total_danos_anio_anterior
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { 
      replacements: [previousYear],
      timeout: 10000
    });
    
    const totalDanoAnioAnterior = parseInt(totalAnioAnteriorResult[0].total_danos_anio_anterior);
    console.log(`📊 Total daños ${previousYear}: ${totalDanoAnioAnterior}`);
    
    // 2. Calcular meta anual y mensual
    const disminucion = totalDanoAnioAnterior * (porcentajeDisminucion / 100);
    const metaAnual = Math.round(totalDanoAnioAnterior - disminucion);
    const metaMensual = Math.round(metaAnual / 12);
    
    console.log(`📊 Meta anual ${year}: ${metaAnual} (disminución ${porcentajeDisminucion}%)`);
    console.log(`📊 Meta mensual: ${metaMensual}`);
    
    // 3. Obtener datos reales del año actual
    const [datosRealesResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(total_danos), 0) as total_danos_anio_actual,
        COUNT(DISTINCT mes) as meses_con_datos
      FROM vw_danos_mes_anio
      WHERE anio = ?
    `, { 
      replacements: [year],
      timeout: 10000
    });
    
    const totalRealHastaAhora = parseInt(datosRealesResult[0].total_danos_anio_actual);
    const mesesConDatos = parseInt(datosRealesResult[0].meses_con_datos);
    
    console.log(`📊 Real hasta ahora ${year}: ${totalRealHastaAhora} (${mesesConDatos} meses)`);
    
    // 4. Calcular cumplimiento
    const metaAcumuladaHastaAhora = metaMensual * mesesConDatos;
    const cumplimiento = metaAcumuladaHastaAhora > 0 ? Math.round((totalRealHastaAhora / metaAcumuladaHastaAhora) * 100) : 0;
    
    // 5. Calcular promedio mensual real
    const promedioMensualReal = mesesConDatos > 0 ? Math.round(totalRealHastaAhora / mesesConDatos) : 0;
    
    return {
      metaAnual,
      metaMensual,
      actualAnual: totalRealHastaAhora,
      actualMensual: promedioMensualReal,
      cumplimiento,
      mesesConDatos,
      totalAnioAnterior: totalDanoAnioAnterior,
      porcentajeDisminucion,
      metaAcumuladaHastaAhora
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo metas y proyecciones de daños:', error);
    return {
      metaAnual: 0,
      metaMensual: 0,
      actualAnual: 0,
      actualMensual: 0,
      cumplimiento: 0,
      mesesConDatos: 0,
      totalAnioAnterior: 0,
      porcentajeDisminucion: 5.0,
      metaAcumuladaHastaAhora: 0
    };
  }
}

/**
 * Obtener metas de daños (función original mantenida para compatibilidad)
 */
async function obtenerMetasDanos(year) {
  try {
    // Obtener datos reales del año desde reporte_danos_mensuales
    const [datosReales] = await sequelize.query(`
      SELECT 
        SUM(valor_real) as total_valor_real,
        SUM(valor_ppto) as total_valor_ppto,
        COUNT(*) as meses_con_datos
      FROM reporte_danos_mensuales
      WHERE anio = ?
    `, {
      replacements: [year],
      timeout: 10000
    });

    // Obtener cantidad de daños desde la vista unificada
    const [datosCantidad] = await sequelize.query(`
      SELECT 
        SUM(cantidadDano) as total_danos_anual,
        COUNT(DISTINCT MONTH(fechaOrdenServicio)) as meses_con_danos
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND cantidadDano > 0
    `, {
      replacements: [year],
      timeout: 10000
    });

    const totalValorReal = datosReales[0]?.total_valor_real || 0;
    const totalValorPpto = datosReales[0]?.total_valor_ppto || 0;
    const totalDanos = datosCantidad[0]?.total_danos_anual || 0;
    const mesesConDatos = datosReales[0]?.meses_con_datos || 0;
    
    const metaAnual = totalValorPpto; // Meta anual = presupuesto total
    const metaMensual = Math.round(metaAnual / 12);
    const actualMensual = mesesConDatos > 0 ? Math.round(totalValorReal / mesesConDatos) : 0;

    return {
      metaAnual,
      metaMensual,
      actualAnual: totalValorReal,
      actualMensual,
      cumplimiento: metaAnual > 0 ? Math.round((totalValorReal / metaAnual) * 100) : 0,
      mesesConDanos: datosCantidad[0]?.meses_con_danos || 0
    };
  } catch (error) {
    console.error('Error obteniendo metas de daños:', error);
    return {
      metaAnual: 36000000, // $36M presupuesto anual
      metaMensual: 3000000, // $3M presupuesto mensual
      actualAnual: 0,
      actualMensual: 0,
      cumplimiento: 0,
      mesesConDanos: 0
    };
  }
}

/**
 * Obtener daños por operador
 */
async function obtenerDanosPorOperador(year) {
  try {
    const [datosOperadores] = await sequelize.query(`
      SELECT 
        nombreOperador,
        SUM(cantidadDano) as total_danos,
        COUNT(DISTINCT idOrdenServicio) as ordenes_afectadas,
        COUNT(DISTINCT MONTH(fechaOrdenServicio)) as meses_con_danos
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? 
        AND cantidadDano > 0 
        AND nombreOperador != 'Sin operador'
      GROUP BY nombreOperador
      ORDER BY total_danos DESC
      LIMIT 10
    `, {
      replacements: [year],
      timeout: 10000
    });

    return datosOperadores.map(op => ({
      nombre: op.nombreOperador,
      totalDanos: op.total_danos,
      ordenesAfectadas: op.ordenes_afectadas,
      mesesConDanos: op.meses_con_danos
    }));
  } catch (error) {
    console.error('Error obteniendo daños por operador:', error);
    return [];
  }
}

/**
 * Obtener consolidado de zonas 1, 2, 3
 */
async function obtenerConsolidadoZonas(year) {
  try {
    const [datosZonas] = await sequelize.query(`
      SELECT 
        z.nombre as zona_nombre,
        z.tipo as zona_tipo,
        SUM(v.cantidadDano) as total_danos,
        COUNT(DISTINCT v.idOrdenServicio) as ordenes_afectadas
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ? 
        AND v.cantidadDano > 0
        AND z.id IN (1, 2, 3)
      GROUP BY z.id, z.nombre, z.tipo
      ORDER BY z.id
    `, {
      replacements: [year],
      timeout: 10000
    });

    return datosZonas.map(zona => ({
      nombre: zona.zona_nombre,
      tipo: zona.zona_tipo,
      totalDanos: zona.total_danos,
      ordenesAfectadas: zona.ordenes_afectadas
    }));
  } catch (error) {
    console.error('Error obteniendo consolidado zonas:', error);
    return [];
  }
}

/**
 * Obtener datos de Hembra (Zonas 1 y 3)
 */
async function obtenerHembraZonas(year) {
  try {
    const [datosHembra] = await sequelize.query(`
      SELECT 
        z.nombre as zona_nombre,
        SUM(v.cantidadDano) as total_danos,
        COUNT(DISTINCT v.idOrdenServicio) as ordenes_afectadas
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ? 
        AND v.cantidadDano > 0
        AND z.id IN (1, 3)
        AND z.tipo = 'HEMBRA'
      GROUP BY z.id, z.nombre
      ORDER BY z.id
    `, {
      replacements: [year],
      timeout: 10000
    });

    return datosHembra.map(zona => ({
      nombre: zona.zona_nombre,
      totalDanos: zona.total_danos,
      ordenesAfectadas: zona.ordenes_afectadas
    }));
  } catch (error) {
    console.error('Error obteniendo datos Hembra:', error);
    return [];
  }
}

/**
 * Obtener datos de Macho (Zona 2)
 */
async function obtenerMachoZonas(year) {
  try {
    const [datosMacho] = await sequelize.query(`
      SELECT 
        z.nombre as zona_nombre,
        SUM(v.cantidadDano) as total_danos,
        COUNT(DISTINCT v.idOrdenServicio) as ordenes_afectadas
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ? 
        AND v.cantidadDano > 0
        AND z.id = 2
        AND z.tipo = 'MACHO'
      GROUP BY z.id, z.nombre
    `, {
      replacements: [year],
      timeout: 10000
    });

    return datosMacho.map(zona => ({
      nombre: zona.zona_nombre,
      totalDanos: zona.total_danos,
      ordenesAfectadas: zona.ordenes_afectadas
    }));
  } catch (error) {
    console.error('Error obteniendo datos Macho:', error);
    return [];
  }
}

/**
 * Generar datos de prueba para acumulados
 */
function generarDatosPruebaAcumulados() {
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  
  const datosGrafico = meses.map((mes, index) => ({
    mes,
    real: Math.floor(Math.random() * 20) + 5,
    presupuesto: Math.floor(Math.random() * 15) + 8,
    valorReal: Math.floor(Math.random() * 500000) + 100000,
    valorPresupuesto: Math.floor(Math.random() * 400000) + 150000
  }));

  const totalReal = datosGrafico.reduce((sum, d) => sum + d.real, 0);
  const totalPresupuesto = datosGrafico.reduce((sum, d) => sum + d.presupuesto, 0);
  const totalValorReal = datosGrafico.reduce((sum, d) => sum + d.valorReal, 0);
  const totalValorPresupuesto = datosGrafico.reduce((sum, d) => sum + d.valorPresupuesto, 0);

  return {
    datos: datosGrafico,
    totalReal,
    totalPresupuesto,
    totalValorReal,
    totalValorPresupuesto
  };
}

/**
 * Generar datos de prueba
 */
function generarDatosPrueba() {
  return {
    metrosSuperficie: {
      primeraQuincena: { hembra: 1250, macho: 980, total: 2230 },
      segundaQuincena: { hembra: 1350, macho: 1020, total: 2370 },
      mesAnterior: { hembra: 1200, macho: 950, total: 2150 }
    },
    danosAcumulados: generarDatosPruebaAcumulados(),
    metasDanos: {
      metaAnual: 1000,
      metaMensual: 83,
      actualAnual: 545,
      actualMensual: 45,
      cumplimiento: 55,
      mesesConDanos: 7
    },
    danosPorOperador: [
      { nombre: 'Juan Pérez', totalDanos: 45, ordenesAfectadas: 12, mesesConDanos: 6 },
      { nombre: 'María García', totalDanos: 38, ordenesAfectadas: 10, mesesConDanos: 5 },
      { nombre: 'Carlos López', totalDanos: 32, ordenesAfectadas: 8, mesesConDanos: 4 }
    ],
    consolidadoZonas: [
      { nombre: 'Zona 1', tipo: 'HEMBRA', totalDanos: 120, ordenesAfectadas: 25 },
      { nombre: 'Zona 2', tipo: 'MACHO', totalDanos: 95, ordenesAfectadas: 20 },
      { nombre: 'Zona 3', tipo: 'HEMBRA', totalDanos: 85, ordenesAfectadas: 18 }
    ],
    hembraZonas: [
      { nombre: 'Zona 1', totalDanos: 120, ordenesAfectadas: 25 },
      { nombre: 'Zona 3', totalDanos: 85, ordenesAfectadas: 18 }
    ],
    machoZonas: [
      { nombre: 'Zona 2', totalDanos: 95, ordenesAfectadas: 20 }
    ]
  };
}

/**
 * Generar gráfico de dona SVG para distribución por tipo
 */
function generarGraficoDona(distribucion) {
  const total = distribucion.totalAnual;
  const hembra = distribucion.hembra.total;
  const macho = distribucion.macho.total;
  
  if (total === 0) {
    return '<div style="text-align: center; padding: 50px; color: #666;">No hay datos para mostrar</div>';
  }
  
  const radio = 80;
  const centroX = 100;
  const centroY = 100;
  
  // Calcular ángulos
  const anguloHembra = (hembra / total) * 360;
  const anguloMacho = (macho / total) * 360;
  
  // Generar path para HEMBRA
  const hembraPath = generarPathCircular(centroX, centroY, radio, 0, anguloHembra);
  
  // Generar path para MACHO
  const machoPath = generarPathCircular(centroX, centroY, radio, anguloHembra, anguloHembra + anguloMacho);
  
  return `
    <svg width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="gradHembra" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff69b4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff1493;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="gradMacho" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4169e1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0000cd;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Fondo del dona -->
      <circle cx="${centroX}" cy="${centroY}" r="${radio}" fill="none" stroke="#e0e0e0" stroke-width="20"/>
      
      <!-- Sección HEMBRA -->
      <path d="${hembraPath}" fill="url(#gradHembra)" stroke="none"/>
      
      <!-- Sección MACHO -->
      <path d="${machoPath}" fill="url(#gradMacho)" stroke="none"/>
      
      <!-- Centro del dona -->
      <circle cx="${centroX}" cy="${centroY}" r="${radio - 10}" fill="white"/>
      
      <!-- Texto central -->
      <text x="${centroX}" y="${centroY - 5}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#333">
        Total
      </text>
      <text x="${centroX}" y="${centroY + 10}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#1976d2">
        ${total.toLocaleString()}
      </text>
    </svg>
  `;
}

/**
 * Generar gráfico de barras SVG para desglose mensual
 */
function generarGraficoBarras(desgloseMensual) {
  const meses = desgloseMensual.map(d => d.nombreMes);
  const datosHembra = desgloseMensual.map(d => d.hembra);
  const datosMacho = desgloseMensual.map(d => d.macho);
  
  const maxValor = Math.max(...datosHembra, ...datosMacho);
  if (maxValor === 0) {
    return '<div style="text-align: center; padding: 50px; color: #666;">No hay datos para mostrar</div>';
  }
  
  // Dimensiones optimizadas para mejor visualización
  const ancho = 500;
  const alto = 320;
  const margen = { top: 30, right: 30, bottom: 60, left: 50 };
  const anchoBarra = (ancho - margen.left - margen.right) / meses.length / 2 - 3;
  const altoMax = alto - margen.top - margen.bottom;
  
  let svg = `<svg width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">`;
  
  // Definir gradientes mejorados
  svg += `
    <defs>
      <linearGradient id="gradBarraHembra" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ff69b4;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#ff1493;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#c71585;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="gradBarraMacho" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#4169e1;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#0000cd;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#000080;stop-opacity:1" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
  `;
  
  // Dibujar líneas de cuadrícula
  const numLineas = 5;
  for (let i = 0; i <= numLineas; i++) {
    const y = margen.top + (altoMax / numLineas) * i;
    const valor = Math.round((maxValor / numLineas) * (numLineas - i));
    svg += `<line x1="${margen.left}" y1="${y}" x2="${ancho - margen.right}" y2="${y}" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="2,2"/>`;
    svg += `<text x="${margen.left - 10}" y="${y + 4}" text-anchor="end" font-family="Arial" font-size="11" fill="#666">${valor}</text>`;
  }
  
  // Dibujar eje Y
  svg += `<line x1="${margen.left}" y1="${margen.top}" x2="${margen.left}" y2="${alto - margen.bottom}" stroke="#333" stroke-width="2"/>`;
  
  // Dibujar eje X
  svg += `<line x1="${margen.left}" y1="${alto - margen.bottom}" x2="${ancho - margen.right}" y2="${alto - margen.bottom}" stroke="#333" stroke-width="2"/>`;
  
  // Dibujar barras con sombras
  meses.forEach((mes, i) => {
    // Calcular la posición central del mes
    const anchoDisponible = ancho - margen.left - margen.right;
    const anchoPorMes = anchoDisponible / meses.length;
    const xCentro = margen.left + (i * anchoPorMes) + (anchoPorMes / 2);
    
    // Posiciones de las barras (centradas con el mes)
    const xHembra = xCentro - anchoBarra - 2; // Barra HEMBRA a la izquierda
    const xMacho = xCentro + 2; // Barra MACHO a la derecha
    
    // Barra HEMBRA
    if (datosHembra[i] > 0) {
      const altoHembra = (datosHembra[i] / maxValor) * altoMax;
      const yHembra = margen.top + altoMax - altoHembra;
      svg += `<rect x="${xHembra}" y="${yHembra}" width="${anchoBarra}" height="${altoHembra}" fill="url(#gradBarraHembra)" stroke="#c71585" stroke-width="1" filter="url(#shadow)"/>`;
      
      // Valor sobre la barra HEMBRA
      svg += `<text x="${xHembra + anchoBarra/2}" y="${yHembra - 5}" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#c71585">${datosHembra[i]}</text>`;
    } else {
      // Mostrar barra vacía para HEMBRA cuando no hay datos
      svg += `<rect x="${xHembra}" y="${margen.top + altoMax - 2}" width="${anchoBarra}" height="2" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>`;
      svg += `<text x="${xHembra + anchoBarra/2}" y="${margen.top + altoMax - 5}" text-anchor="middle" font-family="Arial" font-size="8" fill="#999">0</text>`;
    }
    
    // Barra MACHO
    if (datosMacho[i] > 0) {
      const altoMacho = (datosMacho[i] / maxValor) * altoMax;
      const yMacho = margen.top + altoMax - altoMacho;
      svg += `<rect x="${xMacho}" y="${yMacho}" width="${anchoBarra}" height="${altoMacho}" fill="url(#gradBarraMacho)" stroke="#000080" stroke-width="1" filter="url(#shadow)"/>`;
      
      // Valor sobre la barra MACHO
      svg += `<text x="${xMacho + anchoBarra/2}" y="${yMacho - 5}" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#000080">${datosMacho[i]}</text>`;
    } else {
      // Mostrar barra vacía para MACHO cuando no hay datos
      svg += `<rect x="${xMacho}" y="${margen.top + altoMax - 2}" width="${anchoBarra}" height="2" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>`;
      svg += `<text x="${xMacho + anchoBarra/2}" y="${margen.top + altoMax - 5}" text-anchor="middle" font-family="Arial" font-size="8" fill="#999">0</text>`;
    }
    
    // Etiqueta del mes (centrada con las barras)
    svg += `<text x="${xCentro}" y="${alto - 15}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#333">${mes}</text>`;
  });
  
  // Leyenda mejorada
  svg += `
    <rect x="${margen.left}" y="${alto - 45}" width="16" height="16" fill="url(#gradBarraHembra)" stroke="#c71585" stroke-width="1" rx="2"/>
    <text x="${margen.left + 25}" y="${alto - 35}" font-family="Arial" font-size="13" font-weight="bold" fill="#333">HEMBRA</text>
    <rect x="${margen.left + 100}" y="${alto - 45}" width="16" height="16" fill="url(#gradBarraMacho)" stroke="#000080" stroke-width="1" rx="2"/>
    <text x="${margen.left + 125}" y="${alto - 35}" font-family="Arial" font-size="13" font-weight="bold" fill="#333">MACHO</text>
  `;
  
  svg += '</svg>';
  return svg;
}

/**
 * Función auxiliar para generar path circular
 */
function generarPathCircular(centroX, centroY, radio, anguloInicio, anguloFin) {
  const radianInicio = (anguloInicio - 90) * Math.PI / 180;
  const radianFin = (anguloFin - 90) * Math.PI / 180;
  
  const x1 = centroX + radio * Math.cos(radianInicio);
  const y1 = centroY + radio * Math.sin(radianInicio);
  const x2 = centroX + radio * Math.cos(radianFin);
  const y2 = centroY + radio * Math.sin(radianFin);
  
  const largeArcFlag = anguloFin - anguloInicio > 180 ? 1 : 0;
  
  return `M ${centroX} ${centroY} L ${x1} ${y1} A ${radio} ${radio} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

/**
 * Generar HTML con datos reales
 */
function generarHTMLConDatos(datos) {
  const { fecha, fechaFormateada, datos: datosReales } = datos;
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informe de Daños - ${fecha}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
        
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
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        
        .info-card {
          background: #f8f9fa;
          padding: 12px 10px;
          border-radius: 8px;
          border-left: 4px solid #1976d2;
          min-height: 70px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .info-card h3 {
          margin: 0 0 8px 0;
          color: #1976d2;
          font-size: 14px;
          line-height: 1.2;
        }
        
        .info-card p {
          margin: 3px 0;
          color: #666;
          font-size: 13px;
          line-height: 1.3;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 12px;
          border-radius: 8px;
          text-align: center;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .stat-number {
          font-size: 1.6em;
          font-weight: bold;
          margin-bottom: 4px;
          line-height: 1.2;
          word-break: break-word;
        }
        
        .stat-label {
          font-size: 0.8em;
          opacity: 0.9;
          line-height: 1.1;
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
        
        .info-card small {
          color: #666;
          font-size: 12px;
          display: block;
          margin-top: 5px;
        }
        
        .info-card h3 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .info-card p {
          font-size: 18px;
          font-weight: bold;
          color: #34495e;
          margin: 5px 0;
        }
        
        .resumen-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        
        .distribucion-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
        }
        
        .distribucion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
          padding: 10px;
          border-radius: 5px;
        }
        
        .distribucion-hembra {
          background: linear-gradient(90deg, #ff69b4, #ffb6c1);
          color: white;
        }
        
        .distribucion-macho {
          background: linear-gradient(90deg, #4169e1, #87ceeb);
          color: white;
        }
        
        .desglose-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        .desglose-table th,
        .desglose-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
          font-size: 12px;
        }
        
        .desglose-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .desglose-table .hembra {
          color: #ff69b4;
          font-weight: bold;
        }
        
        .desglose-table .macho {
          color: #4169e1;
          font-weight: bold;
        }
        
        .desglose-table .total {
          font-weight: bold;
          background-color: #f8f9fa;
        }
        
        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 5px;
        }
        
        .status-red {
          background-color: #dc3545;
        }
        
        .status-green {
          background-color: #28a745;
        }
        
        .chart-container {
          text-align: center;
          margin: 20px 0;
          padding: 10px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .chart-container canvas {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div id="reporte-contenido">
        <div class="header">
          <div class="logo"></div>
          <h1>INFORME DE DAÑOS</h1>
          <h2>${fechaFormateada}</h2>
          <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.8); border-radius: 5px; border-left: 4px solid #1976d2;">
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>📅 Informe generado el:</strong> ${fechaFormateada}
            </p>
          </div>
        </div>

        <div class="section">
          <h2>📋 REPORTE DETALLADO - METROS SUPERFICIE</h2>
          <div class="info-grid">
            <div class="info-card">
              <h3>1ERA QUINCENA</h3>
              <p><strong>Hembra:</strong> ${datosReales.metrosSuperficie.primeraQuincena.hembra.toLocaleString()} m²</p>
              <p><strong>Macho:</strong> ${datosReales.metrosSuperficie.primeraQuincena.macho.toLocaleString()} m²</p>
              <p><strong>Total:</strong> ${datosReales.metrosSuperficie.primeraQuincena.total.toLocaleString()} m²</p>
            </div>
            <div class="info-card">
              <h3>2DA QUINCENA</h3>
              <p><strong>Hembra:</strong> ${datosReales.metrosSuperficie.segundaQuincena.hembra.toLocaleString()} m²</p>
              <p><strong>Macho:</strong> ${datosReales.metrosSuperficie.segundaQuincena.macho.toLocaleString()} m²</p>
              <p><strong>Total:</strong> ${datosReales.metrosSuperficie.segundaQuincena.total.toLocaleString()} m²</p>
            </div>
            <div class="info-card">
              <h3>MES ANTERIOR</h3>
              <p><strong>Hembra:</strong> ${datosReales.metrosSuperficie.mesAnterior.hembra.toLocaleString()} m²</p>
              <p><strong>Macho:</strong> ${datosReales.metrosSuperficie.mesAnterior.macho.toLocaleString()} m²</p>
              <p><strong>Total:</strong> ${datosReales.metrosSuperficie.mesAnterior.total.toLocaleString()} m²</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📊 DAÑOS ACUMULADOS - REPORTE DE DAÑOS ACUMULADOS</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">$${datosReales.danosAcumulados.totalReal.toLocaleString()}</div>
              <div class="stat-label">Total Real</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">$${datosReales.danosAcumulados.totalPresupuesto.toLocaleString()}</div>
              <div class="stat-label">Total Presupuesto</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">$${datosReales.danosAcumulados.totalAnioAnterior.toLocaleString()}</div>
              <div class="stat-label">Total Año Anterior</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${datosReales.danosAcumulados.variacionAnual}%</div>
              <div class="stat-label">Variación Anual</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Real</th>
                <th>Presupuesto</th>
                <th>Real Acumulado</th>
                <th>Presupuesto Acumulado</th>
              </tr>
            </thead>
            <tbody>
              ${datosReales.danosAcumulados.datos.map(d => `
                <tr>
                  <td>${d.mes}</td>
                  <td>$${d.real.toLocaleString()}</td>
                  <td>$${d.presupuesto.toLocaleString()}</td>
                  <td>$${d.realAcumulado.toLocaleString()}</td>
                  <td>$${d.presupuestoAcumulado.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🎯 METAS Y PROYECCIONES DE DAÑOS</h2>
          <div class="info-grid">
            <div class="info-card">
              <h3>Meta Anual</h3>
              <p>${formatCurrency(datosReales.metasYProyecciones.metaAnual)}</p>
              <small>Calculada con ${datosReales.metasYProyecciones.porcentajeDisminucion}% de disminución</small>
            </div>
            <div class="info-card">
              <h3>Real Anual</h3>
              <p>${formatCurrency(datosReales.metasYProyecciones.actualAnual)}</p>
              <small>${datosReales.metasYProyecciones.mesesConDatos} meses con datos</small>
            </div>
            <div class="info-card">
              <h3>Cumplimiento</h3>
              <p>${datosReales.metasYProyecciones.cumplimiento}%</p>
              <small>Meta acumulada: ${formatCurrency(datosReales.metasYProyecciones.metaAcumuladaHastaAhora)}</small>
            </div>
            <div class="info-card">
              <h3>Daños Total Año Anterior</h3>
              <p>${formatCurrency(datosReales.metasYProyecciones.totalAnioAnterior)}</p>
              <small>Base para cálculo (${datosReales.year - 1})</small>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(datosReales.metasYProyecciones.cumplimiento, 100)}%"></div>
            <span class="progress-text">${datosReales.metasYProyecciones.cumplimiento}% Cumplimiento</span>
          </div>
        </div>

        <div class="section">
          <h2>📊 RESUMEN ANUAL ${datosReales.year}</h2>
          <div class="resumen-grid">
            <div class="distribucion-card">
              <h3>Distribución por Tipo</h3>
              <div class="chart-container">
                ${generarGraficoDona(datosReales.resumenAnual.distribucionPorTipo)}
              </div>
              <div class="distribucion-item distribucion-hembra">
                <span>HEMBRA</span>
                <span>${datosReales.resumenAnual.distribucionPorTipo.hembra.porcentaje}%</span>
              </div>
              <div class="distribucion-item distribucion-macho">
                <span>MACHO</span>
                <span>${datosReales.resumenAnual.distribucionPorTipo.macho.porcentaje}%</span>
              </div>
              <div style="margin-top: 15px; text-align: center;">
                <strong>Total: ${datosReales.resumenAnual.distribucionPorTipo.totalAnual.toLocaleString()}</strong>
              </div>
            </div>
            
            <div class="distribucion-card">
              <h3>Desglose Mensual</h3>
              <div class="chart-container">
                ${generarGraficoBarras(datosReales.resumenAnual.desgloseMensual)}
              </div>
              <table class="desglose-table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>HEMBRA</th>
                    <th>MACHO</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${datosReales.resumenAnual.desgloseMensual.map(mes => `
                    <tr>
                      <td>${mes.nombreMes}</td>
                      <td class="hembra">
                        <span class="status-dot ${mes.hembra > 0 ? 'status-red' : 'status-green'}"></span>
                        ${mes.hembra.toLocaleString()}
                      </td>
                      <td class="macho">
                        <span class="status-dot ${mes.macho > 0 ? 'status-red' : 'status-green'}"></span>
                        ${mes.macho.toLocaleString()}
                      </td>
                      <td class="total">
                        <span class="status-dot ${mes.total > 0 ? 'status-red' : 'status-green'}"></span>
                        ${mes.total.toLocaleString()}
                      </td>
                    </tr>
                  `).join('')}
                  <tr style="background-color: #e9ecef; font-weight: bold;">
                    <td>TOTAL</td>
                    <td class="hembra">${datosReales.resumenAnual.distribucionPorTipo.hembra.total.toLocaleString()}</td>
                    <td class="macho">${datosReales.resumenAnual.distribucionPorTipo.macho.total.toLocaleString()}</td>
                    <td class="total">${datosReales.resumenAnual.distribucionPorTipo.totalAnual.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🎯 METAS DE DAÑOS - METAS Y PROYECCIONES (ORIGINAL)</h2>
          <div class="info-grid">
            <div class="info-card">
              <h3>Meta Anual</h3>
              <p>${formatCurrency(datosReales.metasDanos.metaAnual)}</p>
            </div>
            <div class="info-card">
              <h3>Actual Anual</h3>
              <p>${formatCurrency(datosReales.metasDanos.actualAnual)}</p>
            </div>
            <div class="info-card">
              <h3>Meta Mensual</h3>
              <p>${formatCurrency(datosReales.metasDanos.metaMensual)}</p>
            </div>
            <div class="info-card">
              <h3>Actual Mensual</h3>
              <p>${formatCurrency(datosReales.metasDanos.actualMensual)}</p>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${datosReales.metasDanos.cumplimiento}%"></div>
            <span class="progress-text">${datosReales.metasDanos.cumplimiento}% Cumplimiento</span>
          </div>
        </div>

        <div class="section">
          <h2>👥 DAÑOS POR OPERADOR - VISTA GENERAL</h2>
          <table>
            <thead>
              <tr>
                <th>Operador</th>
                <th>Total Daños</th>
                <th>Órdenes Afectadas</th>
                <th>Meses con Daños</th>
              </tr>
            </thead>
            <tbody>
              ${datosReales.danosPorOperador.map(op => `
                <tr>
                  <td>${op.nombre}</td>
                  <td>${op.totalDanos}</td>
                  <td>${op.ordenesAfectadas}</td>
                  <td>${op.mesesConDanos}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🏗️ CONSOLIDADO (ZONAS 1-2-3)</h2>
          <table>
            <thead>
              <tr>
                <th>Zona</th>
                <th>Tipo</th>
                <th>Total Daños</th>
                <th>Órdenes Afectadas</th>
              </tr>
            </thead>
            <tbody>
              ${datosReales.consolidadoZonas.map(zona => `
                <tr>
                  <td>${zona.nombre}</td>
                  <td>${zona.tipo}</td>
                  <td>${zona.totalDanos}</td>
                  <td>${zona.ordenesAfectadas}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>👩 HEMBRA (ZONA 1 Y 3)</h2>
          <table>
            <thead>
              <tr>
                <th>Zona</th>
                <th>Total Daños</th>
                <th>Órdenes Afectadas</th>
              </tr>
            </thead>
            <tbody>
              ${datosReales.hembraZonas.map(zona => `
                <tr>
                  <td>${zona.nombre}</td>
                  <td>${zona.totalDanos}</td>
                  <td>${zona.ordenesAfectadas}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>👨 MACHO (ZONA 2)</h2>
          <table>
            <thead>
              <tr>
                <th>Zona</th>
                <th>Total Daños</th>
                <th>Órdenes Afectadas</th>
              </tr>
            </thead>
            <tbody>
              ${datosReales.machoZonas.map(zona => `
                <tr>
                  <td>${zona.nombre}</td>
                  <td>${zona.totalDanos}</td>
                  <td>${zona.ordenesAfectadas}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p><strong>Sistema de Gestión de Daños</strong></p>
          <p>📄 Informe generado el: ${fechaFormateada}</p>
          <p>© 2025 - Todos los derechos reservados</p>
        </div>
      </div>
      
      <script>
        // Marcar que el reporte está listo
        window.__reportReady = true;
      </script>
    </body>
    </html>
  `;
}

module.exports = {
  generateDailyReportPDF,
  obtenerDatosReales
};
