const mysql = require('mysql2/promise');
const config = require('./src/config/config');

async function analizarSituacionDanos() {
  let connection;
  
  try {
    console.log('🔍 Analizando situación específica de daños...');
    
    const dbConfig = config.development;
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    console.log('✅ Conexión establecida\n');
    
    // 1. Verificar datos en migracion_ordenes_2025
    console.log('📊 Paso 1: Verificando datos en migracion_ordenes_2025...');
    
    const [datosMigracion] = await connection.execute(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT id) as danos_unicos,
        COUNT(*) - COUNT(DISTINCT id) as duplicados,
        COUNT(CASE WHEN cantidad_dano > 0 THEN 1 END) as registros_validos,
        SUM(CASE WHEN cantidad_dano > 0 THEN cantidad_dano ELSE 0 END) as total_valor
      FROM migracion_ordenes_2025 
      WHERE tipo_dano IS NOT NULL
    `);
    
    const migracion = datosMigracion[0];
    console.log(`📈 Datos en migracion_ordenes_2025:`);
    console.log(`   - Registros totales: ${migracion.total_registros}`);
    console.log(`   - Daños únicos: ${migracion.danos_unicos}`);
    console.log(`   - Duplicados: ${migracion.duplicados}`);
    console.log(`   - Registros válidos: ${migracion.registros_validos}`);
    console.log(`   - Total daños: ${migracion.total_valor}`);
    
    // 2. Verificar datos originales en tabla dano
    console.log('\n📊 Paso 2: Verificando datos originales en tabla dano...');
    
    const [datosOriginales] = await connection.execute(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN cantidad > 0 THEN 1 END) as registros_con_cantidad,
        SUM(CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END) as total_cantidad
      FROM dano d
      JOIN planilla p ON d.planilla_id = p.id
      WHERE YEAR(p.fecha) = 2025
    `);
    
    const originales = datosOriginales[0];
    console.log(`📈 Datos originales en tabla dano:`);
    console.log(`   - Registros totales: ${originales.total_registros}`);
    console.log(`   - Registros con cantidad: ${originales.registros_con_cantidad}`);
    console.log(`   - Total cantidad: ${originales.total_cantidad}`);
    
    // 3. Verificar duplicados específicos
    console.log('\n📊 Paso 3: Verificando duplicados específicos...');
    
    const [duplicadosDetalle] = await connection.execute(`
      SELECT 
        id,
        COUNT(*) as cantidad,
        cantidad_dano,
        fecha_inicio,
        tipo_dano,
        descripcion_dano
      FROM migracion_ordenes_2025 
      WHERE tipo_dano IS NOT NULL
      GROUP BY id
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC
      LIMIT 10
    `);
    
    if (duplicadosDetalle.length > 0) {
      console.log('🔍 Top 10 duplicados encontrados:');
      duplicadosDetalle.forEach((duplicado, index) => {
        console.log(`   ${index + 1}. ID: ${duplicado.id} - Cantidad: ${duplicado.cantidad} - Valor: ${duplicado.cantidad_dano} - Fecha: ${duplicado.fecha_inicio}`);
      });
    } else {
      console.log('✅ No se encontraron duplicados por ID');
    }
    
    // 4. Verificar si hay registros que no se migraron
    console.log('\n📊 Paso 4: Verificando registros no migrados...');
    
    const [noMigrados] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM dano d
      JOIN planilla p ON d.planilla_id = p.id
      LEFT JOIN migracion_ordenes_2025 m ON d.id = m.id
      WHERE YEAR(p.fecha) = 2025 
      AND d.cantidad > 0 
      AND m.id IS NULL
    `);
    
    console.log(`📈 Registros no migrados: ${noMigrados[0].total}`);
    
    // 5. Análisis de la situación
    console.log('\n📊 Paso 5: Análisis de la situación...');
    console.log('🔍 Situación actual:');
    console.log(`   - Daños originales esperados: 545`);
    console.log(`   - Daños después de migración: ${migracion.total_valor}`);
    console.log(`   - Duplicados encontrados: ${migracion.duplicados}`);
    console.log(`   - Registros no migrados: ${noMigrados[0].total}`);
    
    const diferencia = migracion.total_valor - 545;
    console.log(`   - Diferencia: ${diferencia} daños extra`);
    
    // 6. Recomendaciones
    console.log('\n🎯 Recomendaciones:');
    console.log('   1. Eliminar duplicados de la migración');
    console.log('   2. Migrar los registros faltantes');
    console.log('   3. Verificar que el total sea exactamente 545 + 5 = 550');
    
    // 7. Mostrar registros faltantes
    console.log('\n📊 Paso 6: Mostrando registros faltantes...');
    
    const [registrosFaltantes] = await connection.execute(`
      SELECT 
        d.id,
        p.fecha,
        d.cantidad,
        d.descripcion
      FROM dano d
      JOIN planilla p ON d.planilla_id = p.id
      LEFT JOIN migracion_ordenes_2025 m ON d.id = m.id
      WHERE YEAR(p.fecha) = 2025 
      AND d.cantidad > 0 
      AND m.id IS NULL
      LIMIT 10
    `);
    
    if (registrosFaltantes.length > 0) {
      console.log('📋 Registros faltantes (primeros 10):');
      registrosFaltantes.forEach((registro, index) => {
        console.log(`   ${index + 1}. ID: ${registro.id} - Fecha: ${registro.fecha} - Cantidad: ${registro.cantidad}`);
      });
    } else {
      console.log('✅ No hay registros faltantes');
    }
    
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error en el análisis:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

analizarSituacionDanos(); 