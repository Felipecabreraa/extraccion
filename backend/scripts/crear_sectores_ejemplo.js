const { Zona, Sector } = require('../src/models');
const sequelize = require('../src/config/database');

async function crearSectoresEjemplo() {
  try {
    console.log('🔍 Verificando zonas y sectores existentes...\n');

    // Verificar zonas existentes
    const zonas = await Zona.findAll({
      order: [['id', 'ASC']]
    });

    if (zonas.length === 0) {
      console.log('❌ No hay zonas. Primero ejecuta el script crear_zonas_predeterminadas.js');
      return;
    }

    console.log(`📍 Zonas encontradas: ${zonas.length}`);
    zonas.forEach(zona => {
      console.log(`   - ${zona.nombre} (${zona.tipo})`);
    });

    // Verificar sectores existentes
    const sectoresExistentes = await Sector.findAll();
    console.log(`\n🏢 Sectores existentes: ${sectoresExistentes.length}`);

    if (sectoresExistentes.length > 0) {
      console.log('ℹ️ Ya existen sectores. Mostrando sectores actuales:');
      sectoresExistentes.forEach(sector => {
        console.log(`   - ${sector.nombre} (Zona ${sector.zona_id}, ${sector.cantidad_pabellones} pabellones)`);
      });
    }

    // Crear sectores de ejemplo si no existen
    const sectoresEjemplo = [
      // Zona 1 - HEMBRA
      { nombre: 'ALMENDRO', zona_id: 1, cantidad_pabellones: 12, mt2: 4500 },
      { nombre: 'CEREZO', zona_id: 1, cantidad_pabellones: 8, mt2: 3200 },
      { nombre: 'MANZANO', zona_id: 1, cantidad_pabellones: 10, mt2: 3800 },
      
      // Zona 2 - MACHO
      { nombre: 'ROBLE', zona_id: 2, cantidad_pabellones: 15, mt2: 5500 },
      { nombre: 'PINO', zona_id: 2, cantidad_pabellones: 6, mt2: 2400 },
      { nombre: 'EUCALIPTO', zona_id: 2, cantidad_pabellones: 9, mt2: 3600 },
      
      // Zona 3 - HEMBRA
      { nombre: 'LAS CUCAS', zona_id: 3, cantidad_pabellones: 11, mt2: 4200 },
      { nombre: 'EL BOSQUE', zona_id: 3, cantidad_pabellones: 7, mt2: 2800 },
      { nombre: 'LA FLORIDA', zona_id: 3, cantidad_pabellones: 13, mt2: 4800 }
    ];

    // Verificar qué sectores faltan
    const sectoresFaltantes = [];
    for (const sectorEjemplo of sectoresEjemplo) {
      const existe = sectoresExistentes.some(s => 
        s.nombre.toLowerCase() === sectorEjemplo.nombre.toLowerCase() && 
        s.zona_id === sectorEjemplo.zona_id
      );
      
      if (!existe) {
        sectoresFaltantes.push(sectorEjemplo);
      }
    }

    if (sectoresFaltantes.length > 0) {
      console.log('\n🔄 Creando sectores faltantes...');
      const sectoresCreados = await Sector.bulkCreate(sectoresFaltantes);
      
      console.log('✅ Sectores creados:');
      sectoresCreados.forEach(sector => {
        console.log(`   - ${sector.nombre} (Zona ${sector.zona_id}, ${sector.cantidad_pabellones} pabellones, ${sector.mt2} m²)`);
      });
    } else {
      console.log('\n✅ Todos los sectores de ejemplo ya existen');
    }

    // Mostrar resumen final
    console.log('\n📊 Resumen final por zona:');
    for (const zona of zonas) {
      const sectoresZona = await Sector.findAll({ where: { zona_id: zona.id } });
      console.log(`\n📍 ${zona.nombre} (${zona.tipo}):`);
      sectoresZona.forEach(sector => {
        console.log(`   - ${sector.nombre}: ${sector.cantidad_pabellones} pabellones, ${sector.mt2} m²`);
      });
    }

    console.log('\n✅ Script completado exitosamente');
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Reiniciar el servidor backend: npm start');
    console.log('2. Ir al frontend y probar crear una planilla');
    console.log('3. Seleccionar zona → sector → ver cantidad de pabellones automática');
    console.log('4. Ingresar pabellones trabajados (máximo según el sector)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
crearSectoresEjemplo(); 