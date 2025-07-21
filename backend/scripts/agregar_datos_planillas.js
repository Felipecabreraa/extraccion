const { 
  Usuario, 
  Zona, 
  Sector, 
  Pabellon, 
  Planilla, 
  Barredor, 
  Maquina, 
  Operador, 
  MaquinaPlanilla, 
  Dano, 
  BarredorCatalogo 
} = require('../src/models');
const sequelize = require('../src/config/database');

async function agregarDatosPlanillas() {
  try {
    console.log('🔄 Agregando datos ficticios a las planillas...');

    // Verificar si ya existen datos
    const planillasExistentes = await Planilla.count();
    if (planillasExistentes > 0) {
      console.log(`ℹ️ Ya existen ${planillasExistentes} planillas. Agregando más datos...`);
    }

    // Obtener datos existentes o crear nuevos
    let zonas = await Zona.findAll();
    let usuarios = await Usuario.findAll();
    let operadores = await Operador.findAll();
    let maquinas = await Maquina.findAll();
    let barredorCatalogo = await BarredorCatalogo.findAll();
    let sectores = await Sector.findAll();

    // Si no hay datos, crear algunos básicos
    if (zonas.length === 0) {
      console.log('📍 Creando zonas básicas...');
      zonas = await Zona.bulkCreate([
        { nombre: 'Zona Norte', descripcion: 'Sector norte del complejo' },
        { nombre: 'Zona Sur', descripcion: 'Sector sur del complejo' },
        { nombre: 'Zona Este', descripcion: 'Sector este del complejo' }
      ]);
    }

    if (usuarios.length === 0) {
      console.log('👥 Creando usuarios básicos...');
      usuarios = await Usuario.bulkCreate([
        { nombre: 'Juan Pérez', email: 'juan.perez@empresa.com', password: 'password123', rol: 'ADMIN' },
        { nombre: 'María García', email: 'maria.garcia@empresa.com', password: 'password123', rol: 'SUPERVISOR' },
        { nombre: 'Carlos López', email: 'carlos.lopez@empresa.com', password: 'password123', rol: 'SUPERVISOR' }
      ]);
    }

    if (operadores.length === 0) {
      console.log('👷 Creando operadores básicos...');
      operadores = await Operador.bulkCreate([
        { nombre: 'Roberto Silva', rut: '12345678-9', telefono: '+56912345678' },
        { nombre: 'Patricia Morales', rut: '23456789-0', telefono: '+56923456789' },
        { nombre: 'Fernando Herrera', rut: '34567890-1', telefono: '+56934567890' }
      ]);
    }

    if (maquinas.length === 0) {
      console.log('🚛 Creando máquinas básicas...');
      maquinas = await Maquina.bulkCreate([
        { nombre: 'Barredora Industrial A1', tipo: 'Barredora', modelo: 'BI-2023-A1', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A2', tipo: 'Barredora', modelo: 'BI-2023-A2', estado: 'ACTIVA' },
        { nombre: 'Barredora Industrial A3', tipo: 'Barredora', modelo: 'BI-2023-A3', estado: 'ACTIVA' }
      ]);
    }

    if (barredorCatalogo.length === 0) {
      console.log('🧹 Creando catálogo de barredores básico...');
      barredorCatalogo = await BarredorCatalogo.bulkCreate([
        { nombre: 'Pedro González', rut: '11111111-1', telefono: '+56911111111' },
        { nombre: 'Rosa Jiménez', rut: '22222222-2', telefono: '+56922222222' },
        { nombre: 'Héctor Ruiz', rut: '33333333-3', telefono: '+56933333333' },
        { nombre: 'Isabel Moreno', rut: '44444444-4', telefono: '+56944444444' }
      ]);
    }

    if (sectores.length === 0) {
      console.log('🏢 Creando sectores básicos...');
      sectores = await Sector.bulkCreate([
        { nombre: 'Sector 1 - Zona Norte', descripcion: 'Sector 1 de la Zona Norte', zona_id: zonas[0].id, cantidad_pabellones: 8 },
        { nombre: 'Sector 2 - Zona Norte', descripcion: 'Sector 2 de la Zona Norte', zona_id: zonas[0].id, cantidad_pabellones: 6 },
        { nombre: 'Sector 1 - Zona Sur', descripcion: 'Sector 1 de la Zona Sur', zona_id: zonas[1].id, cantidad_pabellones: 10 },
        { nombre: 'Sector 1 - Zona Este', descripcion: 'Sector 1 de la Zona Este', zona_id: zonas[2].id, cantidad_pabellones: 7 }
      ]);
    }

    // Crear planillas adicionales
    console.log('📋 Creando planillas adicionales...');
    const supervisores = usuarios.filter(u => u.rol === 'SUPERVISOR');
    const nuevasPlanillas = [];

    for (let i = 0; i < 10; i++) {
      const sector = sectores[Math.floor(Math.random() * sectores.length)];
      const supervisor = supervisores[Math.floor(Math.random() * supervisores.length)];
      
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - Math.floor(Math.random() * 30));
      
      const fechaTermino = new Date(fechaInicio);
      fechaTermino.setDate(fechaTermino.getDate() + Math.floor(Math.random() * 7) + 1);
      
      nuevasPlanillas.push({
        supervisor_id: supervisor.id,
        sector_id: sector.id,
        mt2: Math.floor(Math.random() * 5000) + 1000,
        pabellones_total: sector.cantidad_pabellones,
        pabellones_limpiados: Math.floor(Math.random() * sector.cantidad_pabellones) + 1,
        fecha_inicio: fechaInicio,
        fecha_termino: fechaTermino,
        ticket: `TKT-${Date.now()}-${i + 1}`,
        estado: Math.random() > 0.3 ? 'CERRADO' : 'ABIERTO',
        observacion: Math.random() > 0.5 ? 'Planilla completada satisfactoriamente' : null
      });
    }

    const planillasCreadas = await Planilla.bulkCreate(nuevasPlanillas);
    console.log(`✅ ${planillasCreadas.length} planillas creadas`);

    // Agregar barredores a las planillas
    console.log('🧹 Agregando barredores a las planillas...');
    const barredoresPlanilla = [];
    for (const planilla of planillasCreadas) {
      const numBarredores = Math.floor(Math.random() * 3) + 2; // 2-4 barredores
      const barredoresSeleccionados = [];
      
      for (let i = 0; i < numBarredores; i++) {
        let barredor;
        do {
          barredor = barredorCatalogo[Math.floor(Math.random() * barredorCatalogo.length)];
        } while (barredoresSeleccionados.includes(barredor.id));
        
        barredoresSeleccionados.push(barredor.id);
        barredoresPlanilla.push({
          planilla_id: planilla.id,
          barredor_id: barredor.id,
          dias: Math.floor(Math.random() * 7) + 1,
          horas_extras: Math.floor(Math.random() * 20) / 2
        });
      }
    }
    await Barredor.bulkCreate(barredoresPlanilla);
    console.log(`✅ ${barredoresPlanilla.length} registros de barredores creados`);

    // Agregar máquinas a las planillas
    console.log('🚛 Agregando máquinas a las planillas...');
    const maquinasPlanilla = [];
    for (const planilla of planillasCreadas) {
      const numMaquinas = Math.floor(Math.random() * 3) + 1; // 1-3 máquinas
      const maquinasSeleccionadas = [];
      
      for (let i = 0; i < numMaquinas; i++) {
        let maquina;
        do {
          maquina = maquinas[Math.floor(Math.random() * maquinas.length)];
        } while (maquinasSeleccionadas.includes(maquina.id));
        
        maquinasSeleccionadas.push(maquina.id);
        const operador = operadores[Math.floor(Math.random() * operadores.length)];
        
        maquinasPlanilla.push({
          planilla_id: planilla.id,
          maquina_id: maquina.id,
          operador_id: operador.id,
          dias_trabajados: Math.floor(Math.random() * 7) + 1,
          horas_extras: Math.floor(Math.random() * 20) / 2,
          odometro_inicio: Math.floor(Math.random() * 10000) + 1000,
          odometro_fin: Math.floor(Math.random() * 1000) + 11000,
          petroleo: Math.floor(Math.random() * 50) + 10
        });
      }
    }
    await MaquinaPlanilla.bulkCreate(maquinasPlanilla);
    console.log(`✅ ${maquinasPlanilla.length} registros de máquinas creados`);

    // Agregar algunos daños
    console.log('🔧 Agregando registros de daños...');
    const danosFicticios = [];
    const tiposDano = ['infraestructura', 'equipo'];
    const descripcionesDano = [
      'Pared rayada',
      'Puerta dañada',
      'Ventana rota',
      'Equipo de limpieza averiado',
      'Sistema eléctrico dañado'
    ];
    
    // Solo para algunas planillas
    for (const planilla of planillasCreadas) {
      if (Math.random() < 0.3) { // 30% de probabilidad
        const sector = sectores.find(s => s.id === planilla.sector_id);
        const pabellones = await Pabellon.findAll({ where: { sector_id: sector.id } });
        
        if (pabellones.length > 0) {
          const pabellon = pabellones[Math.floor(Math.random() * pabellones.length)];
          const maquina = maquinas[Math.floor(Math.random() * maquinas.length)];
          
          danosFicticios.push({
            planilla_id: planilla.id,
            pabellon_id: pabellon.id,
            maquina_id: maquina.id,
            tipo: tiposDano[Math.floor(Math.random() * tiposDano.length)],
            descripcion: descripcionesDano[Math.floor(Math.random() * descripcionesDano.length)],
            cantidad: Math.floor(Math.random() * 5) + 1,
            observacion: 'Daño reportado y en proceso de reparación'
          });
        }
      }
    }
    
    if (danosFicticios.length > 0) {
      await Dano.bulkCreate(danosFicticios);
      console.log(`✅ ${danosFicticios.length} registros de daños creados`);
    }

    console.log('🎉 ¡Datos agregados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- ${planillasCreadas.length} planillas nuevas`);
    console.log(`- ${barredoresPlanilla.length} registros de barredores`);
    console.log(`- ${maquinasPlanilla.length} registros de máquinas`);
    console.log(`- ${danosFicticios.length} registros de daños`);

  } catch (error) {
    console.error('❌ Error agregando datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
agregarDatosPlanillas(); 