const axios = require('axios');

// Configurar la URL base según el entorno
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function analizarMejorasDanosOperador() {
  try {
    console.log('🔍 Analizando mejoras para el Panel de Daños por Operador...');
    
    const currentYear = new Date().getFullYear();
    
    // Obtener datos actuales
    const response = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    const data = response.data;
    
    console.log('✅ Datos obtenidos, analizando oportunidades de mejora...\n');
    
    // 1. ANÁLISIS DE TENDENCIAS MENSUALES
    console.log('📈 1. ANÁLISIS DE TENDENCIAS MENSUALES');
    
    if (data.resumenAnualTipo && data.resumenAnualTipo.HEMBRA && data.resumenAnualTipo.MACHO) {
      const meses = data.nombresMeses || [];
      const hembraMensual = data.resumenAnualTipo.HEMBRA.meses || {};
      const machoMensual = data.resumenAnualTipo.MACHO.meses || {};
      
      console.log('   Meses con mayor actividad:');
      const totalMensual = meses.map((mes, index) => {
        const hembra = hembraMensual[index + 1] || 0;
        const macho = machoMensual[index + 1] || 0;
        return {
          mes: mes,
          hembra: hembra,
          macho: macho,
          total: hembra + macho
        };
      }).sort((a, b) => b.total - a.total);
      
      totalMensual.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.mes}: ${item.total} daños (HEMBRA: ${item.hembra}, MACHO: ${item.macho})`);
      });
    }
    
    // 2. ANÁLISIS DE OPERADORES
    console.log('\n👷 2. ANÁLISIS DE OPERADORES');
    
    if (data.operadoresMensuales && data.operadoresMensuales.length > 0) {
      const operadores = data.operadoresMensuales;
      
      // Operadores con más daños
      const topOperadores = operadores.slice(0, 5);
      console.log('   Top 5 operadores con más daños:');
      topOperadores.forEach((op, index) => {
        console.log(`   ${index + 1}. ${op.nombre}: ${op.totalAnual} daños (${op.tipoZona})`);
      });
      
      // Operadores con menos daños
      const operadoresConMenosDanos = operadores.filter(op => op.totalAnual > 0).slice(-5);
      console.log('\n   Operadores con menos daños:');
      operadoresConMenosDanos.forEach((op, index) => {
        console.log(`   ${index + 1}. ${op.nombre}: ${op.totalAnual} daños (${op.tipoZona})`);
      });
      
      // Distribución por tipo de zona
      const distribucionPorTipo = operadores.reduce((acc, op) => {
        const tipo = op.tipoZona || 'SIN_CLASIFICAR';
        if (!acc[tipo]) acc[tipo] = { count: 0, totalDanos: 0 };
        acc[tipo].count++;
        acc[tipo].totalDanos += op.totalAnual;
        return acc;
      }, {});
      
      console.log('\n   Distribución por tipo de zona:');
      Object.entries(distribucionPorTipo).forEach(([tipo, info]) => {
        const promedio = info.count > 0 ? (info.totalDanos / info.count).toFixed(1) : 0;
        console.log(`   - ${tipo}: ${info.count} operadores, ${info.totalDanos} daños total, ${promedio} promedio`);
      });
    }
    
    // 3. ANÁLISIS DE PATRONES
    console.log('\n🔍 3. ANÁLISIS DE PATRONES');
    
    if (data.operadoresMensuales && data.operadoresMensuales.length > 0) {
      const operadores = data.operadoresMensuales;
      
      // Operadores con actividad constante vs esporádica
      const operadoresConActividadConstante = operadores.filter(op => {
        const mesesConActividad = Object.values(op.meses || {}).filter(val => val > 0).length;
        return mesesConActividad >= 6; // Activo en al menos 6 meses
      });
      
      const operadoresConActividadEsporadica = operadores.filter(op => {
        const mesesConActividad = Object.values(op.meses || {}).filter(val => val > 0).length;
        return mesesConActividad <= 3; // Activo en máximo 3 meses
      });
      
      console.log(`   Operadores con actividad constante (6+ meses): ${operadoresConActividadConstante.length}`);
      console.log(`   Operadores con actividad esporádica (≤3 meses): ${operadoresConActividadEsporadica.length}`);
      
      // Meses con mayor concentración de daños
      const concentracionMensual = {};
      for (let mes = 1; mes <= 12; mes++) {
        concentracionMensual[mes] = operadores.reduce((sum, op) => sum + (op.meses[mes] || 0), 0);
      }
      
      const mesesOrdenados = Object.entries(concentracionMensual)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
      
      console.log('\n   Meses con mayor concentración de daños:');
      mesesOrdenados.forEach(([mes, total], index) => {
        const nombreMes = data.nombresMeses[parseInt(mes) - 1];
        console.log(`   ${index + 1}. ${nombreMes}: ${total} daños`);
      });
    }
    
    // 4. SUGERENCIAS DE MEJORAS
    console.log('\n💡 4. SUGERENCIAS DE MEJORAS');
    
    console.log('   A. Funcionalidades de Filtrado:');
    console.log('      - Filtro por rango de fechas específico');
    console.log('      - Filtro por tipo de zona (HEMBRA/MACHO)');
    console.log('      - Filtro por sector específico');
    console.log('      - Filtro por máquina específica');
    
    console.log('\n   B. Visualizaciones Adicionales:');
    console.log('      - Gráfico de líneas para comparar años');
    console.log('      - Heatmap de daños por operador y mes');
    console.log('      - Gráfico de dispersión (daños vs tiempo)');
    console.log('      - Dashboard de alertas para operadores críticos');
    
    console.log('\n   C. Funcionalidades de Exportación:');
    console.log('      - Exportar a PDF con gráficos');
    console.log('      - Exportar a Excel con datos detallados');
    console.log('      - Generar reportes automáticos por email');
    
    console.log('\n   D. Análisis Predictivo:');
    console.log('      - Predicción de daños por operador');
    console.log('      - Identificación de patrones de riesgo');
    console.log('      - Recomendaciones de capacitación');
    
    // 5. MÉTRICAS DE RENDIMIENTO
    console.log('\n⚡ 5. MÉTRICAS DE RENDIMIENTO');
    
    const totalOperadores = data.totalesAnuales?.totalOperadores || 0;
    const totalDanos = data.totalesAnuales?.totalDanos || 0;
    const promedioDanos = data.totalesAnuales?.promedioDanosPorOperador || 0;
    
    console.log(`   - Total operadores analizados: ${totalOperadores}`);
    console.log(`   - Total daños registrados: ${totalDanos}`);
    console.log(`   - Promedio de daños por operador: ${promedioDanos}`);
    
    if (totalOperadores > 0) {
      const operadoresConAltoRiesgo = data.operadoresMensuales?.filter(op => op.totalAnual > promedioDanos * 1.5).length || 0;
      const operadoresConBajoRiesgo = data.operadoresMensuales?.filter(op => op.totalAnual < promedioDanos * 0.5).length || 0;
      
      console.log(`   - Operadores con alto riesgo (>${(promedioDanos * 1.5).toFixed(1)} daños): ${operadoresConAltoRiesgo}`);
      console.log(`   - Operadores con bajo riesgo (<${(promedioDanos * 0.5).toFixed(1)} daños): ${operadoresConBajoRiesgo}`);
    }
    
    console.log('\n✅ Análisis de mejoras completado');
    console.log('🎯 El panel está funcionando correctamente y listo para implementar mejoras adicionales');
    
  } catch (error) {
    console.error('❌ Error al analizar mejoras:', error.message);
    
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.status, error.response.statusText);
    }
  }
}

// Ejecutar el análisis
analizarMejorasDanosOperador();



