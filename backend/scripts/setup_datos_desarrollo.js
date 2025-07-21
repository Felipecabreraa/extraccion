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
  PabellonMaquina, 
  Dano, 
  BarredorCatalogo 
} = require('../src/models');
const sequelize = require('../src/config/database');

// Datos ficticios para zonas
const zonasFicticias = [
  { nombre: 'Zona Norte', descripcion: 'Sector norte del complejo' },
  { nombre: 'Zona Sur', descripcion: 'Sector sur del complejo' },
  { nombre: 'Zona Este', descripcion: 'Sector este del complejo' },
  { nombre: 'Zona Oeste', descripcion: 'Sector oeste del complejo' },
  { nombre: 'Zona Central', descripcion: 'Sector central del complejo' }
];

// Datos ficticios para usuarios
const usuariosFicticios = [
  { nombre: 'Juan Pérez', email: 'juan.perez@empresa.com', password: 'password123', rol: 'ADMIN' },
  { nombre: 'María García', email: 'maria.garcia@empresa.com', password: 'password123', rol: 'SUPERVISOR' },
  { nombre: 'Carlos López', email: 'carlos.lopez@empresa.com', password: 'password123', rol: 'SUPERVISOR' },
  { nombre: 'Ana Rodríguez', email: 'ana.rodriguez@empresa.com', password: 'password123', rol: 'SUPERVISOR' },
  { nombre: 'Luis Martínez', email: 'luis.martinez@empresa.com', password: 'password123', rol: 'SUPERVISOR' }
];

// Datos ficticios para operadores
const operadoresFicticios = [
  { nombre: 'Roberto Silva', rut: '12345678-9', telefono: '+56912345678' },
  { nombre: 'Patricia Morales', rut: '23456789-0', telefono: '+56923456789' },
  { nombre: 'Fernando Herrera', rut: '34567890-1', telefono: '+56934567890' },
  { nombre: 'Carmen Vega', rut: '45678901-2', telefono: '+56945678901' },
  { nombre: 'Miguel Torres', rut: '56789012-3', telefono: '+56956789012' },
  { nombre: 'Elena Castro', rut: '67890123-4', telefono: '+56967890123' },
  { nombre: 'Diego Rojas', rut: '78901234-5', telefono: '+56978901234' },
  { nombre: 'Sofia Mendoza', rut: '89012345-6', telefono: '+56989012345' }
];

// Datos ficticios para máquinas
const maquinasFicticias = [
  { nombre: 'Barredora Industrial A1', tipo: 'Barredora', modelo: 'BI-2023-A1', estado: 'ACTIVA' },
  { nombre: 'Barredora Industrial A2', tipo: 'Barredora', modelo: 'BI-2023-A2', estado: 'ACTIVA' },
  { nombre: 'Barredora Industrial A3', tipo: 'Barredora', modelo: 'BI-2023-A3', estado: 'ACTIVA' },
  { nombre: 'Barredora Industrial A4', tipo: 'Barredora', modelo: 'BI-2023-A4', estado: 'ACTIVA' },
  { nombre: 'Barredora Industrial A5', tipo: 'Barredora', modelo: 'BI-2023-A5', estado: 'ACTIVA' },
  { nombre: 'Barredora Industrial A6', tipo: 'Barredora', modelo: 'BI-2023-A6', estado: 'ACTIVA' },
  { nombre: 'Barredora Industrial A7', tipo: 'Barredora', modelo: 'BI-2023-A7', estado: 'ACTIVA' },
  { nombre: 'Barredora Industrial A8', tipo: 'Barredora', modelo: 'BI-2023-A8', estado: 'ACTIVA' }
];

