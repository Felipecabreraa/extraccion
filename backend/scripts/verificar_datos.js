const mysql = require('mysql2/promise');

async function verificarDatos() {
  let connection;
  
  try {
    console.log('🔍 Verificando conexión y datos...\n');
    
    // Intentar conectar sin contraseña
    try {
      connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'extraccion'
      });
      console.log('✅ Conexión exitosa (sin contraseña)');
    } catch (error) {
      console.log('❌ Error sin contraseña:', error.message);
      
      // Intentar con contraseña común
      try {
        connection = await mysql.createConnection({
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: 'root',
          database: 'extraccion'
        });
        console.log('✅ Conexión exitosa (con contraseña "root")');
      } catch (error2) {
        console.log('❌ Error con contraseña "root":', error2.message);
        console.log('\n💡 Necesitas proporcionar la contraseña correcta de MySQL');
        return;
      }
    }

    // Verificar datos existentes
    console.log('\n📊 Datos en la base de datos:');
    
    const [zonas] = await connection.execute('SELECT COUNT(*) as count FROM zona');
    const [sectores] = await connection.execute('SELECT COUNT(*) as count FROM sector');
    const [maquinas] = await connection.execute('SELECT COUNT(*) as count FROM maquina');
    const [operadores] = await connection.execute('SELECT COUNT(*) as count FROM operador');
    const [barredores] = await connection.execute('SELECT COUNT(*) as count FROM barredor_catalogo');
    const [planillas] = await connection.execute('SELECT COUNT(*) as count FROM planilla');
    const [usuarios] = await connection.execute('SELECT COUNT(*) as count FROM usuario');

    console.log(`- Zonas: ${zonas[0].count}`);
    console.log(`- Sectores: ${sectores[0].count}`);
    console.log(`- Máquinas: ${maquinas[0].count}`);
    console.log(`- Operadores: ${operadores[0].count}`);
    console.log(`- Barredores: ${barredores[0].count}`);
    console.log(`- Planillas: ${planillas[0].count}`);
    console.log(`- Usuarios: ${usuarios[0].count}`);

    // Mostrar nombres de zonas
    const [zonasNombres] = await connection.execute('SELECT nombre FROM zona LIMIT 5');
    console.log(`\n📍 Zonas: ${zonasNombres.map(z => z.nombre).join(', ')}`);

    // Mostrar algunas planillas recientes
    const [planillasRecientes] = await connection.execute(`
      SELECT p.id, p.ticket, p.estado, p.fecha_inicio, s.nombre as sector
      FROM planilla p 
      JOIN sector s ON p.sector_id = s.id 
      ORDER BY p.fecha_inicio DESC 
      LIMIT 5
    `);
    
    if (planillasRecientes.length > 0) {
      console.log('\n📋 Planillas recientes:');
      planillasRecientes.forEach(p => {
        console.log(`- ${p.ticket} (${p.sector}) - ${p.estado} - ${p.fecha_inicio.toLocaleDateString()}`);
      });
    } else {
      console.log('\n📋 No hay planillas creadas');
    }

    // Verificar si hay datos de barredores en planillas
    const [barredoresPlanilla] = await connection.execute('SELECT COUNT(*) as count FROM barredor');
    const [maquinasPlanilla] = await connection.execute('SELECT COUNT(*) as count FROM maquina_planilla');
    const [danos] = await connection.execute('SELECT COUNT(*) as count FROM dano');

    console.log(`\n📈 Datos en planillas:`);
    console.log(`- Registros de barredores: ${barredoresPlanilla[0].count}`);
    console.log(`- Registros de máquinas: ${maquinasPlanilla[0].count}`);
    console.log(`- Registros de daños: ${danos[0].count}`);

    if (planillas[0].count === 0) {
      console.log('\n⚠️ No hay planillas. ¿Quieres que ejecute el script de inserción de datos?');
    } else {
      console.log('\n✅ Hay datos en el sistema. Los dashboards deberían funcionar correctamente.');
    }

  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verificarDatos(); 