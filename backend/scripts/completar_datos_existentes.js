const mysql = require('mysql2/promise');

// Configuración básica de MySQL
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'extraccion'
};

async function completarDatosExistentes() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos existente...');
    
    // Intentar conectar sin contraseña primero
    try {
      connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
      });
    } catch (error) {
      // Si falla, intentar con contraseña común
      console.log('⚠️ Intentando con contraseña común...');
      connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: 'root',
        database: dbConfig.database
      });
    }

    console.log('✅ Conexión exitosa a la base de datos existente');

    // Verificar datos existentes
    console.log('\n📊 Verificando datos existentes...');
    
    const [zonasExistentes] = await connection.execute('SELECT COUNT(*) as count FROM zona');
    const [sectoresExistentes] = await connection.execute('SELECT COUNT(*) as count FROM sector');
    const [maquinasExistentes] = await connection.execute('SELECT COUNT(*) as count FROM maquina');
    const [operadoresExistentes] = await connection.execute('SELECT COUNT(*) as count FROM operador');
    const [barredoresExistentes] = await connection.execute('SELECT COUNT(*) as count FROM barredor_catalogo');
    const [planillasExistentes] = await connection.execute('SELECT COUNT(*) as count FROM planilla');

    console.log(`- Zonas: ${zonasExistentes[0].count}`);
    console.log(`- Sectores: ${sectoresExistentes[0].count}`);
    console.log(`- Máquinas: ${maquinasExistentes[0].count}`);
    console.log(`- Operadores: ${operadoresExistentes[0].count}`);
    console.log(`- Barredores: ${barredoresExistentes[0].count}`);
    console.log(`- Planillas: ${planillasExistentes[0].count}`);

    // Obtener las 3 zonas existentes
    const [zonas] = await connection.execute('SELECT id, nombre FROM zona LIMIT 3');
    console.log(`\n📍 Zonas encontradas: ${zonas.map(z => z.nombre).join(', ')}`);

    // Agregar sectores si no existen (3 por zona = 9 sectores total)
    if (sectoresExistentes[0].count === 0) {
      console.log('\n🏢 Agregando sectores...');
      for (let i = 0; i < zonas.length; i++) {
        const zona = zonas[i];
        for (let j = 1; j <= 3; j++) {
          await connection.execute(`
            INSERT INTO sector (nombre, descripcion, zona_id, cantidad_pabellones) VALUES 
            (?, ?, ?, ?)
          `, [
            `Sector ${j} - ${zona.nombre}`,
            `Sector ${j} de la ${zona.nombre}`,
            zona.id,
            Math.floor(Math.random() * 10) + 5 // 5-15 pabellones
          ]);
        }
      }
      console.log('✅ 9 sectores agregados (3 por zona)');
    } else {
      console.log('ℹ️ Los sectores ya existen');
    }

    // Agregar máquinas si no existen
    if (maquinasExistentes[0].count === 0) {
      console.log('\n🚛 Agregando máquinas...');
      const maquinas = [
        { nombre: 'Barredora Industrial A1', tipo: 'Barredora', modelo: 'BI-2023-A1', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A2', tipo: 'Barredora', modelo: 'BI-2023-A2', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A3', tipo: 'Barredora', modelo: 'BI-2023-A3', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A4', tipo: 'Barredora', modelo: 'BI-2023-A4', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A5', tipo: 'Barredora', modelo: 'BI-2023-A5', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A6', tipo: 'Barredora', modelo: 'BI-2023-A6', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A7', tipo: 'Barredora', modelo: 'BI-2023-A7', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A8', tipo: 'Barredora', modelo: 'BI-2023-A8', estado: 'ACTIVA' }
      ];

      for (const maquina of maquinas) {
        await connection.execute(`
          INSERT INTO maquina (nombre, tipo, modelo, estado) VALUES (?, ?, ?, ?)
        `, [maquina.nombre, maquina.tipo, maquina.modelo, maquina.estado]);
      }
      console.log('✅ 8 máquinas agregadas');
    } else {
      console.log('ℹ️ Las máquinas ya existen');
    }

    // Agregar operadores si no existen
    if (operadoresExistentes[0].count === 0) {
      console.log('\n👷 Agregando operadores...');
      const operadores = [
        { nombre: 'Roberto Silva', rut: '12345678-9', telefono: '+56912345678' },
        { nombre: 'Patricia Morales', rut: '23456789-0', telefono: '+56923456789' },
        { nombre: 'Fernando Herrera', rut: '34567890-1', telefono: '+56934567890' },
        { nombre: 'Carmen Vega', rut: '45678901-2', telefono: '+56945678901' },
        { nombre: 'Miguel Torres', rut: '56789012-3', telefono: '+56956789012' },
        { nombre: 'Elena Castro', rut: '67890123-4', telefono: '+56967890123' },
        { nombre: 'Diego Rojas', rut: '78901234-5', telefono: '+56978901234' },
        { nombre: 'Sofia Mendoza', rut: '89012345-6', telefono: '+56989012345' }
      ];

      for (const operador of operadores) {
        await connection.execute(`
          INSERT INTO operador (nombre, rut, telefono) VALUES (?, ?, ?)
        `, [operador.nombre, operador.rut, operador.telefono]);
      }
      console.log('✅ 8 operadores agregados');
    } else {
      console.log('ℹ️ Los operadores ya existen');
    }

    // Agregar barredores si no existen
    if (barredoresExistentes[0].count === 0) {
      console.log('\n🧹 Agregando barredores al catálogo...');
      const barredores = [
        { nombre: 'Pedro González', rut: '11111111-1', telefono: '+56911111111' },
        { nombre: 'Rosa Jiménez', rut: '22222222-2', telefono: '+56922222222' },
        { nombre: 'Héctor Ruiz', rut: '33333333-3', telefono: '+56933333333' },
        { nombre: 'Isabel Moreno', rut: '44444444-4', telefono: '+56944444444' },
        { nombre: 'Francisco Díaz', rut: '55555555-5', telefono: '+56955555555' },
        { nombre: 'Lucía Soto', rut: '66666666-6', telefono: '+56966666666' },
        { nombre: 'Ricardo Flores', rut: '77777777-7', telefono: '+56977777777' },
        { nombre: 'Mónica Valdez', rut: '88888888-8', telefono: '+56988888888' },
        { nombre: 'Alberto Reyes', rut: '99999999-9', telefono: '+56999999999' },
        { nombre: 'Carmen Ortega', rut: '10101010-0', telefono: '+56910101010' }
      ];

      for (const barredor of barredores) {
        await connection.execute(`
          INSERT INTO barredor_catalogo (nombre, rut, telefono) VALUES (?, ?, ?)
        `, [barredor.nombre, barredor.rut, barredor.telefono]);
      }
      console.log('✅ 10 barredores agregados al catálogo');
    } else {
      console.log('ℹ️ Los barredores ya existen');
    }

    // Obtener datos para crear planillas
    const [sectores] = await connection.execute('SELECT id, cantidad_pabellones FROM sector');
    const [usuarios] = await connection.execute('SELECT id FROM usuario WHERE rol = "SUPERVISOR"');
    const [maquinas] = await connection.execute('SELECT id FROM maquina');
    const [operadores] = await connection.execute('SELECT id FROM operador');
    const [barredores] = await connection.execute('SELECT id FROM barredor_catalogo');

    // Crear planillas de producción
    console.log('\n📋 Creando planillas de producción...');
    const planillasCreadas = [];

    for (let i = 0; i < 15; i++) { // 15 planillas de producción
      const sector = sectores[Math.floor(Math.random() * sectores.length)];
      const supervisor = usuarios[Math.floor(Math.random() * usuarios.length)];
      
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - Math.floor(Math.random() * 30)); // Últimos 30 días
      
      const fechaTermino = new Date(fechaInicio);
      fechaTermino.setDate(fechaTermino.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 días después
      
      const [result] = await connection.execute(`
        INSERT INTO planilla (supervisor_id, sector_id, mt2, pabellones_total, pabellones_limpiados, fecha_inicio, fecha_termino, ticket, estado, observacion) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        supervisor.id,
        sector.id,
        Math.floor(Math.random() * 5000) + 1000, // 1000-6000 m2
        sector.cantidad_pabellones,
        Math.floor(Math.random() * sector.cantidad_pabellones) + 1,
        fechaInicio,
        fechaTermino,
        `TKT-PROD-${Date.now()}-${i + 1}`,
        Math.random() > 0.3 ? 'CERRADO' : 'ABIERTO',
        Math.random() > 0.5 ? 'Planilla de producción completada' : null
      ]);

      planillasCreadas.push(result.insertId);
    }
    console.log(`✅ ${planillasCreadas.length} planillas de producción creadas`);

    // Agregar barredores a las planillas
    console.log('\n🧹 Agregando barredores a las planillas...');
    let totalBarredores = 0;
    for (const planillaId of planillasCreadas) {
      const numBarredores = Math.floor(Math.random() * 3) + 2; // 2-4 barredores por planilla
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
          planillaId,
          barredor.id,
          Math.floor(Math.random() * 7) + 1, // 1-7 días
          Math.floor(Math.random() * 20) / 2 // 0-10 horas extras
        ]);
        totalBarredores++;
      }
    }
    console.log(`✅ ${totalBarredores} registros de barredores agregados`);

    // Agregar máquinas a las planillas
    console.log('\n🚛 Agregando máquinas a las planillas...');
    let totalMaquinas = 0;
    for (const planillaId of planillasCreadas) {
      const numMaquinas = Math.floor(Math.random() * 3) + 1; // 1-3 máquinas por planilla
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
          planillaId,
          maquina.id,
          operador.id,
          Math.floor(Math.random() * 7) + 1, // 1-7 días
          Math.floor(Math.random() * 20) / 2, // 0-10 horas extras
          Math.floor(Math.random() * 10000) + 1000, // 1000-11000 km
          Math.floor(Math.random() * 1000) + 11000, // 11000-12000 km
          Math.floor(Math.random() * 50) + 10 // 10-60 litros
        ]);
        totalMaquinas++;
      }
    }
    console.log(`✅ ${totalMaquinas} registros de máquinas agregados`);

    // Agregar algunos daños
    console.log('\n🔧 Agregando registros de daños...');
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

    let totalDanos = 0;
    for (const planillaId of planillasCreadas) {
      if (Math.random() < 0.3) { // 30% de probabilidad
        const sector = sectores[Math.floor(Math.random() * sectores.length)];
        const [pabellones] = await connection.execute('SELECT id FROM pabellon WHERE sector_id = ?', [sector.id]);
        
        if (pabellones.length > 0) {
          const pabellon = pabellones[Math.floor(Math.random() * pabellones.length)];
          const maquina = maquinas[Math.floor(Math.random() * maquinas.length)];
          
          await connection.execute(`
            INSERT INTO dano (planilla_id, pabellon_id, maquina_id, tipo, descripcion, cantidad, observacion) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            planillaId,
            pabellon.id,
            maquina.id,
            tiposDano[Math.floor(Math.random() * tiposDano.length)],
            descripcionesDano[Math.floor(Math.random() * descripcionesDano.length)],
            Math.floor(Math.random() * 5) + 1, // 1-5 unidades
            'Daño reportado y en proceso de reparación'
          ]);
          totalDanos++;
        }
      }
    }
    console.log(`✅ ${totalDanos} registros de daños agregados`);

    console.log('\n🎉 ¡Datos de producción completados exitosamente!');
    console.log('\n📊 Resumen final:');
    console.log(`- ${planillasCreadas.length} planillas de producción creadas`);
    console.log(`- ${totalBarredores} registros de barredores`);
    console.log(`- ${totalMaquinas} registros de máquinas`);
    console.log(`- ${totalDanos} registros de daños`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('Admin: juan.perez@empresa.com / password123');
    console.log('Supervisores: maria.garcia@empresa.com / password123');

  } catch (error) {
    console.error('❌ Error completando datos:', error.message);
    
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
completarDatosExistentes(); 