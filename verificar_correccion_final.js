const axios = require('axios');

// Configurar axios para hacer peticiones al backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
});

async function verificarCorreccionFinal() {
  try {
    console.log('🔍 Verificando corrección final de sectores CHAYACO...\n');
    
    const currentYear = 2025;
    
    console.log(`📊 Analizando datos para el año ${currentYear}...\n`);
    
    // 1. Obtener datos actuales de daños por operador
    console.log('1️⃣ Obteniendo datos actuales del dashboard...');
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
    
    // 4. Verificar sectores CHAYACO específicamente
    console.log('4️⃣ Verificando sectores CHAYACO específicamente...');
    
    const consultaCHAYACO = `
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
    AND v.nombreSector IN ('CHAYACO 2', 'CHAYACO 1')
    GROUP BY v.nombreSector, COALESCE(z.tipo, 'SIN_CLASIFICAR'), z.nombre
    ORDER BY total_danos DESC;
    `;
    
    console.log('📋 Consulta para verificar sectores CHAYACO:');
    console.log(consultaCHAYACO);
    console.log('');
    
    // 5. Verificar asignación de sectores a zonas
    console.log('5️⃣ Verificando asignación de sectores a zonas...');
    
    const consultaAsignacion = `
    SELECT 
      s.id,
      s.nombre as sector_nombre,
      s.zona_id,
      z.nombre as zona_nombre,
      z.tipo as zona_tipo
    FROM sector s
    LEFT JOIN zona z ON s.zona_id = z.id
    WHERE s.nombre IN ('CHAYACO 2', 'CHAYACO 1')
    ORDER BY s.nombre;
    `;
    
    console.log('📋 Consulta para verificar asignación:');
    console.log(consultaAsignacion);
    console.log('');
    
    // 6. Resumen y estado final
    console.log('🎯 RESUMEN Y ESTADO FINAL:');
    console.log('');
    
    if (totalSIN_CLASIFICAR === 0) {
      console.log('✅ ¡CORRECCIÓN EXITOSA!');
      console.log(`   - HEMBRA: ${totalHEMBRA} daños`);
      console.log(`   - MACHO: ${totalMACHO} daños`);
      console.log(`   - SIN_CLASIFICAR: 0 daños`);
      console.log(`   - Dashboard debería mostrar: ${totalHEMBRA + totalMACHO} daños`);
      console.log('');
      console.log('🎉 ¡Todos los sectores están correctamente clasificados!');
    } else {
      console.log('❌ AÚN HAY PROBLEMAS:');
      console.log(`   - SIN_CLASIFICAR: ${totalSIN_CLASIFICAR} daños`);
      console.log(`   - Diferencia esperada: ${totalTodos - (totalHEMBRA + totalMACHO)} daños`);
      console.log('');
      console.log('🔧 ACCIONES REQUERIDAS:');
      console.log('   1. Verificar que CHAYACO 1 y CHAYACO 2 estén asignados a Zona 2');
      console.log('   2. Verificar que la Zona 2 tenga tipo MACHO');
      console.log('   3. Ejecutar las consultas de verificación');
    }
    
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar la consulta de sectores CHAYACO');
    console.log('   2. Ejecutar la consulta de asignación');
    console.log('   3. Verificar que el dashboard muestre 608 daños');
    console.log('   4. Si hay problemas, revisar la asignación de zona_id');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

verificarCorreccionFinal();





