const { Op } = require('sequelize');
const Dano = require('./src/models/dano');
const Zona = require('./src/models/zona');
const Operador = require('./src/models/operador');
const MetrosSuperficie = require('./src/models/metrosSuperficie');

async function crearDatosPrueba() {
  try {
    console.log('🗃️ Creando datos de prueba...');

    // Verificar si ya existen datos
    const totalDanos = await Dano.count();
    console.log(`📊 Total de daños existentes: ${totalDanos}`);

    if (totalDanos > 0) {
      console.log('✅ Ya existen datos en la base de datos');
      return;
    }

    // Crear zonas de prueba
    const zonas = await Zona.bulkCreate([
      { nombre: 'Zona 1 - Hembra', tipo: 'Hembra' },
      { nombre: 'Zona 2 - Macho', tipo: 'Macho' },
      { nombre: 'Zona 3 - Hembra', tipo: 'Hembra' }
    ]);

    // Crear operadores de prueba
    const operadores = await Operador.bulkCreate([
      { nombre: 'Victor Manuel Zuniga Pozo' },
      { nombre: 'Luis Aravena Manquehual' },
      { nombre: 'Sebastian Hernaldo Hernandez Torrecill' },
      { nombre: 'Patricio Galvez Galvez' },
      { nombre: 'Luis Aravena Bravo' },
      { nombre: 'Carlos Francisco Caroca Elgueta' },
      { nombre: 'Juan Licanqueo Jaramillo' },
      { nombre: 'Luis Arturo Ulloa Donoso' },
      { nombre: 'Lenon Parra Avello' },
      { nombre: 'Hector Danilo Palma Gonzalez' }
    ]);

    console.log(`✅ Creadas ${zonas.length} zonas y ${operadores.length} operadores`);

    // Crear daños de prueba para diferentes fechas
    const fechas = [
      '2025-01-15', '2025-01-16', '2025-01-17',
      '2025-02-10', '2025-02-15', '2025-02-20',
      '2025-03-05', '2025-03-10', '2025-03-15',
      '2025-04-01', '2025-04-10', '2025-04-20',
      '2025-05-05', '2025-05-15', '2025-05-25',
      '2025-06-01', '2025-06-10', '2025-06-20',
      '2025-07-05', '2025-07-15', '2025-07-25',
      '2025-08-01', '2025-08-10', '2025-08-15'
    ];

    const danosPrueba = [];

    for (const fecha of fechas) {
      // Crear entre 3 y 8 daños por fecha
      const numDanos = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < numDanos; i++) {
        const zona = zonas[Math.floor(Math.random() * zonas.length)];
        const operador = operadores[Math.floor(Math.random() * operadores.length)];
        
        danosPrueba.push({
          fecha: new Date(fecha),
          zonaId: zona.id,
          operadorId: operador.id,
          descripcion: `Daño de prueba ${i + 1} - ${fecha}`,
          tipo: ['Leve', 'Moderado', 'Grave'][Math.floor(Math.random() * 3)],
          estado: ['Pendiente', 'En Proceso', 'Completado'][Math.floor(Math.random() * 3)]
        });
      }
    }

    await Dano.bulkCreate(danosPrueba);
    console.log(`✅ Creados ${danosPrueba.length} daños de prueba`);

    // Crear datos de metros superficie
    const metrosPrueba = [];
    for (const fecha of fechas.slice(0, 10)) { // Solo primeras 10 fechas
      const zona = zonas[Math.floor(Math.random() * zonas.length)];
      metrosPrueba.push({
        fecha: new Date(fecha),
        zonaId: zona.id,
        metrosSuperficie: Math.floor(Math.random() * 1000) + 100
      });
    }

    await MetrosSuperficie.bulkCreate(metrosPrueba);
    console.log(`✅ Creados ${metrosPrueba.length} registros de metros superficie`);

    console.log('🎉 Datos de prueba creados exitosamente!');
    console.log('📊 Ahora puedes generar PDFs con datos reales');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

crearDatosPrueba();



