const mysql = require('mysql2/promise');

// Configuración básica de MySQL (sin contraseña)
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'extraccion'
};

async function insertarDatosAutomaticos() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Intentar conectar sin contraseña primero
    try {
      connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
      });
    } catch (error) {
      // Si falla, intentar con contraseña común
      console.log('⚠️ Intentando con contraseña común...');
      connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: 'root'
      });
    }

    console.log('✅ Conexión exitosa a MySQL');

    // Crear base de datos si no existe
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.execute(`USE ${dbConfig.database}`);

    console.log('📊 Insertando datos ficticios...');

    // Insertar zonas
    await connection.execute(`
      INSERT IGNORE INTO zona (nombre, descripcion) VALUES 
      ('Zona Norte', 'Sector norte del complejo'),
      ('Zona Sur', 'Sector sur del complejo'),
      ('Zona Este', 'Sector este del complejo'),
      ('Zona Oeste', 'Sector oeste del complejo'),
      ('Zona Central', 'Sector central del complejo')
    `);
    console.log('✅ Zonas insertadas');

    // Insertar usuarios
    await connection.execute(`
      INSERT IGNORE INTO usuario (nombre, email, password, rol) VALUES 
      ('Juan Pérez', 'juan.perez@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'ADMIN'),
      ('María García', 'maria.garcia@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'SUPERVISOR'),
      ('Carlos López', 'carlos.lopez@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'SUPERVISOR'),
      ('Ana Rodríguez', 'ana.rodriguez@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'SUPERVISOR'),
      ('Luis Martínez', 'luis.martinez@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'SUPERVISOR')
    `);
    console.log('✅ Usuarios insertados');

    // Insertar operadores
    await connection.execute(`
      INSERT IGNORE INTO operador (nombre, rut, telefono) VALUES 
      ('Roberto Silva', '12345678-9', '+56912345678'),
      ('Patricia Morales', '23456789-0', '+56923456789'),
      ('Fernando Herrera', '34567890-1', '+56934567890'),
      ('Carmen Vega', '45678901-2', '+56945678901'),
      ('Miguel Torres', '56789012-3', '+56956789012'),
      ('Elena Castro', '67890123-4', '+56967890123'),
      ('Diego Rojas', '78901234-5', '+56978901234'),
      ('Sofia Mendoza', '89012345-6', '+56989012345')
    `);
    console.log('✅ Operadores insertados');

    // Insertar máquinas
    await connection.execute(`
      INSERT IGNORE INTO maquina (nombre, tipo, modelo, estado) VALUES 
      ('Barredora Industrial A1', 'Barredora', 'BI-2023-A1', 'ACTIVA'),
      ('Barredora Industrial A2', 'Barredora', 'BI-2023-A2', 'ACTIVA'),
      ('Barredora Industrial A3', 'Barredora', 'BI-2023-A3', 'ACTIVA'),
      ('Barredora Industrial A4', 'Barredora', 'BI-2023-A4', 'ACTIVA'),
      ('Barredora Industrial A5', 'Barredora', 'BI-2023-A5', 'ACTIVA'),
      ('Barredora Industrial A6', 'Barredora', 'BI-2023-A6', 'ACTIVA'),
      ('Barredora Industrial A7', 'Barredora', 'BI-2023-A7', 'ACTIVA'),
      ('Barredora Industrial A8', 'Barredora', 'BI-2023-A8', 'ACTIVA')
    `);
    console.log('✅ Máquinas insertadas');

    // Insertar catálogo de barredores
    await connection.execute(`
      INSERT IGNORE INTO barredor_catalogo (nombre, rut, telefono) VALUES 
      ('Pedro González', '11111111-1', '+56911111111'),
      ('Rosa Jiménez', '22222222-2', '+56922222222'),
      ('Héctor Ruiz', '33333333-3', '+56933333333'),
      ('Isabel Moreno', '44444444-4', '+56944444444'),
      ('Francisco Díaz', '55555555-5', '+56955555555'),
      ('Lucía Soto', '66666666-6', '+56966666666'),
      ('Ricardo Flores', '77777777-7', '+56977777777'),
      ('Mónica Valdez', '88888888-8', '+56988888888'),
      ('Alberto Reyes', '99999999-9', '+56999999999'),
      ('Carmen Ortega', '10101010-0', '+56910101010')
    `);
    console.log('✅ Catálogo de barredores insertado');

    // Obtener IDs de zonas
    const [zonas] = await connection.execute('SELECT id FROM zona');
    
    // Insertar sectores
    for (let i = 0; i < zonas.length; i++) {
      const zonaId = zonas[i].id;
      for (let j = 1; j <= 3; j++) {
        await connection.execute(`
          INSERT IGNORE INTO sector (nombre, descripcion, zona_id, cantidad_pabellones) VALUES 
          (?, ?, ?, ?)
        `, [`Sector ${j} - Zona ${i + 1}`, `Sector ${j} de la zona ${i + 1}`, zonaId, Math.floor(Math.random() * 10) + 5]);
      }
    }
    console.log('✅ Sectores insertados');

    // Obtener IDs de sectores y usuarios
    const [sectores] = await connection.execute('SELECT id, cantidad_pabellones FROM sector');
    const [usuarios] = await connection.execute('SELECT id FROM usuario WHERE rol = "SUPERVISOR"');

    // Insertar planillas
    for (let i = 0; i < 20; i++) {
      const sector = sectores[Math.floor(Math.random() * sectores.length)];
      const supervisor = usuarios[Math.floor(Math.random() * usuarios.length)];
      
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - Math.floor(Math.random() * 30));
      
      const fechaTermino = new Date(fechaInicio);
      fechaTermino.setDate(fechaTermino.getDate() + Math.floor(Math.random() * 7) + 1);
      
      await connection.execute(`
        INSERT INTO planilla (supervisor_id, sector_id, mt2, pabellones_total, pabellones_limpiados, fecha_inicio, fecha_termino, ticket, estado, observacion) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        supervisor.id,
        sector.id,
        Math.floor(Math.random() * 5000) + 1000,
        sector.cantidad_pabellones,
        Math.floor(Math.random() * sector.cantidad_pabellones) + 1,
        fechaInicio,
        fechaTermino,
        `TKT-${Date.now()}-${i + 1}`,
        Math.random() > 0.3 ? 'CERRADO' : 'ABIERTO',
        Math.random() > 0.5 ? 'Planilla completada satisfactoriamente' : null
      ]);
    }
    console.log('✅ Planillas insertadas');

    // Obtener planillas y otros datos para insertar registros
    const [planillas] = await connection.execute('SELECT id FROM planilla');
    const [barredores] = await connection.execute('SELECT id FROM barredor_catalogo');
    const [maquinas] = await connection.execute('SELECT id FROM maquina');
    const [operadores] = await connection.execute('SELECT id FROM operador');

    // Insertar registros de barredores
    for (const planilla of planillas) {
      const numBarredores = Math.floor(Math.random() * 3) + 2;
      const barredoresSeleccionados = [];
      
      for (let i = 0; i < numBarredores; i++) {
        let barredor;
        do {
          barredor = barredores[Math.floor(Math.random() * barredores.length)];
        } while (barredoresSeleccionados.includes(barredor.id));
        
        barredoresSeleccionados.push(barredor.id);
        await connection.execute(`
          INSERT INTO barredor (planilla_id, barredor_id, dias, horas_extras) VALUES (?, ?, ?, ?)
        `, [
          planilla.id,
          barredor.id,
          Math.floor(Math.random() * 7) + 1,
          Math.floor(Math.random() * 20) / 2
        ]);
      }
    }
    console.log('✅ Registros de barredores insertados');

    // Insertar registros de máquinas
    for (const planilla of planillas) {
      const numMaquinas = Math.floor(Math.random() * 3) + 1;
      const maquinasSeleccionadas = [];
      
      for (let i = 0; i < numMaquinas; i++) {
        let maquina;
        do {
          maquina = maquinas[Math.floor(Math.random() * maquinas.length)];
        } while (maquinasSeleccionadas.includes(maquina.id));
        
        maquinasSeleccionadas.push(maquina.id);
        const operador = operadores[Math.floor(Math.random() * operadores.length)];
        
        await connection.execute(`
          INSERT INTO maquina_planilla (planilla_id, maquina_id, operador_id, dias_trabajados, horas_extras, odometro_inicio, odometro_fin, petroleo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          planilla.id,
          maquina.id,
          operador.id,
          Math.floor(Math.random() * 7) + 1,
          Math.floor(Math.random() * 20) / 2,
          Math.floor(Math.random() * 10000) + 1000,
          Math.floor(Math.random() * 1000) + 11000,
          Math.floor(Math.random() * 50) + 10
        ]);
      }
    }
    console.log('✅ Registros de máquinas insertados');

    // Insertar algunos daños
    const tiposDano = ['infraestructura', 'equipo'];
    const descripcionesDano = [
      'Pared rayada',
      'Puerta dañada',
      'Ventana rota',
      'Equipo de limpieza averiado',
      'Sistema eléctrico dañado',
      'Piso deteriorado',
      'Techo con goteras',
      'Equipo mecánico fallando'
    ];

    for (const planilla of planillas) {
      if (Math.random() < 0.3) { // 30% de probabilidad
        const sector = sectores[Math.floor(Math.random() * sectores.length)];
        const [pabellones] = await connection.execute('SELECT id FROM pabellon WHERE sector_id = ?', [sector.id]);
        
        if (pabellones.length > 0) {
          const pabellon = pabellones[Math.floor(Math.random() * pabellones.length)];
          const maquina = maquinas[Math.floor(Math.random() * maquinas.length)];
          
          await connection.execute(`
            INSERT INTO dano (planilla_id, pabellon_id, maquina_id, tipo, descripcion, cantidad, observacion) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            planilla.id,
            pabellon.id,
            maquina.id,
            tiposDano[Math.floor(Math.random() * tiposDano.length)],
            descripcionesDano[Math.floor(Math.random() * descripcionesDano.length)],
            Math.floor(Math.random() * 5) + 1,
            'Daño reportado y en proceso de reparación'
          ]);
        }
      }
    }
    console.log('✅ Registros de daños insertados');

    console.log('\n🎉 ¡Datos ficticios insertados exitosamente!');
    console.log('\n📊 Resumen de datos insertados:');
    console.log('- 5 zonas');
    console.log('- 5 usuarios (1 admin + 4 supervisores)');
    console.log('- 8 operadores');
    console.log('- 8 máquinas');
    console.log('- 10 barredores en catálogo');
    console.log('- 15 sectores');
    console.log('- 20 planillas');
    console.log('- Registros de barredores y máquinas');
    console.log('- Registros de daños');
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('Admin: juan.perez@empresa.com / password123');
    console.log('Supervisores: maria.garcia@empresa.com / password123');

  } catch (error) {
    console.error('❌ Error insertando datos:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solución:');
      console.log('1. Asegúrate de que MySQL esté ejecutándose');
      console.log('2. Verifica que el usuario root no tenga contraseña');
      console.log('3. O ejecuta: ALTER USER "root"@"localhost" IDENTIFIED BY "";');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar el script
insertarDatosAutomaticos(); 