const axios = require('axios');

// Configurar axios para hacer peticiones al backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
});

async function verificarDanosFaltantes() {
  try {
    console.log('🔍 Verificando daños faltantes por identificar...\n');
    
    const currentYear = 2025;
    
    console.log(`📊 Analizando datos para el año ${currentYear}...\n`);
    
    // 1. Obtener datos actuales de daños por operador
    console.log('1️⃣ Obteniendo datos actuales...');
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
    });
    console.log('');
    
    // 3. Calcular totales actuales
    const totalHEMBRA = resumenAnualTipo.HEMBRA?.total || 0;
    const totalMACHO = resumenAnualTipo.MACHO?.total || 0;
    const totalSIN_CLASIFICAR = resumenAnualTipo.SIN_CLASIFICAR?.total || 0;
    const totalTodos = totalHEMBRA + totalMACHO + totalSIN_CLASIFICAR;
    
    console.log('3️⃣ Análisis de totales actuales:');
    console.log(`   - HEMBRA: ${totalHEMBRA} daños`);
    console.log(`   - MACHO: ${totalMACHO} daños`);
    console.log(`   - SIN_CLASIFICAR: ${totalSIN_CLASIFICAR} daños`);
    console.log(`   - TOTAL: ${totalTodos} daños`);
    console.log(`   - HEMBRA + MACHO: ${totalHEMBRA + totalMACHO} daños`);
    console.log('');
    
    // 4. Verificar si ya corregimos los sectores principales
    console.log('4️⃣ Verificando sectores principales corregidos...');
    const sectoresPrincipales = ['CHACAYO 2', 'CHACAYO 1', 'DON FEÑA', 'DOÑA EMA'];
    
    console.log('📋 Sectores principales que deberían estar corregidos:');
    sectoresPrincipales.forEach(sector => {
      console.log(`   - ${sector}`);
    });
    console.log('');
    
    // 5. Crear consulta para identificar todos los sectores sin clasificar
    console.log('5️⃣ Consulta para identificar TODOS los sectores sin clasificar:');
    
    const consultaTodosSectoresSinClasificar = `
    SELECT 
      v.nombreSector,
      COUNT(*) as registros,
      SUM(v.cantidadDano) as total_danos,
      COUNT(DISTINCT v.nombreOperador) as operadores_afectados
    FROM vw_ordenes_unificada_completa v
    LEFT JOIN sector s ON v.nombreSector = s.nombre
    LEFT JOIN zona z ON s.zona_id = z.id
    WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
    AND v.cantidadDano > 0
    AND v.nombreOperador != 'Sin operador'
    AND (z.tipo IS NULL OR z.id IS NULL)
    GROUP BY v.nombreSector
    ORDER BY total_danos DESC;
    `;
    
    console.log('📋 Consulta completa para sectores sin clasificar:');
    console.log(consultaTodosSectoresSinClasificar);
    console.log('');
    
    // 6. Consulta específica para verificar el estado de los sectores principales
    console.log('6️⃣ Consulta para verificar estado de sectores principales:');
    
    const consultaEstadoSectoresPrincipales = `
    SELECT 
      v.nombreSector,
      COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona,
      z.nombre as zona_nombre,
      COUNT(*) as registros,
      SUM(v.cantidadDano) as total_danos
    FROM vw_ordenes_unificada_completa v
    LEFT JOIN sector s ON v.nombreSector = s.nombre
    LEFT JOIN zona z ON s.zona_id = z.id
    WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
    AND v.cantidadDano > 0
    AND v.nombreOperador != 'Sin operador'
    AND v.nombreSector IN ('CHACAYO 2', 'CHACAYO 1', 'DON FEÑA', 'DOÑA EMA')
    GROUP BY v.nombreSector, COALESCE(z.tipo, 'SIN_CLASIFICAR'), z.nombre
    ORDER BY total_danos DESC;
    `;
    
    console.log('📋 Consulta para verificar sectores principales:');
    console.log(consultaEstadoSectoresPrincipales);
    console.log('');
    
    // 7. Consulta para verificar zonas sin tipo
    console.log('7️⃣ Consulta para verificar zonas sin tipo:');
    
    const consultaZonasSinTipo = `
    SELECT 
      z.id as zona_id,
      z.nombre as zona_nombre,
      z.tipo as zona_tipo,
      COUNT(s.id) as sectores_asignados,
      GROUP_CONCAT(s.nombre) as sectores_lista
    FROM zona z
    LEFT JOIN sector s ON z.id = s.zona_id
    WHERE z.tipo IS NULL
    GROUP BY z.id, z.nombre, z.tipo
    ORDER BY sectores_asignados DESC;
    `;
    
    console.log('📋 Consulta para zonas sin tipo:');
    console.log(consultaZonasSinTipo);
    console.log('');
    
    // 8. Resumen y recomendaciones
    console.log('🎯 RESUMEN Y RECOMENDACIONES:');
    console.log('');
    
    if (totalSIN_CLASIFICAR > 0) {
      console.log('❌ AÚN HAY DAÑOS SIN CLASIFICAR:');
      console.log(`   - Total SIN_CLASIFICAR actual: ${totalSIN_CLASIFICAR} daños`);
      console.log(`   - Diferencia con el total esperado: ${totalTodos - (totalHEMBRA + totalMACHO)} daños`);
      console.log('');
      console.log('🔧 ACCIONES REQUERIDAS:');
      console.log('   1. Ejecutar la consulta completa de sectores sin clasificar');
      console.log('   2. Verificar el estado de los sectores principales');
      console.log('   3. Verificar si hay zonas sin tipo definido');
      console.log('   4. Corregir los sectores faltantes');
      console.log('');
      console.log('💡 POSIBLES CAUSAS:');
      console.log('   - Los sectores principales no se corrigieron completamente');
      console.log('   - Hay otros sectores sin clasificar además de los 4 principales');
      console.log('   - Las zonas asignadas no tienen tipo definido');
      console.log('   - Hay errores en la asignación de zona_id');
    } else {
      console.log('✅ TODOS LOS DAÑOS ESTÁN CLASIFICADOS:');
      console.log(`   - HEMBRA + MACHO: ${totalHEMBRA + totalMACHO} daños`);
      console.log(`   - SIN_CLASIFICAR: 0 daños`);
      console.log(`   - El dashboard debería mostrar ${totalHEMBRA + totalMACHO} daños`);
    }
    
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar la consulta completa de sectores sin clasificar');
    console.log('   2. Identificar exactamente qué sectores faltan');
    console.log('   3. Verificar el estado de las zonas asignadas');
    console.log('   4. Corregir los sectores faltantes');
    console.log('   5. Verificar que el dashboard muestre el valor correcto');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

verificarDanosFaltantes();





