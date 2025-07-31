const mysql = require('mysql2/promise');
const config = require('./src/config/config');

async function limpiarDuplicadosDirecto() {
  let connection;
  
  try {
    console.log('🔍 Conectando a la base de datos...');
    
    // Crear conexión usando configuración de desarrollo
    const dbConfig = config.development;
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    console.log('✅ Conexión establecida\n');
    
    // 1. Verificar estado actual
    console.log('📊 Paso 1: Verificando estado actual...');
    
    const [estadoActual] = await connection.execute(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT id) as danos_unicos,
        COUNT(*) - COUNT(DISTINCT id) as duplicados,
        COUNT(CASE WHEN cantidad_dano > 0 THEN 1 END) as registros_validos,
        COUNT(CASE WHEN cantidad_dano = 0 OR cantidad_dano IS NULL THEN 1 END) as registros_invalidos,
        SUM(CASE WHEN cantidad_dano > 0 THEN cantidad_dano ELSE 0 END) as total_valor,
        AVG(CASE WHEN cantidad_dano > 0 THEN cantidad_dano ELSE NULL END) as promedio
      FROM migracion_ordenes_2025 
      WHERE tipo_dano IS NOT NULL
    `);
    
    const estado = estadoActual[0];
    console.log(`📈 Estado actual:`);
    console.log(`   - Registros totales: ${estado.total_registros}`);
    console.log(`   - Daños únicos: ${estado.danos_unicos}`);
    console.log(`   - Duplicados: ${estado.duplicados}`);
    console.log(`   - Registros válidos: ${estado.registros_validos}`);
    console.log(`   - Registros inválidos: ${estado.registros_invalidos}`);
    console.log(`   - Total valor: $${parseFloat(estado.total_valor || 0).toLocaleString()}`);
    console.log(`   - Promedio: $${parseFloat(estado.promedio || 0).toLocaleString()}`);
    
    if (estado.duplicados > 0) {
      console.log(`\n⚠️ Se encontraron ${estado.duplicados} registros duplicados`);
      
      // 2. Mostrar ejemplos de duplicados
      console.log('\n📊 Paso 2: Mostrando ejemplos de duplicados...');
      
      const [ejemplosDuplicados] = await connection.execute(`
        SELECT 
          id,
          COUNT(*) as cantidad,
          cantidad_dano,
          fecha_inicio,
          tipo_dano
        FROM migracion_ordenes_2025 
        WHERE tipo_dano IS NOT NULL
        GROUP BY id
        HAVING COUNT(*) > 1
        LIMIT 5
      `);
      
      console.log('🔍 Ejemplos de IDs duplicados:');
      ejemplosDuplicados.forEach((ejemplo, index) => {
        console.log(`   ${index + 1}. ID: ${ejemplo.id} - Cantidad: ${ejemplo.cantidad} - Valor: ${ejemplo.cantidad_dano}`);
      });
      
      // 3. Eliminar duplicados manteniendo el registro con mayor cantidad_dano
      console.log('\n📊 Paso 3: Eliminando duplicados...');
      
      const [resultadoEliminacion] = await connection.execute(`
        DELETE t1 FROM migracion_ordenes_2025 t1
        INNER JOIN migracion_ordenes_2025 t2 
        WHERE t1.id = t2.id 
        AND t1.tipo_dano IS NOT NULL 
        AND t2.tipo_dano IS NOT NULL
        AND t1.cantidad_dano < t2.cantidad_dano
      `);
      
      console.log(`✅ Duplicados eliminados: ${resultadoEliminacion.affectedRows}`);
      
      // 4. Verificar estado después de limpieza
      console.log('\n📊 Paso 4: Verificando estado después de limpieza...');
      
      const [estadoFinal] = await connection.execute(`
        SELECT 
          COUNT(*) as total_registros,
          COUNT(DISTINCT id) as danos_unicos,
          COUNT(*) - COUNT(DISTINCT id) as duplicados,
          COUNT(CASE WHEN cantidad_dano > 0 THEN 1 END) as registros_validos,
          SUM(CASE WHEN cantidad_dano > 0 THEN cantidad_dano ELSE 0 END) as total_valor,
          AVG(CASE WHEN cantidad_dano > 0 THEN cantidad_dano ELSE NULL END) as promedio
        FROM migracion_ordenes_2025 
        WHERE tipo_dano IS NOT NULL
      `);
      
      const estadoFinalData = estadoFinal[0];
      console.log(`📈 Estado final:`);
      console.log(`   - Registros totales: ${estadoFinalData.total_registros}`);
      console.log(`   - Daños únicos: ${estadoFinalData.danos_unicos}`);
      console.log(`   - Duplicados restantes: ${estadoFinalData.duplicados}`);
      console.log(`   - Registros válidos: ${estadoFinalData.registros_validos}`);
      console.log(`   - Total valor: $${parseFloat(estadoFinalData.total_valor || 0).toLocaleString()}`);
      console.log(`   - Promedio: $${parseFloat(estadoFinalData.promedio || 0).toLocaleString()}`);
      
      // 5. Eliminar registros con valor 0 o NULL
      console.log('\n📊 Paso 5: Eliminando registros inválidos...');
      
      const [resultadoInvalidos] = await connection.execute(`
        DELETE FROM migracion_ordenes_2025 
        WHERE tipo_dano IS NOT NULL 
        AND (cantidad_dano = 0 OR cantidad_dano IS NULL)
      `);
      
      console.log(`✅ Registros inválidos eliminados: ${resultadoInvalidos.affectedRows}`);
      
      // 6. Estado final completo
      console.log('\n📊 Paso 6: Estado final completo...');
      
      const [estadoCompleto] = await connection.execute(`
        SELECT 
          COUNT(*) as total_registros,
          COUNT(DISTINCT id) as danos_unicos,
          COUNT(CASE WHEN cantidad_dano > 0 THEN 1 END) as registros_validos,
          SUM(CASE WHEN cantidad_dano > 0 THEN cantidad_dano ELSE 0 END) as total_valor,
          AVG(CASE WHEN cantidad_dano > 0 THEN cantidad_dano ELSE NULL END) as promedio
        FROM migracion_ordenes_2025 
        WHERE tipo_dano IS NOT NULL
      `);
      
      const estadoCompletoData = estadoCompleto[0];
      console.log(`🎉 Estado final completo:`);
      console.log(`   - Registros totales: ${estadoCompletoData.total_registros}`);
      console.log(`   - Daños únicos: ${estadoCompletoData.danos_unicos}`);
      console.log(`   - Registros válidos: ${estadoCompletoData.registros_validos}`);
      console.log(`   - Total valor: $${parseFloat(estadoCompletoData.total_valor || 0).toLocaleString()}`);
      console.log(`   - Promedio: $${parseFloat(estadoCompletoData.promedio || 0).toLocaleString()}`);
      
      // 7. Resumen de limpieza
      const duplicadosEliminados = estado.duplicados - estadoFinalData.duplicados;
      const invalidosEliminados = resultadoInvalidos.affectedRows;
      
      console.log('\n📊 Resumen de limpieza:');
      console.log(`   - Duplicados eliminados: ${duplicadosEliminados}`);
      console.log(`   - Registros inválidos eliminados: ${invalidosEliminados}`);
      console.log(`   - Total registros eliminados: ${duplicadosEliminados + invalidosEliminados}`);
      console.log(`   - Registros restantes: ${estadoCompletoData.registros_validos}`);
      
    } else {
      console.log('\n✅ No se encontraron duplicados');
    }
    
    console.log('\n🎉 ¡Limpieza completada exitosamente!');
    console.log('📊 Ahora puedes verificar los datos en: http://localhost:3000/danos-acumulados');
    
  } catch (error) {
    console.error('❌ Error en la limpieza:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

limpiarDuplicadosDirecto(); 