// Datos ficticios para catálogo de barredores
const barredorCatalogoFicticio = [
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

async function limpiarDatos() {
  try {
    console.log('🧹 Iniciando limpieza de datos...');

    // Eliminar en orden para respetar las foreign keys
    console.log('🗑️ Eliminando registros de daños...');
    await Dano.destroy({ where: {} });

    console.log('🗑️ Eliminando registros de máquinas en planillas...');
    await MaquinaPlanilla.destroy({ where: {} });

    console.log('🗑️ Eliminando registros de barredores...');
    await Barredor.destroy({ where: {} });

    console.log('🗑️ Eliminando planillas...');
    await Planilla.destroy({ where: {} });

    console.log('🗑️ Eliminando pabellones...');
    await Pabellon.destroy({ where: {} });

    console.log('🗑️ Eliminando sectores...');
    await Sector.destroy({ where: {} });

    console.log('🗑️ Eliminando máquinas...');
    await Maquina.destroy({ where: {} });

    console.log('🗑️ Eliminando operadores...');
    await Operador.destroy({ where: {} });

    console.log('🗑️ Eliminando catálogo de barredores...');
    await BarredorCatalogo.destroy({ where: {} });

    console.log('🗑️ Eliminando zonas...');
    await Zona.destroy({ where: {} });

    // Mantener al menos un usuario admin
    console.log('🗑️ Eliminando usuarios (excepto admin)...');
    await Usuario.destroy({ 
      where: { 
        rol: { [sequelize.Op.ne]: 'ADMIN' } 
      } 
    });

    console.log('✅ Limpieza completada exitosamente');

  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
    throw error;
  }
}

async function generarDatosFicticios() {
  try {
    console.log('🔄 Iniciando generación de datos ficticios...');

    // 1. Crear zonas
    console.log('📍 Creando zonas...');
    const zonasCreadas = await Zona.bulkCreate(zonasFicticias);
    console.log(`✅ ${zonasCreadas.length} zonas creadas`);

    // 2. Crear usuarios
    console.log('👥 Creando usuarios...');
    const usuariosCreados = await Usuario.bulkCreate(usuariosFicticios);
    console.log(`✅ ${usuariosCreados.length} usuarios creados`);

    // 3. Crear operadores
    console.log('👷 Creando operadores...');
    const operadoresCreados = await Operador.bulkCreate(operadoresFicticios);
    console.log(`✅ ${operadoresCreados.length} operadores creados`);

    // 4. Crear máquinas
    console.log('🚛 Creando máquinas...');
    const maquinasCreadas = await Maquina.bulkCreate(maquinasFicticias);
    console.log(`✅ ${maquinasCreadas.length} máquinas creadas`);

    // 5. Crear catálogo de barredores
    console.log('🧹 Creando catálogo de barredores...');
    const barredorCatalogoCreado = await BarredorCatalogo.bulkCreate(barredorCatalogoFicticio);
    console.log(`✅ ${barredorCatalogoCreado.length} barredores en catálogo creados`);

    // 6. Crear sectores (con pabellones automáticos)
    console.log('🏢 Creando sectores...');
    const sectoresFicticios = [];
    for (let i = 0; i < zonasCreadas.length; i++) {
      const zona = zonasCreadas[i];
      for (let j = 1; j <= 3; j++) {
        sectoresFicticios.push({
          nombre: `Sector ${j} - ${zona.nombre}`,
          descripcion: `Sector ${j} de la ${zona.nombre}`,
          zona_id: zona.id,
          cantidad_pabellones: Math.floor(Math.random() * 10) + 5 // 5-15 pabellones
        });
      }
    }
    const sectoresCreados = await Sector.bulkCreate(sectoresFicticios);
    console.log(`✅ ${sectoresCreados.length} sectores creados`);

    // 7. Crear planillas
    console.log('📋 Creando planillas...');
    const planillasFicticias = [];
    const supervisores = usuariosCreados.filter(u => u.rol === 'SUPERVISOR');
    
    for (let i = 0; i < sectoresCreados.length; i++) {
      const sector = sectoresCreados[i];
      const supervisor = supervisores[Math.floor(Math.random() * supervisores.length)];
      
      // Crear 2-4 planillas por sector
      const numPlanillas = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < numPlanillas; j++) {
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - Math.floor(Math.random() * 30)); // Últimos 30 días
        
        const fechaTermino = new Date(fechaInicio);
        fechaTermino.setDate(fechaTermino.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 días después
        
        planillasFicticias.push({
          supervisor_id: supervisor.id,
          sector_id: sector.id,
          mt2: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 m2
          pabellones_total: sector.cantidad_pabellones,
          pabellones_limpiados: Math.floor(Math.random() * sector.cantidad_pabellones) + 1,
          fecha_inicio: fechaInicio,
          fecha_termino: fechaTermino,
          ticket: `TKT-${sector.id}-${j + 1}-${Math.floor(Math.random() * 1000)}`,
          estado: Math.random() > 0.3 ? 'CERRADO' : 'ABIERTO',
          observacion: Math.random() > 0.5 ? 'Planilla completada satisfactoriamente' : null
        });
      }
    }
    const planillasCreadas = await Planilla.bulkCreate(planillasFicticias);
    console.log(`✅ ${planillasCreadas.length} planillas creadas`);

    // 8. Crear registros de barredores en planillas
    console.log('🧹 Creando registros de barredores...');
    const barredoresPlanilla = [];
    for (const planilla of planillasCreadas) {
      const numBarredores = Math.floor(Math.random() * 5) + 2; // 2-6 barredores por planilla
      const barredoresSeleccionados = [];
      
      for (let i = 0; i < numBarredores; i++) {
        let barredor;
        do {
          barredor = barredorCatalogoCreado[Math.floor(Math.random() * barredorCatalogoCreado.length)];
        } while (barredoresSeleccionados.includes(barredor.id));
        
        barredoresSeleccionados.push(barredor.id);
        barredoresPlanilla.push({
          planilla_id: planilla.id,
          barredor_id: barredor.id,
          dias: Math.floor(Math.random() * 7) + 1, // 1-7 días
          horas_extras: Math.floor(Math.random() * 20) / 2 // 0-10 horas extras
        });
      }
    }
    await Barredor.bulkCreate(barredoresPlanilla);
    console.log(`✅ ${barredoresPlanilla.length} registros de barredores creados`);

    // 9. Crear registros de máquinas en planillas
    console.log('🚛 Creando registros de máquinas...');
    const maquinasPlanilla = [];
    for (const planilla of planillasCreadas) {
      const numMaquinas = Math.floor(Math.random() * 4) + 1; // 1-4 máquinas por planilla
      const maquinasSeleccionadas = [];
      
      for (let i = 0; i < numMaquinas; i++) {
        let maquina;
        do {
          maquina = maquinasCreadas[Math.floor(Math.random() * maquinasCreadas.length)];
        } while (maquinasSeleccionadas.includes(maquina.id));
        
        maquinasSeleccionadas.push(maquina.id);
        const operador = operadoresCreados[Math.floor(Math.random() * operadoresCreados.length)];
        
        maquinasPlanilla.push({
          planilla_id: planilla.id,
          maquina_id: maquina.id,
          operador_id: operador.id,
          dias_trabajados: Math.floor(Math.random() * 7) + 1, // 1-7 días
          horas_extras: Math.floor(Math.random() * 20) / 2, // 0-10 horas extras
          odometro_inicio: Math.floor(Math.random() * 10000) + 1000, // 1000-11000 km
          odometro_fin: Math.floor(Math.random() * 1000) + 11000, // 11000-12000 km
          petroleo: Math.floor(Math.random() * 50) + 10 // 10-60 litros
        });
      }
    }
    await MaquinaPlanilla.bulkCreate(maquinasPlanilla);
    console.log(`✅ ${maquinasPlanilla.length} registros de máquinas creados`);

    // 10. Crear registros de daños
    console.log('🔧 Creando registros de daños...');
    const danosFicticios = [];
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
    
    // Solo crear daños para algunas planillas (30% de probabilidad)
    for (const planilla of planillasCreadas) {
      if (Math.random() < 0.3) {
        const sector = sectoresCreados.find(s => s.id === planilla.sector_id);
        const zona = zonasCreadas.find(z => z.id === sector.zona_id);
        
        // Obtener pabellones del sector
        const pabellones = await Pabellon.findAll({ where: { sector_id: sector.id } });
        
        if (pabellones.length > 0) {
          const numDanos = Math.floor(Math.random() * 3) + 1; // 1-3 daños por planilla
          
          for (let i = 0; i < numDanos; i++) {
            const pabellon = pabellones[Math.floor(Math.random() * pabellones.length)];
            const maquina = maquinasCreadas[Math.floor(Math.random() * maquinasCreadas.length)];
            
            danosFicticios.push({
              planilla_id: planilla.id,
              pabellon_id: pabellon.id,
              maquina_id: maquina.id,
              tipo: tiposDano[Math.floor(Math.random() * tiposDano.length)],
              descripcion: descripcionesDano[Math.floor(Math.random() * descripcionesDano.length)],
              cantidad: Math.floor(Math.random() * 5) + 1, // 1-5 unidades
              observacion: Math.random() > 0.5 ? 'Daño reportado y en proceso de reparación' : null
            });
          }
        }
      }
    }
    
    if (danosFicticios.length > 0) {
      await Dano.bulkCreate(danosFicticios);
      console.log(`✅ ${danosFicticios.length} registros de daños creados`);
    } else {
      console.log('ℹ️ No se crearon registros de daños');
    }

    console.log('🎉 ¡Datos ficticios generados exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`- ${zonasCreadas.length} zonas`);
    console.log(`- ${usuariosCreados.length} usuarios`);
    console.log(`- ${operadoresCreados.length} operadores`);
    console.log(`- ${maquinasCreadas.length} máquinas`);
    console.log(`- ${barredorCatalogoCreado.length} barredores en catálogo`);
    console.log(`- ${sectoresCreados.length} sectores`);
    console.log(`- ${planillasCreadas.length} planillas`);
    console.log(`- ${barredoresPlanilla.length} registros de barredores`);
    console.log(`- ${maquinasPlanilla.length} registros de máquinas`);
    console.log(`- ${danosFicticios.length} registros de daños`);

  } catch (error) {
    console.error('❌ Error generando datos ficticios:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const opcion = args[0] || 'generar';

  try {
    if (opcion === 'limpiar') {
      await limpiarDatos();
    } else if (opcion === 'generar') {
      await generarDatosFicticios();
    } else if (opcion === 'completo') {
      console.log('🔄 Ejecutando limpieza y generación completa...');
      await limpiarDatos();
      await generarDatosFicticios();
    } else {
      console.log('❌ Opción no válida. Uso:');
      console.log('  node setup_datos_desarrollo.js [opcion]');
      console.log('');
      console.log('Opciones:');
      console.log('  generar  - Solo generar datos ficticios (por defecto)');
      console.log('  limpiar  - Solo limpiar datos existentes');
      console.log('  completo - Limpiar y generar datos ficticios');
    }
  } catch (error) {
    console.error('❌ Error en la ejecución:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
main(); 