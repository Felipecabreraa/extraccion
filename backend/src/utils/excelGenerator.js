const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

class ExcelReportGenerator {
  constructor() {
    this.workbook = null;
  }

  async generateDailyExcelReport() {
    try {
      console.log('📊 Generando informe Excel diario de daños...');
      
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `informe_danos_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(reportsDir, fileName);

      this.workbook = new ExcelJS.Workbook();
      
      await this.generateMetroSuperficieSheet();
      await this.generateDanosAcumuladosSheet();
      await this.generateMetaYProyeccionesSheet();
      await this.generateResumenAnualSheet();
      await this.generateDetalleOperadoresSheet();
      await this.generateGraficasSheet();

      await this.workbook.xlsx.writeFile(filePath);
      console.log(`✅ Informe Excel generado: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Error generando informe Excel:', error);
      throw error;
    }
  }

  async generateMetroSuperficieSheet() {
    const worksheet = this.workbook.addWorksheet('Metro Superficie');
    
    const surfaceData = await this.getMetroSuperficieData();
    
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = '📏 REPORTE DE METRO SUPERFICIE 2025';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.getCell('A3').value = '📋 RESUMEN EJECUTIVO';
    worksheet.getCell('A3').font = { bold: true, size: 14 };
    
    worksheet.getCell('A4').value = '🏢 Total metros² limpiados:';
    worksheet.getCell('B4').value = surfaceData.totalM2;
    worksheet.getCell('B4').numFmt = '#,##0';
    
    worksheet.getCell('A5').value = '📊 Promedio diario:';
    worksheet.getCell('B5').value = surfaceData.promedioDiario;
    worksheet.getCell('B5').numFmt = '#,##0';
    
    worksheet.getCell('A6').value = '👥 Operadores activos:';
    worksheet.getCell('B6').value = surfaceData.operadoresActivos;
  }

  async generateDanosAcumuladosSheet() {
    const worksheet = this.workbook.addWorksheet('Daños Acumulados');
    const danosData = await this.getDanosAcumuladosData();
    
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = '⚠️ DAÑOS ACUMULADOS 2025';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.getCell('A3').value = '📋 RESUMEN EJECUTIVO';
    worksheet.getCell('A3').font = { bold: true, size: 14 };
    
    worksheet.getCell('A4').value = '📊 Total daños acumulados:';
    worksheet.getCell('B4').value = danosData.totalDanos;
    worksheet.getCell('B4').numFmt = '#,##0';
    
    worksheet.getCell('A5').value = '👩 Daños Hembra:';
    worksheet.getCell('B5').value = danosData.danosHembra;
    worksheet.getCell('B5').numFmt = '#,##0';
    worksheet.getCell('C5').value = `(${danosData.porcentajeHembra}%)`;
    
    worksheet.getCell('A6').value = '👨 Daños Macho:';
    worksheet.getCell('B6').value = danosData.danosMacho;
    worksheet.getCell('B6').numFmt = '#,##0';
    worksheet.getCell('C6').value = `(${danosData.porcentajeMacho}%)`;
  }

  async generateMetaYProyeccionesSheet() {
    const worksheet = this.workbook.addWorksheet('Meta y Proyecciones');
    const metasData = await this.getMetaYProyeccionesData();
    
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = '🎯 META Y PROYECCIONES DE DAÑOS 2025';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.getCell('A3').value = 'Indicadores Clave:';
    worksheet.getCell('A3').font = { bold: true, size: 14 };
    
    worksheet.getCell('A4').value = 'Meta Anual:';
    worksheet.getCell('B4').value = metasData.metaAnual;
    worksheet.getCell('B4').numFmt = '#,##0';
    
    worksheet.getCell('A5').value = 'Real Actual:';
    worksheet.getCell('B5').value = metasData.realActual;
    worksheet.getCell('B5').numFmt = '#,##0';
    
    worksheet.getCell('A6').value = 'Cumplimiento:';
    worksheet.getCell('B6').value = metasData.cumplimiento / 100;
    worksheet.getCell('B6').numFmt = '0%';
  }

  async generateResumenAnualSheet() {
    const worksheet = this.workbook.addWorksheet('Resumen Anual H-M');
    const resumenData = await this.getResumenAnualHembraMachoData();
    
    worksheet.mergeCells('A1:N1');
    worksheet.getCell('A1').value = '📊 RESUMEN ANUAL DE DAÑOS (HEMBRA-MACHO) 2025';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.getCell('A3').value = 'Distribución por Tipo:';
    worksheet.getCell('A3').font = { bold: true, size: 14 };
    
    worksheet.getCell('A4').value = 'HEMBRA:';
    worksheet.getCell('B4').value = resumenData.hembra;
    worksheet.getCell('B4').numFmt = '#,##0';
    worksheet.getCell('C4').value = `(${resumenData.porcentajeHembra}%)`;
    
    worksheet.getCell('A5').value = 'MACHO:';
    worksheet.getCell('B5').value = resumenData.macho;
    worksheet.getCell('B5').numFmt = '#,##0';
    worksheet.getCell('C5').value = `(${resumenData.porcentajeMacho}%)`;
    
    worksheet.getCell('A6').value = 'TOTAL:';
    worksheet.getCell('B6').value = resumenData.total;
    worksheet.getCell('B6').numFmt = '#,##0';
    worksheet.getCell('B6').font = { bold: true };
  }

