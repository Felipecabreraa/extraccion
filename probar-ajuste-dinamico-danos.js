const axios = require('axios');

// Configuración de la API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

async function probarAjusteDinamico() {
  try {
    console.log('🧪 Probando ajuste dinámico de daños acumulados...\n');
    
    // Obtener fecha actual
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();
    
    console.log(`📅 Fecha actual: ${fechaActual.toLocaleDateString('es-CL')}`);
    console.log(`📅 Mes actual: ${mesActual} (${getMonthName(mesActual)})`);
    console.log(`📅 Año actual: ${anioActual}\n`);
    
    // Probar diferentes años
    const añosParaProbar = [anioActual - 1, anioActual, anioActual + 1];
    
    for (const año of añosParaProbar) {
      console.log(`🔍 Probando año: ${año}`);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/danos-acumulados?anio=${año}`);
        const datos = response.data;
        
        console.log(`✅ Datos obtenidos para ${año}`);
        console.log(`📊 Ajuste dinámico:`, datos.ajuste_dinamico);
        
        // Verificar que la línea real se ajusta correctamente
        const datosGrafico = datos.datos_grafico || [];
        const mesesConDatosReales = datosGrafico.filter(mes => mes.real_acumulado > 0).length;
        const mesLimiteReal = datos.ajuste_dinamico?.mes_limite_real || 0;
        
        console.log(`📈 Meses con datos reales: ${mesesConDatosReales}`);
        console.log(`🎯 Mes límite real: ${mesLimiteReal} (${getMonthName(mesLimiteReal)})`);
        
        // Verificar que los datos se ajustan correctamente
        let datosCorrectos = true;
        for (let i = 0; i < datosGrafico.length; i++) {
          const mes = datosGrafico[i];
          const numeroMes = i + 1;
          
          if (numeroMes > mesLimiteReal && datos.ajuste_dinamico?.es_anio_actual) {
            // Para meses futuros en año actual, debería mantener el último valor
            const ultimoMesConDatos = Math.max(0, mesLimiteReal);
            if (ultimoMesConDatos > 0) {
              const valorEsperado = datosGrafico[ultimoMesConDatos - 1].real_acumulado;
              if (mes.real_acumulado !== valorEsperado) {
                console.log(`❌ Error en mes ${numeroMes}: esperado ${valorEsperado}, obtenido ${mes.real_acumulado}`);
                datosCorrectos = false;
              }
            }
          }
        }
        
        if (datosCorrectos) {
          console.log(`✅ Ajuste dinámico correcto para ${año}`);
        } else {
          console.log(`❌ Problemas en el ajuste dinámico para ${año}`);
        }
        
        console.log(`💰 Total real: ${datos.kpis?.total_real_actual_formateado || '$0'}`);
        console.log(`💰 Total presupuesto: ${datos.kpis?.total_ppto_actual_formateado || '$0'}`);
        console.log('---\n');
        
      } catch (error) {
        console.log(`❌ Error obteniendo datos para ${año}:`, error.message);
        console.log('---\n');
      }
    }
    
    console.log('🎉 Prueba de ajuste dinámico completada');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

function getMonthName(month) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[month - 1] || 'Desconocido';
}

// Ejecutar la prueba
if (require.main === module) {
  probarAjusteDinamico();
}

module.exports = { probarAjusteDinamico };




