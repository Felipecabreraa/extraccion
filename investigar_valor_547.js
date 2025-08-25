require('dotenv').config();
const { Sequelize, Op } = require('sequelize');

// Configurar conexión a la base de datos usando variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME || 'extraccion',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log // Habilitar logging para debug
  }
);

async function investigarValor547() {
  try {
    console.log('🔍 Investigando el valor 547 en el dashboard de daños por operador...\n');
    console.log('📋 Configuración de conexión:');
    console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   - Database: ${process.env.DB_NAME || 'extraccion'}`);
    console.log(`   - User: ${process.env.DB_USER || 'root'}\n`);
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente\n');
    
    const currentYear = 2025;
    const queryTimeout = 12000;
    
    console.log(`📊 Analizando datos para el año ${currentYear}...\n`);
    
    // 1. Verificar la vista unificada
    console.log('1️⃣ Verificando vista unificada vw_ordenes_unificada_completa...');
    const [vistaUnificadaResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT nombreOperador) as total_operadores,
        SUM(cantidadDano) as total_danos,
        COUNT(CASE WHEN cantidadDano > 0 THEN 1 END) as registros_con_danos
      FROM vw_ordenes_unificada_completa 
      WHERE YEAR(fechaOrdenServicio) = ${currentYear}
    `, { timeout: queryTimeout });
    
    console.log('📋 Resumen de la vista unificada:');
    console.log(`   - Total registros: ${vistaUnificadaResult[0].total_registros}`);
    console.log(`   - Total operadores: ${vistaUnificadaResult[0].total_operadores}`);
    console.log(`   - Total daños: ${vistaUnificadaResult[0].total_danos}`);
    console.log(`   - Registros con daños: ${vistaUnificadaResult[0].registros_con_danos}\n`);
    
    // 2. Verificar daños por tipo de zona (HEMBRA/MACHO)
    console.log('2️⃣ Verificando daños por tipo de zona...');
    const [danosPorTipoResult] = await sequelize.query(`
      SELECT 
        COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona,
        SUM(v.cantidadDano) as cantidad_total_danos,
        COUNT(DISTINCT v.nombreOperador) as operadores_unicos
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY COALESCE(z.tipo, 'SIN_CLASIFICAR')
      ORDER BY cantidad_total_danos DESC
    `, { timeout: queryTimeout });
    
    console.log('📊 Daños por tipo de zona:');
    let totalCalculado = 0;
    danosPorTipoResult.forEach(item => {
      console.log(`   - ${item.tipo_zona}: ${item.cantidad_total_danos} daños (${item.operadores_unicos} operadores)`);
      totalCalculado += parseInt(item.cantidad_total_danos || 0);
    });
    console.log(`   - TOTAL CALCULADO: ${totalCalculado}\n`);
    
    // 3. Verificar operadores con daños
    console.log('3️⃣ Verificando operadores con daños...');
    const [operadoresConDanosResult] = await sequelize.query(`
      SELECT 
        v.nombreOperador,
        SUM(v.cantidadDano) as total_danos,
        COUNT(DISTINCT MONTH(v.fechaOrdenServicio)) as meses_con_danos
      FROM vw_ordenes_unificada_completa v
      WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY v.nombreOperador
      HAVING total_danos > 0
      ORDER BY total_danos DESC
      LIMIT 10
    `, { timeout: queryTimeout });
    
    console.log('👷 Top 10 operadores con más daños:');
    operadoresConDanosResult.forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.nombreOperador}: ${op.total_danos} daños (${op.meses_con_danos} meses)`);
    });
    console.log('');
    
    // 4. Verificar daños mensuales
    console.log('4️⃣ Verificando daños por mes...');
    const [danosMensualesResult] = await sequelize.query(`
      SELECT 
        MONTH(v.fechaOrdenServicio) as mes,
        SUM(v.cantidadDano) as total_danos,
        COUNT(DISTINCT v.nombreOperador) as operadores_afectados
      FROM vw_ordenes_unificada_completa v
      WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY MONTH(v.fechaOrdenServicio)
      ORDER BY mes
    `, { timeout: queryTimeout });
    
    console.log('📅 Daños por mes:');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
    danosMensualesResult.forEach(item => {
      const mesNombre = meses[item.mes - 1];
      console.log(`   - ${mesNombre}: ${item.total_danos} daños (${item.operadores_afectados} operadores)`);
    });
    console.log('');
    
    // 5. Verificar la consulta exacta que usa el frontend
    console.log('5️⃣ Verificando consulta exacta del frontend (Año 2025)...');
    const [consultaFrontendResult] = await sequelize.query(`
      SELECT 
        COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona,
        MONTH(v.fechaOrdenServicio) as mes,
        SUM(v.cantidadDano) as cantidad_total_danos
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY 
        COALESCE(z.tipo, 'SIN_CLASIFICAR'),
        MONTH(v.fechaOrdenServicio)
      ORDER BY tipo_zona, mes
    `, { timeout: queryTimeout });
    
    console.log('🔍 Resultado de la consulta del frontend:');
    let hembraTotal = 0;
    let machoTotal = 0;
    
    consultaFrontendResult.forEach(item => {
      if (item.tipo_zona === 'HEMBRA') {
        hembraTotal += parseInt(item.cantidad_total_danos || 0);
      } else if (item.tipo_zona === 'MACHO') {
        machoTotal += parseInt(item.cantidad_total_danos || 0);
      }
    });
    
    const totalFrontend = hembraTotal + machoTotal;
    console.log(`   - HEMBRA total: ${hembraTotal}`);
    console.log(`   - MACHO total: ${machoTotal}`);
    console.log(`   - TOTAL (HEMBRA + MACHO): ${totalFrontend}`);
    console.log(`   - ¿Es este el valor 547?: ${totalFrontend === 547 ? '✅ SÍ' : '❌ NO'}\n`);
    
    // 6. Verificar si hay otros tipos de zona
    console.log('6️⃣ Verificando todos los tipos de zona disponibles...');
    const [tiposZonaResult] = await sequelize.query(`
      SELECT DISTINCT
        COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona,
        COUNT(*) as registros
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY COALESCE(z.tipo, 'SIN_CLASIFICAR')
    `, { timeout: queryTimeout });
    
    console.log('🏷️ Tipos de zona encontrados:');
    tiposZonaResult.forEach(item => {
      console.log(`   - ${item.tipo_zona}: ${item.registros} registros`);
    });
    console.log('');
    
    // 7. Verificar si el valor 547 incluye SIN_CLASIFICAR
    console.log('7️⃣ Verificando si el valor 547 incluye SIN_CLASIFICAR...');
    const [todosLosTiposResult] = await sequelize.query(`
      SELECT 
        COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona,
        SUM(v.cantidadDano) as cantidad_total_danos
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      WHERE YEAR(v.fechaOrdenServicio) = ${currentYear}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY COALESCE(z.tipo, 'SIN_CLASIFICAR')
      ORDER BY cantidad_total_danos DESC
    `, { timeout: queryTimeout });
    
    console.log('📊 Total por tipo de zona:');
    let totalTodosLosTipos = 0;
    todosLosTiposResult.forEach(item => {
      console.log(`   - ${item.tipo_zona}: ${item.cantidad_total_danos} daños`);
      totalTodosLosTipos += parseInt(item.cantidad_total_danos || 0);
    });
    console.log(`   - TOTAL TODOS LOS TIPOS: ${totalTodosLosTipos}`);
    console.log(`   - ¿Es este el valor 547?: ${totalTodosLosTipos === 547 ? '✅ SÍ' : '❌ NO'}\n`);
    
    // 8. Resumen final
    console.log('🎯 RESUMEN FINAL:');
    console.log(`   - Valor mostrado en el frontend: 547`);
    console.log(`   - HEMBRA + MACHO: ${totalFrontend}`);
    console.log(`   - Todos los tipos: ${totalTodosLosTipos}`);
    console.log(`   - Total de la vista: ${vistaUnificadaResult[0].total_danos}`);
    
    if (totalFrontend === 547) {
      console.log('   ✅ El valor 547 corresponde a HEMBRA + MACHO únicamente');
    } else if (totalTodosLosTipos === 547) {
      console.log('   ✅ El valor 547 corresponde a todos los tipos de zona');
    } else {
      console.log('   ❓ El valor 547 no coincide con ninguna de las consultas verificadas');
    }
    
  } catch (error) {
    console.error('❌ Error durante la investigación:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

investigarValor547();
