const mysql = require('mysql2/promise');

async function corregirSeptiembre() {
  let connection;
  
  try {
    console.log('🔧 Corrigiendo datos de septiembre en la base de datos...\n');
    
    // Configuración de la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'rionegro_db'
    });
    
    // 1. Verificar datos actuales de septiembre
    console.log('📊 1. Verificando datos actuales de septiembre...');
    const [datosActuales] = await connection.execute(`
      SELECT anio, mes, valor_real, valor_ppto, valor_anio_ant
      FROM reporte_danos_mensuales 
      WHERE anio = 2025 AND mes = 9
    `);
    
    if (datosActuales.length > 0) {
      console.log('📋 Datos actuales de septiembre:');
      console.log(`  - Valor Real: ${datosActuales[0].valor_real}`);
      console.log(`  - Valor Ppto: ${datosActuales[0].valor_ppto}`);
      console.log(`  - Valor Año Ant: ${datosActuales[0].valor_anio_ant}`);
    } else {
      console.log('❌ No hay datos para septiembre 2025');
    }
    
    // 2. Verificar datos de agosto para confirmar el valor correcto
    console.log('\n📊 2. Verificando datos de agosto...');
    const [datosAgosto] = await connection.execute(`
      SELECT anio, mes, valor_real, valor_ppto, valor_anio_ant
      FROM reporte_danos_mensuales 
      WHERE anio = 2025 AND mes = 8
    `);
    
    if (datosAgosto.length > 0) {
      console.log('📋 Datos de agosto:');
      console.log(`  - Valor Real: ${datosAgosto[0].valor_real}`);
      console.log(`  - Valor Ppto: ${datosAgosto[0].valor_ppto}`);
    }
    
    // 3. Corregir septiembre - valor real debe ser 0
    console.log('\n🔧 3. Corrigiendo septiembre...');
    await connection.execute(`
      UPDATE reporte_danos_mensuales 
      SET valor_real = 0, valor_ppto = 3000000
      WHERE anio = 2025 AND mes = 9
    `);
    
    console.log('✅ Septiembre corregido: valor_real = 0, valor_ppto = 3000000');
    
    // 4. Verificar la corrección
    console.log('\n📊 4. Verificando corrección...');
    const [datosCorregidos] = await connection.execute(`
      SELECT anio, mes, valor_real, valor_ppto, valor_anio_ant
      FROM reporte_danos_mensuales 
      WHERE anio = 2025 AND mes = 9
    `);
    
    if (datosCorregidos.length > 0) {
      console.log('📋 Datos corregidos de septiembre:');
      console.log(`  - Valor Real: ${datosCorregidos[0].valor_real}`);
      console.log(`  - Valor Ppto: ${datosCorregidos[0].valor_ppto}`);
      
      if (datosCorregidos[0].valor_real === 0) {
        console.log('  ✅ CORRECTO: Valor real de septiembre es 0');
      } else {
        console.log('  ❌ INCORRECTO: Valor real de septiembre no es 0');
      }
    }
    
    // 5. Verificar la vista
    console.log('\n📊 5. Verificando vista vista_danos_acumulados...');
    const [datosVista] = await connection.execute(`
      SELECT anio, mes, valor_real, real_acumulado
      FROM vista_danos_acumulados 
      WHERE anio = 2025 AND mes IN (8, 9)
      ORDER BY mes
    `);
    
    console.log('📋 Datos de la vista:');
    datosVista.forEach(dato => {
      console.log(`  Mes ${dato.mes}: Real=${dato.valor_real}, Acumulado=${dato.real_acumulado}`);
    });
    
    console.log('\n✅ Corrección completada');
    console.log('\n🎯 Resumen:');
    console.log('   - Septiembre valor_real = 0 ✅');
    console.log('   - Septiembre real_acumulado debe mantener valor de agosto');
    console.log('   - Presupuesto fijo de $3M mensual');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar corrección
corregirSeptiembre();

