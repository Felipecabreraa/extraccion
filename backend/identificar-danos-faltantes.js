const mysql = require('mysql2/promise');
const config = require('./src/config/config');

async function identificarDanosFaltantes() {
  let connection;
  
  try {
    console.log('🔍 Identificando daños faltantes...');
    
    const dbConfig = config.development;
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    console.log('✅ Conexión establecida\n');
    
    // 1. Verificar datos originales en tabla dano para 2025
    console.log('📊 Paso 1: Verificando datos originales en tabla dano...');
    
    const [datosOriginales] = await connection.execute(`
      SELECT 
        COUNT(*) as total_registros,
        SUM(cantidad) as total_cantidad
      FROM dano d
      JOIN planilla p ON d.planilla_id = p.id
      WHERE YEAR(p.fecha_inicio) = 2025
    `);
    
    const originales = datosOriginales[0];
    console.log(`📈 Datos originales en tabla dano 2025:`);
    console.log(`   - Registros totales: ${originales.total_registros}`);
    console.log(`   - Total cantidad: ${originales.total_cantidad}`);
    
    // 2. Verificar datos en migracion_ordenes_2025
    console.log('\n📊 Paso 2: Verificando datos en migracion_ordenes_2025...');
    
    const [datosMigracion] = await connection.execute(`
      SELECT 
        COUNT(*) as total_registros,
        SUM(cantidad_dano) as total_cantidad
      FROM migracion_ordenes_2025 
      WHERE tipo_dano IS NOT NULL
    `);
    
    const migracion = datosMigracion[0];
    console.log(`📈 Datos en migracion_ordenes_2025:`);
    console.log(`   - Registros totales: ${migracion.total_registros}`);
    console.log(`   - Total cantidad: ${migracion.total_cantidad}`);
    
    // 3. Identificar daños que no se migraron
    console.log('\n📊 Paso 3: Identificando daños no migrados...');
    
    const [danosNoMigrados] = await connection.execute(`
      SELECT 
        d.id,
        d.planilla_id,
        d.cantidad,
        d.descripcion,
        p.fecha_inicio
      FROM dano d
      JOIN planilla p ON d.planilla_id = p.id
      LEFT JOIN migracion_ordenes_2025 m ON d.id = m.id
      WHERE YEAR(p.fecha_inicio) = 2025 
      AND d.cantidad > 0 
      AND m.id IS NULL
      ORDER BY p.fecha_inicio, d.id
    `);
    
    console.log(`📈 Daños no migrados encontrados: ${danosNoMigrados.length}`);
    
    if (danosNoMigrados.length > 0) {
      console.log('📋 Lista de daños no migrados:');
      danosNoMigrados.forEach((dano, index) => {
        console.log(`   ${index + 1}. ID: ${dano.id} - Planilla: ${dano.planilla_id} - Fecha: ${dano.fecha_inicio} - Cantidad: ${dano.cantidad} - Desc: ${dano.descripcion}`);
      });
    }
    
    // 4. Calcular totales
    const totalOriginal = originales.total_cantidad || 0;
    const totalMigrado = migracion.total_cantidad || 0;
    const totalNoMigrado = danosNoMigrados.reduce((sum, dano) => sum + dano.cantidad, 0);
    const faltante = totalOriginal - totalMigrado;
    
    console.log('\n📊 Paso 4: Análisis de totales...');
    console.log('🔍 Resumen:');
    console.log(`   - Total original (dano): ${totalOriginal}`);
    console.log(`   - Total migrado: ${totalMigrado}`);
    console.log(`   - Total no migrado: ${totalNoMigrado}`);
    console.log(`   - Diferencia: ${faltante}`);
    
    // 5. Verificar si los números coinciden
    console.log('\n📊 Paso 5: Verificación de números...');
    console.log('🔍 Comparación:');
    console.log(`   - Esperado original: 545 daños`);
    console.log(`   - Total original encontrado: ${totalOriginal}`);
    console.log(`   - Total migrado: ${totalMigrado}`);
    console.log(`   - Faltantes: ${545 - totalMigrado}`);
    console.log(`   - Daños nuevos a agregar: 5`);
    console.log(`   - Total final esperado: ${545 + 5} = 550 daños`);
    
    // 6. Preparar datos para migración
    if (danosNoMigrados.length > 0) {
      console.log('\n📊 Paso 6: Preparando datos para migración...');
      console.log('📋 Datos para migrar:');
      
      danosNoMigrados.forEach((dano, index) => {
        console.log(`   INSERT INTO migracion_ordenes_2025 (id, planilla_id, cantidad_dano, tipo_dano, descripcion_dano, fecha_inicio) VALUES (${dano.id}, ${dano.planilla_id}, ${dano.cantidad}, 'daño', '${dano.descripcion}', '${dano.fecha_inicio}');`);
      });
    }
    
    // 7. Recomendaciones
    console.log('\n🎯 Recomendaciones:');
    console.log('   1. Migrar los daños faltantes identificados');
    console.log('   2. Agregar los 5 daños nuevos');
    console.log('   3. Verificar que el total sea 550 daños');
    console.log('   4. Actualizar vista_danos_acumulados');
    
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

identificarDanosFaltantes(); 