const axios = require('axios');

// Configurar axios para hacer peticiones al backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
});

async function investigarSectoresSinClasificar() {
  try {
    console.log('🔍 Investigando sectores sin clasificar en zonas...\n');
    
    const currentYear = 2025;
    
    console.log(`📊 Analizando datos para el año ${currentYear}...\n`);
    
    // 1. Obtener datos de la investigación de sectores sin clasificar
    console.log('1️⃣ Obteniendo datos de sectores sin clasificar...');
    const response = await api.get(`/dashboard/danos/test-sectores-sin-clasificar?year=${currentYear}`);
    const data = response.data;
    
    console.log('✅ Datos obtenidos exitosamente\n');
    
    // 2. Mostrar resumen estadístico
    console.log('2️⃣ Resumen estadístico:');
    const metadata = data.metadata || {};
    console.log(`   - Total sectores sin clasificar: ${metadata.totalSectoresSinClasificar}`);
    console.log(`   - Total zonas sin tipo: ${metadata.totalZonasSinTipo}`);
    console.log(`   - Total daños sin clasificar: ${metadata.totalDanosSinClasificar}`);
    console.log('');
    
    // 3. Mostrar sectores sin clasificar
    console.log('3️⃣ Sectores sin clasificar:');
    const sectoresSinClasificar = data.sectoresSinClasificar || [];
    if (sectoresSinClasificar.length > 0) {
      sectoresSinClasificar.forEach((sector, index) => {
        console.log(`   ${index + 1}. ${sector.sector_nombre}`);
        console.log(`      - ID: ${sector.sector_id}`);
        console.log(`      - Zona ID: ${sector.zona_id || 'NULL'}`);
        console.log(`      - Zona: ${sector.zona_nombre || 'SIN ZONA'}`);
        console.log(`      - Tipo: ${sector.zona_tipo || 'SIN TIPO'}`);
        console.log(`      - Problema: ${sector.problema_tipo}`);
        console.log('');
      });
    } else {
      console.log('   ✅ No se encontraron sectores sin clasificar');
    }
    
    // 4. Mostrar daños por sector sin clasificar
    console.log('4️⃣ Daños por sector sin clasificar:');
    const danosPorSector = data.danosPorSectorSinClasificar || [];
    if (danosPorSector.length > 0) {
      danosPorSector.forEach((sector, index) => {
        console.log(`   ${index + 1}. ${sector.nombreSector}`);
        console.log(`      - Tipo zona: ${sector.tipo_zona}`);
        console.log(`      - Registros: ${sector.registros}`);
        console.log(`      - Total daños: ${sector.total_danos}`);
        console.log(`      - Operadores afectados: ${sector.operadores_afectados}`);
        console.log('');
      });
    } else {
      console.log('   ✅ No se encontraron daños en sectores sin clasificar');
    }
    
    // 5. Mostrar zonas sin tipo definido
    console.log('5️⃣ Zonas sin tipo definido:');
    const zonasSinTipo = data.zonasSinTipo || [];
    if (zonasSinTipo.length > 0) {
      zonasSinTipo.forEach((zona, index) => {
        console.log(`   ${index + 1}. ${zona.zona_nombre}`);
        console.log(`      - ID: ${zona.zona_id}`);
        console.log(`      - Tipo: ${zona.zona_tipo || 'NULL'}`);
        console.log(`      - Sectores asignados: ${zona.sectores_asignados}`);
        console.log('');
      });
    } else {
      console.log('   ✅ No se encontraron zonas sin tipo definido');
    }
    
    // 6. Mostrar resumen estadístico por tipo de zona
    console.log('6️⃣ Resumen estadístico por tipo de zona:');
    const resumenEstadistico = data.resumenEstadistico || [];
    resumenEstadistico.forEach(item => {
      console.log(`   - ${item.tipo_zona}:`);
      console.log(`     * Sectores únicos: ${item.sectores_unicos}`);
      console.log(`     * Registros: ${item.registros}`);
      console.log(`     * Total daños: ${item.total_danos}`);
      console.log('');
    });
    
    // 7. Mostrar todos los sectores y su estado
    console.log('7️⃣ Estado de clasificación de todos los sectores:');
    const todosLosSectores = data.todosLosSectores || [];
    const sectoresConProblemas = todosLosSectores.filter(s => s.estado_clasificacion !== 'HEMBRA' && s.estado_clasificacion !== 'MACHO');
    
    if (sectoresConProblemas.length > 0) {
      console.log('   🔍 Sectores con problemas de clasificación:');
      sectoresConProblemas.forEach((sector, index) => {
        console.log(`   ${index + 1}. ${sector.sector_nombre}`);
        console.log(`      - Estado: ${sector.estado_clasificacion}`);
        console.log(`      - Zona ID: ${sector.zona_id || 'NULL'}`);
        console.log(`      - Zona: ${sector.zona_nombre || 'SIN ZONA'}`);
        console.log(`      - Tipo: ${sector.zona_tipo || 'SIN TIPO'}`);
        console.log('');
      });
    } else {
      console.log('   ✅ Todos los sectores están correctamente clasificados');
    }
    
    // 8. Resumen final y recomendaciones
    console.log('🎯 RESUMEN FINAL Y RECOMENDACIONES:');
    console.log('');
    
    if (metadata.totalSectoresSinClasificar > 0) {
      console.log('❌ PROBLEMAS IDENTIFICADOS:');
      console.log(`   - ${metadata.totalSectoresSinClasificar} sectores sin clasificar`);
      console.log(`   - ${metadata.totalZonasSinTipo} zonas sin tipo definido`);
      console.log(`   - ${metadata.totalDanosSinClasificar} daños sin clasificar`);
      console.log('');
      console.log('🔧 ACCIONES REQUERIDAS:');
      console.log('   1. Revisar y asignar zona_id a sectores faltantes');
      console.log('   2. Definir tipo (HEMBRA/MACHO) para zonas sin clasificar');
      console.log('   3. Verificar la integridad referencial entre sector y zona');
      console.log('   4. Actualizar los datos en la base de datos');
      console.log('');
      console.log('📋 SCRIPT SQL PARA CORREGIR:');
      console.log('   -- Asignar zona_id a sectores sin zona');
      console.log('   UPDATE sector SET zona_id = [ID_ZONA_CORRECTA] WHERE zona_id IS NULL;');
      console.log('');
      console.log('   -- Definir tipo para zonas sin clasificar');
      console.log('   UPDATE zona SET tipo = \'HEMBRA\' WHERE tipo IS NULL; -- o MACHO según corresponda');
    } else {
      console.log('✅ NO SE IDENTIFICARON PROBLEMAS:');
      console.log('   - Todos los sectores están correctamente clasificados');
      console.log('   - Todas las zonas tienen tipo definido');
      console.log('   - No hay daños sin clasificar');
    }
    
    console.log('');
    console.log('📊 IMPACTO EN EL DASHBOARD:');
    console.log(`   - El valor 547 (HEMBRA + MACHO) excluye ${metadata.totalDanosSinClasificar} daños sin clasificar`);
    console.log(`   - El total real debería ser ${547 + metadata.totalDanosSinClasificar} si se incluyen todos los daños`);
    
  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

investigarSectoresSinClasificar();
