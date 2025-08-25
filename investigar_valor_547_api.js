const axios = require('axios');

// Configurar axios para hacer peticiones al backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
});

async function investigarValor547() {
  try {
    console.log('🔍 Investigando el valor 547 en el dashboard de daños por operador...\n');
    
    const currentYear = 2025;
    
    console.log(`📊 Analizando datos para el año ${currentYear}...\n`);
    
    // 1. Obtener estadísticas de daños por operador
    console.log('1️⃣ Obteniendo estadísticas de daños por operador...');
    const response = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    const data = response.data;
    
    console.log('📋 Datos obtenidos del backend:');
    console.log(`   - Total operadores: ${data.totalesAnuales?.totalOperadores || 'N/A'}`);
    console.log(`   - Total daños: ${data.totalesAnuales?.totalDanos || 'N/A'}`);
    console.log(`   - Promedio por operador: ${data.totalesAnuales?.promedioDanosPorOperador || 'N/A'}`);
    console.log('');
    
    // 2. Analizar resumen anual por tipo
    console.log('2️⃣ Analizando resumen anual por tipo...');
    const resumenAnualTipo = data.resumenAnualTipo || {};
    
    console.log('📊 Resumen por tipo de zona:');
    Object.keys(resumenAnualTipo).forEach(tipo => {
      const datos = resumenAnualTipo[tipo];
      console.log(`   - ${tipo}: ${datos.total || 0} daños totales`);
      
      // Mostrar desglose mensual
      if (datos.meses) {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
        const desgloseMensual = meses.map((mes, index) => {
          const valor = datos.meses[index + 1] || 0;
          return valor > 0 ? `${mes}:${valor}` : null;
        }).filter(Boolean).join(', ');
        
        if (desgloseMensual) {
          console.log(`     Desglose mensual: ${desgloseMensual}`);
        }
      }
    });
    console.log('');
    
    // 3. Calcular el valor que se muestra en el frontend
    console.log('3️⃣ Calculando valor mostrado en el frontend...');
    const hembraTotal = resumenAnualTipo.HEMBRA?.total || 0;
    const machoTotal = resumenAnualTipo.MACHO?.total || 0;
    const sinClasificarTotal = resumenAnualTipo.SIN_CLASIFICAR?.total || 0;
    
    const totalHembraMacho = hembraTotal + machoTotal;
    const totalTodosLosTipos = hembraTotal + machoTotal + sinClasificarTotal;
    
    console.log('🔍 Cálculos:');
    console.log(`   - HEMBRA total: ${hembraTotal}`);
    console.log(`   - MACHO total: ${machoTotal}`);
    console.log(`   - SIN_CLASIFICAR total: ${sinClasificarTotal}`);
    console.log(`   - HEMBRA + MACHO: ${totalHembraMacho}`);
    console.log(`   - Todos los tipos: ${totalTodosLosTipos}`);
    console.log(`   - Valor mostrado en frontend: 547`);
    console.log('');
    
    // 4. Verificar cuál coincide con 547
    console.log('4️⃣ Verificando coincidencias...');
    if (totalHembraMacho === 547) {
      console.log('   ✅ El valor 547 corresponde a HEMBRA + MACHO únicamente');
      console.log('   📝 Esto significa que el frontend solo muestra daños de zonas clasificadas como HEMBRA o MACHO');
    } else if (totalTodosLosTipos === 547) {
      console.log('   ✅ El valor 547 corresponde a todos los tipos de zona');
      console.log('   📝 Esto incluye HEMBRA, MACHO y SIN_CLASIFICAR');
    } else {
      console.log('   ❓ El valor 547 no coincide con ninguna de las consultas verificadas');
      console.log('   🔍 Posibles causas:');
      console.log('      - Datos diferentes entre backend y frontend');
      console.log('      - Cálculo adicional en el frontend');
      console.log('      - Filtros adicionales aplicados');
    }
    console.log('');
    
    // 5. Analizar top operadores
    console.log('5️⃣ Analizando top operadores...');
    const topOperadores = data.topOperadores || [];
    console.log('👷 Top 5 operadores con más daños:');
    topOperadores.slice(0, 5).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    console.log('');
    
    // 6. Verificar metadata
    console.log('6️⃣ Verificando metadata...');
    const metadata = data.metadata || {};
    console.log('📋 Metadata de la consulta:');
    console.log(`   - Año: ${metadata.year}`);
    console.log(`   - Fuente: ${metadata.fuente}`);
    console.log(`   - Filtros: ${JSON.stringify(metadata.filtros)}`);
    console.log(`   - Timestamp: ${metadata.timestamp}`);
    console.log('');
    
    // 7. Resumen final
    console.log('🎯 RESUMEN FINAL:');
    console.log(`   - Valor mostrado en el frontend: 547`);
    console.log(`   - HEMBRA + MACHO: ${totalHembraMacho}`);
    console.log(`   - Todos los tipos: ${totalTodosLosTipos}`);
    console.log(`   - Total daños del backend: ${data.totalesAnuales?.totalDanos || 'N/A'}`);
    
    if (totalHembraMacho === 547) {
      console.log('   ✅ CONCLUSIÓN: El valor 547 es la suma de daños de zonas HEMBRA + MACHO');
      console.log('   📊 Esto excluye daños de zonas SIN_CLASIFICAR');
    } else if (totalTodosLosTipos === 547) {
      console.log('   ✅ CONCLUSIÓN: El valor 547 incluye todos los tipos de zona');
      console.log('   📊 Esto incluye HEMBRA, MACHO y SIN_CLASIFICAR');
    } else {
      console.log('   ❓ CONCLUSIÓN: El valor 547 no coincide con los datos del backend');
      console.log('   🔍 Se requiere investigación adicional');
    }
    
  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

investigarValor547();





