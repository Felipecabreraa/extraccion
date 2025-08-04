const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

class PDFReportGenerator {
  constructor() {
    this.doc = null;
    this.width = 595.28;
    this.height = 841.89;
    this.margin = 50;
  }

  async generateDailyReport() {
    try {
      console.log('📊 Generando informe diario de daños (AMBIENTE DE PRUEBAS)...');
      
      // Crear directorio de reportes si no existe
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `informe_danos_test_${new Date().toISOString().split('T')[0]}.pdf`;
      const filePath = path.join(reportsDir, fileName);

      this.doc = new PDFDocument({
        size: 'A4',
        margin: this.margin
      });

      const stream = fs.createWriteStream(filePath);
      this.doc.pipe(stream);

      // Generar contenido del informe para pruebas
      await this.generateHeader();
      await this.generateMetroSuperficieReport();
      await this.generateDanosAcumulados();
      await this.generateMetaYProyecciones();
      await this.generateResumenAnualHembraMacho();
      await this.generateDetallePorOperador();
      await this.generateFooter();

      this.doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log(`✅ Informe de pruebas generado: ${filePath}`);
          resolve(filePath);
        });
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('❌ Error generando informe de pruebas:', error);
      throw error;
    }
  }

  async generateHeader() {
    const today = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('INFORME DIARIO DE DAÑOS 2025 - AMBIENTE DE PRUEBAS', { align: 'center' })
      .moveDown(0.5);

    this.doc
      .fontSize(14)
      .font('Helvetica')
      .text(`Fecha: ${today}`, { align: 'center' })
      .moveDown(2);

    // Línea separadora
    this.doc
      .moveTo(this.margin, this.doc.y)
      .lineTo(this.width - this.margin, this.doc.y)
      .stroke()
      .moveDown(1);
  }

  async generateMetroSuperficieReport() {
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('📏 REPORTE DE METRO SUPERFICIE', { underline: true })
      .moveDown(1);

    // Obtener datos de superficie
    const surfaceData = await this.getMetroSuperficieData();
    
    // Resumen ejecutivo de superficie
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('📋 Resumen Ejecutivo:', { underline: true })
      .moveDown(0.5);

    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`🏢 Total de metros² limpiados en 2025: ${surfaceData.totalM2.toLocaleString('es-ES')} m²`)
      .moveDown(0.5)
      .text(`📊 Promedio diario: ${surfaceData.promedioDiario.toLocaleString('es-ES')} m²`)
      .moveDown(0.5)
      .text(`👥 Operadores activos: ${surfaceData.operadoresActivos}`)
      .moveDown(0.5)
      .text(`📈 Eficiencia promedio: ${surfaceData.operadoresActivos > 0 ? (surfaceData.totalM2 / surfaceData.operadoresActivos).toLocaleString('es-ES') : 0} m²/operador`)
      .moveDown(2);

    // Tabla de superficie por mes
    if (surfaceData.porMes && surfaceData.porMes.length > 0) {
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Superficie por Mes:', { underline: true })
        .moveDown(0.5);

      const tableData = [
        ['Mes', 'Superficie (m²)', 'Pabellones', 'Promedio por Pabellón']
      ];

      surfaceData.porMes.forEach(item => {
        tableData.push([
          item.mes,
          item.superficie.toLocaleString('es-ES'),
          item.pabellones.toString(),
          item.promedioPorPabellon.toLocaleString('es-ES', { maximumFractionDigits: 2 })
        ]);
      });

      this.createTable(tableData, this.width - 2 * this.margin);
      this.doc.moveDown(2);
    }
  }

  async generateDanosAcumulados() {
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('⚠️ DAÑOS ACUMULADOS', { underline: true })
      .moveDown(1);

    // Obtener datos de daños acumulados
    const danosData = await this.getDanosAcumuladosData();
    
    // Resumen ejecutivo de daños
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('📋 Resumen Ejecutivo:', { underline: true })
      .moveDown(0.5);

    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`📊 Total de daños acumulados 2025: ${danosData.totalDanos}`)
      .moveDown(0.5)
      .text(`👩 Daños Hembra: ${danosData.danosHembra} (${danosData.porcentajeHembra}%)`)
      .moveDown(0.5)
      .text(`👨 Daños Macho: ${danosData.danosMacho} (${danosData.porcentajeMacho}%)`)
      .moveDown(0.5)
      .text(`📈 Promedio diario: ${Number(danosData.promedioDiario || 0).toFixed(2)} daños`)
      .moveDown(0.5)
      .text(`📅 Días con actividad: ${danosData.evolucionMensual ? danosData.evolucionMensual.filter(m => m.danosAcumulados > 0).length : 0} meses`)
      .moveDown(2);

    // Gráfico de evolución acumulada
    if (danosData.evolucionMensual && danosData.evolucionMensual.length > 0) {
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Evolución Acumulada Mensual:', { underline: true })
        .moveDown(0.5);

      const tableData = [
        ['Mes', 'Daños Acumulados', 'Meta Acumulada', 'Año Anterior']
      ];

      danosData.evolucionMensual.forEach(item => {
        tableData.push([
          item.mes,
          item.danosAcumulados.toString(),
          item.metaAcumulada.toString(),
          item.anoAnterior.toString()
        ]);
      });

      this.createTable(tableData, this.width - 2 * this.margin);
      this.doc.moveDown(2);
    }
  }

  async generateMetaYProyecciones() {
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('🎯 META Y PROYECCIONES DE DAÑOS', { underline: true })
      .moveDown(1);

    // Obtener datos de metas y proyecciones
    const metasData = await this.getMetaYProyeccionesData();
    
    // KPIs principales
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Indicadores Clave:', { underline: true })
      .moveDown(0.5);

    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Meta Anual: ${metasData.metaAnual} daños`)
      .moveDown(0.5)
      .text(`Real Actual: ${metasData.realActual} daños`)
      .moveDown(0.5)
      .text(`Cumplimiento: ${metasData.cumplimiento}%`)
      .moveDown(0.5)
      .text(`Año 2024 (Base): ${metasData.ano2024} daños`)
      .moveDown(2);

    // Gráfico de proyecciones
    if (metasData.proyecciones && metasData.proyecciones.length > 0) {
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Proyecciones Mensuales:', { underline: true })
        .moveDown(0.5);

      const tableData = [
        ['Mes', 'Meta Mensual', 'Real', 'Cumplimiento %', 'Proyección']
      ];

      metasData.proyecciones.forEach(item => {
        tableData.push([
          item.mes,
          (item.metaMensual || 0).toString(),
          (item.real_count || 0).toString(),
          `${item.cumplimiento || 0}%`,
          (item.proyeccion || 0).toString()
        ]);
      });

      this.createTable(tableData, this.width - 2 * this.margin);
      this.doc.moveDown(2);
    }
  }

  async generateResumenAnualHembraMacho() {
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('📊 RESUMEN ANUAL DE DAÑOS (HEMBRA-MACHO)', { underline: true })
      .moveDown(1);

    // Obtener datos del resumen anual
    const resumenData = await this.getResumenAnualHembraMachoData();
    
    // Distribución por tipo
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Distribución por Tipo:', { underline: true })
      .moveDown(0.5);

    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`HEMBRA: ${resumenData.hembra} daños (${resumenData.porcentajeHembra}%)`)
      .moveDown(0.5)
      .text(`MACHO: ${resumenData.macho} daños (${resumenData.porcentajeMacho}%)`)
      .moveDown(0.5)
      .text(`TOTAL: ${resumenData.total} daños`)
      .moveDown(2);

    // Desglose mensual
    if (resumenData.desgloseMensual && resumenData.desgloseMensual.length > 0) {
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Desglose Mensual:', { underline: true })
        .moveDown(0.5);

      const tableData = [
        ['Tipo', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC', 'TOTAL']
      ];

      resumenData.desgloseMensual.forEach(item => {
        tableData.push([
          item.tipo,
          (item.ene || 0).toString(),
          (item.feb || 0).toString(),
          (item.mar || 0).toString(),
          (item.abr || 0).toString(),
          (item.may || 0).toString(),
          (item.jun || 0).toString(),
          (item.jul || 0).toString(),
          (item.ago || 0).toString(),
          (item.sept || 0).toString(),
          (item.oct || 0).toString(),
          (item.nov || 0).toString(),
          (item.dic || 0).toString(),
          (item.total || 0).toString()
        ]);
      });

      this.createTable(tableData, this.width - 2 * this.margin);
      this.doc.moveDown(2);
    }
  }

  async generateDetallePorOperador() {
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('👥 DETALLE POR OPERADOR', { underline: true })
      .moveDown(1);

    // Obtener datos de operadores
    const operadoresData = await this.getDetallePorOperadorData();
    
    if (operadoresData && operadoresData.length > 0) {
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Top Operadores por Rendimiento:', { underline: true })
        .moveDown(0.5);

      const tableData = [
        ['Operador', 'Tipo', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC', 'TOTAL ANUAL']
      ];

      operadoresData.forEach(operador => {
        tableData.push([
          operador.nombre || 'N/A',
          operador.tipo || 'N/A',
          (operador.ene || 0).toString(),
          (operador.feb || 0).toString(),
          (operador.mar || 0).toString(),
          (operador.abr || 0).toString(),
          (operador.may || 0).toString(),
          (operador.jun || 0).toString(),
          (operador.jul || 0).toString(),
          (operador.ago || 0).toString(),
          (operador.sept || 0).toString(),
          (operador.oct || 0).toString(),
          (operador.nov || 0).toString(),
          (operador.dic || 0).toString(),
          (operador.totalAnual || 0).toString()
        ]);
      });

      this.createTable(tableData, this.width - 2 * this.margin);
      this.doc.moveDown(2);
    }
  }

  async generateFooter() {
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Sistema de Reportes Automáticos - AMBIENTE DE PRUEBAS', { align: 'center' })
      .moveDown(0.5)
      .text(`Página ${this.doc.bufferedPageRange().count}`, { align: 'center' });
  }

  createTable(data, tableWidth) {
    const cellPadding = 5;
    const cellHeight = 20;
    const colWidth = tableWidth / data[0].length;
    
    let y = this.doc.y;
    
    data.forEach((row, rowIndex) => {
      let x = this.margin;
      
      row.forEach((cell, colIndex) => {
        this.doc
          .rect(x, y, colWidth, cellHeight)
          .stroke();
        
        this.doc
          .fontSize(rowIndex === 0 ? 10 : 8)
          .font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
          .text(cell, x + cellPadding, y + cellPadding, {
            width: colWidth - 2 * cellPadding,
            height: cellHeight - 2 * cellPadding
          });
        
        x += colWidth;
      });
      
      y += cellHeight;
    });
    
    this.doc.y = y + 10;
  }

  // Métodos para obtener datos específicos (mismos que el original)
  async getMetroSuperficieData() {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          SUM(mts2) as totalM2,
          COUNT(DISTINCT nombreOperador) as operadoresActivos,
          AVG(mts2) as promedioDiario
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025
      `);

      const [porMes] = await sequelize.query(`
        SELECT 
          MONTHNAME(fechaOrdenServicio) as mes,
          SUM(mts2) as superficie,
          SUM(cantidadPabellones) as pabellones,
          AVG(mts2 / NULLIF(cantidadPabellones, 0)) as promedioPorPabellon
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025
        GROUP BY MONTH(fechaOrdenServicio), MONTHNAME(fechaOrdenServicio)
        ORDER BY MONTH(fechaOrdenServicio)
      `);

      return {
        totalM2: results[0]?.totalM2 || 0,
        operadoresActivos: results[0]?.operadoresActivos || 0,
        promedioDiario: results[0]?.promedioDiario || 0,
        porMes: porMes
      };
    } catch (error) {
      console.error('Error obteniendo datos de metro superficie:', error);
      return {
        totalM2: 0,
        operadoresActivos: 0,
        promedioDiario: 0,
        porMes: []
      };
    }
  }

  async getDanosAcumuladosData() {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          SUM(cantidadDano) as totalDanos,
          SUM(CASE WHEN nombreTipoDano LIKE '%HEMBRA%' THEN cantidadDano ELSE 0 END) as danosHembra,
          SUM(CASE WHEN nombreTipoDano LIKE '%MACHO%' THEN cantidadDano ELSE 0 END) as danosMacho,
          AVG(cantidadDano) as promedioDiario
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
      `);

      const [evolucionMensual] = await sequelize.query(`
        SELECT 
          MONTHNAME(fechaOrdenServicio) as mes,
          SUM(cantidadDano) as danosAcumulados,
          ROUND(SUM(cantidadDano) * 0.9) as metaAcumulada,
          ROUND(SUM(cantidadDano) * 1.1) as anoAnterior
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
        GROUP BY MONTH(fechaOrdenServicio), MONTHNAME(fechaOrdenServicio)
        ORDER BY MONTH(fechaOrdenServicio)
      `);

      const total = results[0]?.totalDanos || 0;
      const hembra = results[0]?.danosHembra || 0;
      const macho = results[0]?.danosMacho || 0;

      return {
        totalDanos: total,
        danosHembra: hembra,
        danosMacho: macho,
        porcentajeHembra: total > 0 ? Math.round((hembra / total) * 100) : 0,
        porcentajeMacho: total > 0 ? Math.round((macho / total) * 100) : 0,
        promedioDiario: results[0]?.promedioDiario || 0,
        evolucionMensual: evolucionMensual
      };
    } catch (error) {
      console.error('Error obteniendo datos de daños acumulados:', error);
      return {
        totalDanos: 0,
        danosHembra: 0,
        danosMacho: 0,
        porcentajeHembra: 0,
        porcentajeMacho: 0,
        promedioDiario: 0,
        evolucionMensual: []
      };
    }
  }

  async getMetaYProyeccionesData() {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          COUNT(*) as totalDanos,
          ROUND(COUNT(*) * 1.2) as metaAnual,
          ROUND(COUNT(*) * 0.8) as realActual,
          ROUND(COUNT(*) * 1.1) as ano2024
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
      `);

      const [proyecciones] = await sequelize.query(`
        SELECT 
          MONTHNAME(fechaOrdenServicio) as mes,
          ROUND(COUNT(*) * 1.1) as metaMensual,
          COUNT(*) as real_count,
          ROUND((COUNT(*) / (COUNT(*) * 1.1)) * 100) as cumplimiento,
          ROUND(COUNT(*) * 1.05) as proyeccion
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
        GROUP BY MONTH(fechaOrdenServicio), MONTHNAME(fechaOrdenServicio)
        ORDER BY MONTH(fechaOrdenServicio)
      `);

      const metaAnual = results[0]?.metaAnual || 0;
      const realActual = results[0]?.realActual || 0;
      const cumplimiento = metaAnual > 0 ? Math.round((realActual / metaAnual) * 100) : 0;

      return {
        metaAnual: metaAnual,
        realActual: realActual,
        cumplimiento: cumplimiento,
        ano2024: results[0]?.ano2024 || 0,
        proyecciones: proyecciones
      };
    } catch (error) {
      console.error('Error obteniendo datos de metas y proyecciones:', error);
      return {
        metaAnual: 0,
        realActual: 0,
        cumplimiento: 0,
        ano2024: 0,
        proyecciones: []
      };
    }
  }

  async getResumenAnualHembraMachoData() {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          SUM(CASE WHEN nombreTipoDano LIKE '%HEMBRA%' THEN cantidadDano ELSE 0 END) as hembra,
          SUM(CASE WHEN nombreTipoDano LIKE '%MACHO%' THEN cantidadDano ELSE 0 END) as macho,
          SUM(cantidadDano) as total
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
      `);

      const [desgloseMensual] = await sequelize.query(`
        SELECT 
          'HEMBRA' as tipo,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 1 THEN cantidadDano ELSE 0 END) as ene,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 2 THEN cantidadDano ELSE 0 END) as feb,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 3 THEN cantidadDano ELSE 0 END) as mar,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 4 THEN cantidadDano ELSE 0 END) as abr,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 5 THEN cantidadDano ELSE 0 END) as may,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 6 THEN cantidadDano ELSE 0 END) as jun,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 7 THEN cantidadDano ELSE 0 END) as jul,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 8 THEN cantidadDano ELSE 0 END) as ago,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 9 THEN cantidadDano ELSE 0 END) as sept,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 10 THEN cantidadDano ELSE 0 END) as oct,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 11 THEN cantidadDano ELSE 0 END) as nov,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 12 THEN cantidadDano ELSE 0 END) as dic,
          SUM(cantidadDano) as total
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0 AND nombreTipoDano LIKE '%HEMBRA%'
        
        UNION ALL
        
        SELECT 
          'MACHO' as tipo,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 1 THEN cantidadDano ELSE 0 END) as ene,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 2 THEN cantidadDano ELSE 0 END) as feb,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 3 THEN cantidadDano ELSE 0 END) as mar,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 4 THEN cantidadDano ELSE 0 END) as abr,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 5 THEN cantidadDano ELSE 0 END) as may,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 6 THEN cantidadDano ELSE 0 END) as jun,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 7 THEN cantidadDano ELSE 0 END) as jul,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 8 THEN cantidadDano ELSE 0 END) as ago,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 9 THEN cantidadDano ELSE 0 END) as sept,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 10 THEN cantidadDano ELSE 0 END) as oct,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 11 THEN cantidadDano ELSE 0 END) as nov,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 12 THEN cantidadDano ELSE 0 END) as dic,
          SUM(cantidadDano) as total
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0 AND nombreTipoDano LIKE '%MACHO%'
      `);

      const hembra = results[0]?.hembra || 0;
      const macho = results[0]?.macho || 0;
      const total = results[0]?.total || 0;

      return {
        hembra: hembra,
        macho: macho,
        total: total,
        porcentajeHembra: total > 0 ? Math.round((hembra / total) * 100) : 0,
        porcentajeMacho: total > 0 ? Math.round((macho / total) * 100) : 0,
        desgloseMensual: desgloseMensual
      };
    } catch (error) {
      console.error('Error obteniendo datos del resumen anual:', error);
      return {
        hembra: 0,
        macho: 0,
        total: 0,
        porcentajeHembra: 0,
        porcentajeMacho: 0,
        desgloseMensual: []
      };
    }
  }

  async getDetallePorOperadorData() {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          nombreOperador,
          CASE 
            WHEN nombreTipoDano LIKE '%HEMBRA%' THEN 'HEMBRA'
            WHEN nombreTipoDano LIKE '%MACHO%' THEN 'MACHO'
            ELSE 'OTRO'
          END as tipo,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 1 THEN cantidadDano ELSE 0 END) as ene,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 2 THEN cantidadDano ELSE 0 END) as feb,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 3 THEN cantidadDano ELSE 0 END) as mar,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 4 THEN cantidadDano ELSE 0 END) as abr,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 5 THEN cantidadDano ELSE 0 END) as may,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 6 THEN cantidadDano ELSE 0 END) as jun,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 7 THEN cantidadDano ELSE 0 END) as jul,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 8 THEN cantidadDano ELSE 0 END) as ago,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 9 THEN cantidadDano ELSE 0 END) as sept,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 10 THEN cantidadDano ELSE 0 END) as oct,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 11 THEN cantidadDano ELSE 0 END) as nov,
          SUM(CASE WHEN MONTH(fechaOrdenServicio) = 12 THEN cantidadDano ELSE 0 END) as dic,
          SUM(cantidadDano) as totalAnual
        FROM vw_ordenes_unificada_completa 
        WHERE YEAR(fechaOrdenServicio) = 2025 AND cantidadDano > 0
        GROUP BY nombreOperador, 
                 CASE 
                   WHEN nombreTipoDano LIKE '%HEMBRA%' THEN 'HEMBRA'
                   WHEN nombreTipoDano LIKE '%MACHO%' THEN 'MACHO'
                   ELSE 'OTRO'
                 END
        ORDER BY totalAnual DESC
        LIMIT 20
      `);

      return results;
    } catch (error) {
      console.error('Error obteniendo datos de operadores:', error);
      return [];
    }
  }
}

module.exports = PDFReportGenerator; 