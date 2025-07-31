const mysql = require('mysql2/promise');
const config = require('./src/config/config');

async function actualizarReporteDesdeMigracion() {
  let connection;
  
  try {
    console.log('🔍 Conectando a la base de datos...');
    
    const dbConfig = config.development;
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    console.log('✅ Conexión establecida\n');
    
    // 1. Obtener datos de la migración agrupados por mes
    console.log('📊 Paso 1: Obteniendo datos de la migración...');
    
    const [datosMigracion] = await connection.execute(`
      SELECT 
        MONTH(fecha_inicio) as mes,
        SUM(cantidad_dano) as total_mes,
        COUNT(*) as registros_mes
      FROM migracion_ordenes_2025 
      WHERE tipo_dano IS NOT NULL 
      AND cantidad_dano > 0 
      AND YEAR(fecha_inicio) = 2025
      GROUP BY MONTH(fecha_inicio)
      ORDER BY mes
    `);
    
    console.log(`✅ Datos obtenidos: ${datosMigracion.length} meses`);
    
    // 2. Mostrar datos por mes
    console.log('\n📊 Paso 2: Datos por mes:');
    let totalAnual = 0;
    datosMigracion.forEach(mes => {
      console.log(`   Mes ${mes.mes}: ${mes.total_mes} daños (${mes.registros_mes} registros)`);
      totalAnual += parseInt(mes.total_mes);
    });
    console.log(`   Total anual: ${totalAnual} daños`);
    
    // 3. Actualizar reporte_danos_mensuales
    console.log('\n📊 Paso 3: Actualizando reporte_danos_mensuales...');
    
    let registrosActualizados = 0;
    let totalActualizado = 0;
    
    for (const mes of datosMigracion) {
      try {
        // Verificar si existe el registro
        const [registroExistente] = await connection.execute(`
          SELECT * FROM reporte_danos_mensuales 
          WHERE anio = 2025 AND mes = ?
        `, [mes.mes]);
        
        if (registroExistente.length > 0) {
          // Actualizar registro existente
          await connection.execute(`
            UPDATE reporte_danos_mensuales 
            SET valor_real = ? 
            WHERE anio = 2025 AND mes = ?
          `, [mes.total_mes, mes.mes]);
          
          console.log(`   ✅ Mes ${mes.mes}: Actualizado - ${mes.total_mes} daños`);
        } else {
          // Crear nuevo registro
          await connection.execute(`
            INSERT INTO reporte_danos_mensuales (anio, mes, valor_real, valor_ppto, valor_anio_ant)
            VALUES (2025, ?, ?, 3000000, 0)
          `, [mes.mes, mes.total_mes]);
          
          console.log(`   ✅ Mes ${mes.mes}: Creado - ${mes.total_mes} daños`);
        }
        
        registrosActualizados++;
        totalActualizado += parseInt(mes.total_mes);
        
      } catch (error) {
        console.log(`   ❌ Error en mes ${mes.mes}:`, error.message);
      }
    }
    
    // 4. Verificar datos actualizados
    console.log('\n📊 Paso 4: Verificando datos actualizados...');
    
    const [datosActualizados] = await connection.execute(`
      SELECT 
        mes,
        valor_real,
        valor_ppto,
        valor_anio_ant
      FROM reporte_danos_mensuales 
      WHERE anio = 2025 
      ORDER BY mes
    `);
    
    console.log('📋 Datos actualizados en reporte_danos_mensuales:');
    datosActualizados.forEach(registro => {
      console.log(`   Mes ${registro.mes}: Real: ${registro.valor_real}, Ppto: ${registro.valor_ppto}, Año Ant: ${registro.valor_anio_ant}`);
    });
    
    // 5. Calcular totales
    const totalReal = datosActualizados.reduce((sum, registro) => sum + parseInt(registro.valor_real || 0), 0);
    const totalPpto = datosActualizados.reduce((sum, registro) => sum + parseInt(registro.valor_ppto || 0), 0);
    
    console.log('\n📊 Paso 5: Resumen final:');
    console.log(`   - Registros procesados: ${registrosActualizados}`);
    console.log(`   - Total real actualizado: ${totalActualizado}`);
    console.log(`   - Total real en reporte: ${totalReal}`);
    console.log(`   - Total presupuesto: ${totalPpto}`);
    
    // 6. Verificar vista acumulada
    console.log('\n📊 Paso 6: Verificando vista acumulada...');
    
    const [datosVista] = await connection.execute(`
      SELECT 
        anio,
        mes,
        valor_real,
        valor_ppto,
        valor_anio_ant,
        real_acumulado,
        ppto_acumulado,
        anio_ant_acumulado
      FROM vista_danos_acumulados 
      WHERE anio = 2025 
      ORDER BY mes
    `);
    
    console.log('📋 Datos en vista_danos_acumulados:');
    datosVista.forEach(registro => {
      console.log(`   Mes ${registro.mes}: Real: ${registro.valor_real}, Acumulado: ${registro.real_acumulado}`);
    });
    
    console.log('\n🎉 ¡Actualización completada exitosamente!');
    console.log('📊 Ahora puedes verificar los datos en: http://localhost:3000/danos-acumulados');
    
  } catch (error) {
    console.error('❌ Error en la actualización:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

actualizarReporteDesdeMigracion(); 