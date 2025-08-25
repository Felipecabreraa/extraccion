const axios = require('axios');

// Configurar axios para hacer peticiones al backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
});

async function analizarSectoresTemporal() {
  try {
    console.log('🔍 Analizando sectores sin clasificar (análisis temporal)...\n');
    
    const currentYear = 2025;
    
    console.log(`📊 Analizando datos para el año ${currentYear}...\n`);
    
    // 1. Obtener datos de daños por operador para analizar
    console.log('1️⃣ Obteniendo datos de daños por operador...');
    const response = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    const data = response.data;
    
    console.log('✅ Datos obtenidos exitosamente\n');
    
    // 2. Analizar el resumen anual por tipo
    console.log('2️⃣ Analizando resumen anual por tipo...');
    const resumenAnualTipo = data.resumenAnualTipo || {};
    
    console.log('📊 Resumen de daños por tipo de zona:');
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
    
    // 3. Calcular totales
    const totalHEMBRA = resumenAnualTipo.HEMBRA?.total || 0;
    const totalMACHO = resumenAnualTipo.MACHO?.total || 0;
    const totalSIN_CLASIFICAR = resumenAnualTipo.SIN_CLASIFICAR?.total || 0;
    const totalTodos = totalHEMBRA + totalMACHO + totalSIN_CLASIFICAR;
    
    console.log('3️⃣ Análisis de totales:');
    console.log(`   - HEMBRA: ${totalHEMBRA} daños`);
    console.log(`   - MACHO: ${totalMACHO} daños`);
    console.log(`   - SIN_CLASIFICAR: ${totalSIN_CLASIFICAR} daños`);
    console.log(`   - TOTAL: ${totalTodos} daños`);
    console.log(`   - HEMBRA + MACHO: ${totalHEMBRA + totalMACHO} daños`);
    console.log('');
    
    // 4. Analizar operadores mensuales para identificar patrones
    console.log('4️⃣ Analizando operadores mensuales...');
    const operadoresMensuales = data.operadoresMensuales || [];
    
    // Agrupar operadores por tipo de zona
    const operadoresPorTipo = {};
    operadoresMensuales.forEach(operador => {
      const tipo = operador.tipoZona || 'SIN_CLASIFICAR';
      if (!operadoresPorTipo[tipo]) {
        operadoresPorTipo[tipo] = [];
      }
      operadoresPorTipo[tipo].push(operador);
    });
    
    console.log('📊 Operadores por tipo de zona:');
    Object.keys(operadoresPorTipo).forEach(tipo => {
      const operadores = operadoresPorTipo[tipo];
      console.log(`   - ${tipo}: ${operadores.length} operadores`);
      
      if (tipo === 'SIN_CLASIFICAR') {
        console.log('     Operadores sin clasificar:');
        operadores.forEach(op => {
          console.log(`       * ${op.nombre} (${op.totalAnual} daños totales)`);
        });
      }
    });
    console.log('');
    
    // 5. Analizar top operadores
    console.log('5️⃣ Analizando top operadores...');
    const topOperadores = data.topOperadores || [];
    
    console.log('👷 Top 10 operadores con más daños:');
    topOperadores.slice(0, 10).forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
    });
    console.log('');
    
    // 6. Crear consultas SQL para investigación manual
    console.log('6️⃣ Consultas SQL para investigación manual:');
    console.log('');
    console.log('📋 Consulta 1 - Verificar sectores sin zona_id:');
    console.log(`
    SELECT 
      s.id as sector_id,
      s.nombre as sector_nombre,
      s.zona_id,
      z.nombre as zona_nombre,
      z.tipo as zona_tipo
    FROM sector s
    LEFT JOIN zona z ON s.zona_id = z.id
    WHERE z.id IS NULL OR z.tipo IS NULL
    ORDER BY s.nombre;
    `);
    console.log('');
    
    console.log('📋 Consulta 2 - Verificar daños por sector sin clasificar:');
    console.log(`
    SELECT 
      v.nombreSector,
      COUNT(*) as registros,
      SUM(v.cantidadDano) as total_danos
    FROM vw_ordenes_unificada_completa v
    LEFT JOIN sector s ON v.nombreSector = s.nombre
    LEFT JOIN zona z ON s.zona_id = z.id
    WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
    AND v.cantidadDano > 0
    AND v.nombreOperador != 'Sin operador'
    AND (z.tipo IS NULL OR z.id IS NULL)
    GROUP BY v.nombreSector
    ORDER BY total_danos DESC;
    `);
    console.log('');
    
    console.log('📋 Consulta 3 - Verificar zonas sin tipo:');
    console.log(`
    SELECT 
      z.id as zona_id,
      z.nombre as zona_nombre,
      z.tipo as zona_tipo,
      COUNT(s.id) as sectores_asignados
    FROM zona z
    LEFT JOIN sector s ON z.id = s.zona_id
    WHERE z.tipo IS NULL
    GROUP BY z.id, z.nombre, z.tipo
    ORDER BY sectores_asignados DESC;
    `);
    console.log('');
    
    // 7. Resumen y recomendaciones
    console.log('🎯 RESUMEN Y RECOMENDACIONES:');
    console.log('');
    
    if (totalSIN_CLASIFICAR > 0) {
      console.log('❌ PROBLEMAS IDENTIFICADOS:');
      console.log(`   - Hay ${totalSIN_CLASIFICAR} daños sin clasificar (${((totalSIN_CLASIFICAR / totalTodos) * 100).toFixed(1)}% del total)`);
      console.log(`   - Esto explica la diferencia entre 547 (HEMBRA + MACHO) y ${totalTodos} (total real)`);
      console.log('');
      console.log('🔧 ACCIONES REQUERIDAS:');
      console.log('   1. Ejecutar las consultas SQL proporcionadas');
      console.log('   2. Identificar sectores sin zona_id asignado');
      console.log('   3. Identificar zonas sin tipo definido');
      console.log('   4. Asignar zona_id a sectores faltantes');
      console.log('   5. Definir tipo (HEMBRA/MACHO) para zonas sin clasificar');
      console.log('');
      console.log('📊 IMPACTO EN EL DASHBOARD:');
      console.log(`   - Valor actual (HEMBRA + MACHO): 547`);
      console.log(`   - Valor real (todos los tipos): ${totalTodos}`);
      console.log(`   - Diferencia: ${totalSIN_CLASIFICAR} daños sin clasificar`);
    } else {
      console.log('✅ NO SE IDENTIFICARON PROBLEMAS:');
      console.log('   - Todos los daños están correctamente clasificados');
      console.log('   - El valor 547 es correcto');
    }
    
    console.log('');
    console.log('💡 PRÓXIMOS PASOS:');
    console.log('   1. Reiniciar el backend para cargar el nuevo endpoint');
    console.log('   2. Ejecutar el script completo de investigación');
    console.log('   3. Corregir los datos en la base de datos');
    console.log('   4. Verificar que el dashboard muestre el valor correcto');
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

analizarSectoresTemporal();





