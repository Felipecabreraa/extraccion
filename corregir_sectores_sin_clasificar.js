const axios = require('axios');

// Configurar axios para hacer peticiones al backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
});

async function corregirSectoresSinClasificar() {
  try {
    console.log('🔧 Corrigiendo sectores sin clasificar...\n');
    
    // Sectores identificados que necesitan corrección
    const sectoresACorregir = [
      { nombre: 'CHAYACO 2', daños: 29, registros: 21 },
      { nombre: 'CHAYACO 1', daños: 23, registros: 19 },
      { nombre: 'DON FENA', daños: 5, registros: 5 },
      { nombre: 'DONA EMA', daños: 4, registros: 4 }
    ];
    
    console.log('📋 Sectores que necesitan corrección:');
    sectoresACorregir.forEach((sector, index) => {
      console.log(`   ${index + 1}. ${sector.nombre}: ${sector.daños} daños (${sector.registros} registros)`);
    });
    console.log('');
    
    // 1. Primero, obtener información de las zonas disponibles
    console.log('1️⃣ Obteniendo información de zonas disponibles...');
    
    // Consulta para obtener zonas con tipo definido
    const consultaZonas = `
    SELECT 
      z.id as zona_id,
      z.nombre as zona_nombre,
      z.tipo as zona_tipo,
      COUNT(s.id) as sectores_asignados
    FROM zona z
    LEFT JOIN sector s ON z.id = s.zona_id
    WHERE z.tipo IS NOT NULL
    GROUP BY z.id, z.nombre, z.tipo
    ORDER BY z.tipo, z.nombre;
    `;
    
    console.log('📋 Consulta para obtener zonas disponibles:');
    console.log(consultaZonas);
    console.log('');
    
    // 2. Consulta para verificar el estado actual de los sectores problemáticos
    console.log('2️⃣ Verificando estado actual de sectores problemáticos...');
    
    const consultaEstadoActual = `
    SELECT 
      s.id as sector_id,
      s.nombre as sector_nombre,
      s.zona_id,
      z.nombre as zona_nombre,
      z.tipo as zona_tipo
    FROM sector s
    LEFT JOIN zona z ON s.zona_id = z.id
    WHERE s.nombre IN ('CHAYACO 2', 'CHAYACO 1', 'DON FENA', 'DONA EMA')
    ORDER BY s.nombre;
    `;
    
    console.log('📋 Consulta para verificar estado actual:');
    console.log(consultaEstadoActual);
    console.log('');
    
    // 3. Scripts de corrección
    console.log('3️⃣ Scripts de corrección sugeridos:');
    console.log('');
    
    console.log('📋 Opción A - Asignar a zonas existentes:');
    console.log(`
    -- Primero, verificar qué zonas están disponibles
    SELECT id, nombre, tipo FROM zona WHERE tipo IS NOT NULL ORDER BY tipo, nombre;
    
    -- Luego, asignar sectores a zonas apropiadas
    -- (Reemplazar [ZONA_ID] con el ID de la zona correcta)
    
    UPDATE sector SET zona_id = [ZONA_ID] WHERE nombre = 'CHAYACO 2';
    UPDATE sector SET zona_id = [ZONA_ID] WHERE nombre = 'CHAYACO 1';
    UPDATE sector SET zona_id = [ZONA_ID] WHERE nombre = 'DON FENA';
    UPDATE sector SET zona_id = [ZONA_ID] WHERE nombre = 'DONA EMA';
    `);
    console.log('');
    
    console.log('📋 Opción B - Crear nuevas zonas si es necesario:');
    console.log(`
    -- Crear nuevas zonas para estos sectores
    INSERT INTO zona (nombre, tipo) VALUES ('CHAYACO', 'HEMBRA'); -- o MACHO según corresponda
    INSERT INTO zona (nombre, tipo) VALUES ('DON FENA', 'HEMBRA'); -- o MACHO según corresponda
    INSERT INTO zona (nombre, tipo) VALUES ('DONA EMA', 'HEMBRA'); -- o MACHO según corresponda
    
    -- Luego asignar los sectores a las nuevas zonas
    UPDATE sector SET zona_id = (SELECT id FROM zona WHERE nombre = 'CHAYACO') WHERE nombre IN ('CHAYACO 1', 'CHAYACO 2');
    UPDATE sector SET zona_id = (SELECT id FROM zona WHERE nombre = 'DON FENA') WHERE nombre = 'DON FENA';
    UPDATE sector SET zona_id = (SELECT id FROM zona WHERE nombre = 'DONA EMA') WHERE nombre = 'DONA EMA';
    `);
    console.log('');
    
    // 4. Verificación post-corrección
    console.log('4️⃣ Consulta de verificación post-corrección:');
    
    const consultaVerificacion = `
    SELECT 
      v.nombreSector,
      COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona,
      COUNT(*) as registros,
      SUM(v.cantidadDano) as total_danos
    FROM vw_ordenes_unificada_completa v
    LEFT JOIN sector s ON v.nombreSector = s.nombre
    LEFT JOIN zona z ON s.zona_id = z.id
    WHERE YEAR(v.fechaOrdenServicio) = 2025
    AND v.cantidadDano > 0
    AND v.nombreOperador != 'Sin operador'
    AND v.nombreSector IN ('CHAYACO 2', 'CHAYACO 1', 'DON FENA', 'DONA EMA')
    GROUP BY v.nombreSector, COALESCE(z.tipo, 'SIN_CLASIFICAR')
    ORDER BY total_danos DESC;
    `;
    
    console.log('📋 Consulta de verificación:');
    console.log(consultaVerificacion);
    console.log('');
    
    // 5. Impacto en el dashboard
    console.log('5️⃣ Impacto en el dashboard:');
    console.log('');
    console.log('📊 ANTES de la corrección:');
    console.log(`   - HEMBRA + MACHO: 547 daños`);
    console.log(`   - SIN_CLASIFICAR: 61 daños`);
    console.log(`   - TOTAL: 608 daños`);
    console.log('');
    console.log('📊 DESPUÉS de la corrección:');
    console.log(`   - HEMBRA + MACHO: 608 daños (incluyendo los 61 corregidos)`);
    console.log(`   - SIN_CLASIFICAR: 0 daños`);
    console.log(`   - TOTAL: 608 daños`);
    console.log('');
    console.log('✅ El dashboard mostrará el valor correcto de 608 en lugar de 547');
    
    // 6. Recomendaciones específicas
    console.log('6️⃣ Recomendaciones específicas:');
    console.log('');
    console.log('🔍 Para los sectores CHAYACO 1 y CHAYACO 2:');
    console.log('   - Parecen ser parte de la misma zona "CHAYACO"');
    console.log('   - Sugerencia: Asignar ambos a una zona "CHAYACO" con tipo HEMBRA o MACHO');
    console.log('');
    console.log('🔍 Para DON FENA y DONA EMA:');
    console.log('   - Parecen ser zonas individuales');
    console.log('   - Sugerencia: Crear zonas separadas o asignar a zonas existentes');
    console.log('');
    console.log('💡 PASOS RECOMENDADOS:');
    console.log('   1. Ejecutar la consulta de zonas disponibles');
    console.log('   2. Decidir si crear nuevas zonas o usar existentes');
    console.log('   3. Ejecutar los scripts de corrección');
    console.log('   4. Verificar con la consulta de verificación');
    console.log('   5. Probar el dashboard para confirmar el valor 608');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

corregirSectoresSinClasificar();