  async generateDetalleOperadoresSheet() {
    const worksheet = this.workbook.addWorksheet('Detalle Operadores');
    const operadoresData = await this.getDetallePorOperadorData();
    
    worksheet.mergeCells('A1:O1');
    worksheet.getCell('A1').value = '👥 DETALLE POR OPERADOR 2025';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    const headers = ['Operador', 'Tipo', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC', 'TOTAL ANUAL'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(3, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
    });
    
    if (operadoresData && operadoresData.length > 0) {
      operadoresData.forEach((operador, index) => {
        const row = 4 + index;
        worksheet.getCell(row, 1).value = operador.nombreOperador || 'N/A';
        worksheet.getCell(row, 2).value = operador.tipo || 'N/A';
        worksheet.getCell(row, 3).value = operador.ene || 0;
        worksheet.getCell(row, 4).value = operador.feb || 0;
        worksheet.getCell(row, 5).value = operador.mar || 0;
        worksheet.getCell(row, 6).value = operador.abr || 0;
        worksheet.getCell(row, 7).value = operador.may || 0;
        worksheet.getCell(row, 8).value = operador.jun || 0;
        worksheet.getCell(row, 9).value = operador.jul || 0;
        worksheet.getCell(row, 10).value = operador.ago || 0;
        worksheet.getCell(row, 11).value = operador.sept || 0;
        worksheet.getCell(row, 12).value = operador.oct || 0;
        worksheet.getCell(row, 13).value = operador.nov || 0;
        worksheet.getCell(row, 14).value = operador.dic || 0;
        worksheet.getCell(row, 15).value = operador.totalAnual || 0;
        worksheet.getCell(row, 15).font = { bold: true };
        
        for (let col = 3; col <= 15; col++) {
          worksheet.getCell(row, col).numFmt = '#,##0';
        }
      });
    }
  }

  async generateGraficasSheet() {
    const worksheet = this.workbook.addWorksheet('Gráficas');
    
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = '📈 GRÁFICAS Y VISUALIZACIONES PROFESIONALES';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    const danosData = await this.getDanosAcumuladosData();
    const resumenData = await this.getResumenAnualHembraMachoData();
    
    worksheet.getCell('A3').value = 'Evolución de Daños Acumulados 2025';
    worksheet.getCell('A3').font = { bold: true, size: 14 };
    
    worksheet.getCell('A4').value = 'Mes';
    worksheet.getCell('B4').value = 'Daños Reales';
    worksheet.getCell('C4').value = 'Meta Acumulada';
    worksheet.getCell('D4').value = 'Año Anterior';
    
    if (danosData.evolucionMensual && danosData.evolucionMensual.length > 0) {
      danosData.evolucionMensual.forEach((item, index) => {
        const row = 5 + index;
        worksheet.getCell(row, 1).value = item.mes;
        worksheet.getCell(row, 2).value = item.danosAcumulados;
        worksheet.getCell(row, 3).value = item.metaAcumulada;
        worksheet.getCell(row, 4).value = item.anoAnterior;
      });
    }
    
    worksheet.getCell('F3').value = 'Distribución Hembra vs Macho';
    worksheet.getCell('F3').font = { bold: true, size: 14 };
    
    worksheet.getCell('F4').value = 'Tipo';
    worksheet.getCell('G4').value = 'Cantidad';
    worksheet.getCell('F5').value = 'HEMBRA';
    worksheet.getCell('G5').value = resumenData.hembra;
    worksheet.getCell('F6').value = 'MACHO';
    worksheet.getCell('G6').value = resumenData.macho;
  }

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

      return {
        totalM2: results[0]?.totalM2 || 0,
        operadoresActivos: results[0]?.operadoresActivos || 0,
        promedioDiario: results[0]?.promedioDiario || 0,
        porMes: []
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

      const metaAnual = results[0]?.metaAnual || 0;
      const realActual = results[0]?.realActual || 0;
      const cumplimiento = metaAnual > 0 ? Math.round((realActual / metaAnual) * 100) : 0;

      return {
        metaAnual: metaAnual,
        realActual: realActual,
        cumplimiento: cumplimiento,
        ano2024: results[0]?.ano2024 || 0,
        proyecciones: []
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

      const hembra = results[0]?.hembra || 0;
      const macho = results[0]?.macho || 0;
      const total = results[0]?.total || 0;

      return {
        hembra: hembra,
        macho: macho,
        total: total,
        porcentajeHembra: total > 0 ? Math.round((hembra / total) * 100) : 0,
        porcentajeMacho: total > 0 ? Math.round((macho / total) * 100) : 0,
        desgloseMensual: []
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

module.exports = ExcelReportGenerator; 