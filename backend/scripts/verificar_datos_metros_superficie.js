const sequelize = require('../src/config/database');
const { MetrosSuperficie, Zona, Sector } = require('../src/models');

async function verificarDatosMetrosSuperficie() {
  try {
    console.log('🔍 Verificando datos de metros superficie...\n');

    // 1. Verificar si la tabla existe y tiene datos
    console.log('1. Verificando tabla metros_superficie...');
    
    try {
      const [datos] = await sequelize.query('SELECT COUNT(*) as total FROM metros_superficie');
      console.log(`   📊 Total registros: ${datos[0].total}`);
      
      if (datos[0].total === 0) {
        console.log('   ⚠️  No hay datos en la tabla');
      } else {
        console.log('   ✅ Hay datos en la tabla');
      }
    } catch (error) {
      console.log('   ❌ Error verificando tabla:', error.message);
    }

    // 2. Verificar zonas disponibles
    console.log('\n2. Verificando zonas disponibles...');
    try {
      const zonas = await Zona.findAll({
        attributes: ['id', 'nombre', 'tipo'],
        limit: 5
      });
      console.log(`   📊 Zonas encontradas: ${zonas.length}`);
      zonas.forEach(zona => {
        console.log(`      - ${zona.nombre} (${zona.tipo})`);
      });
    } catch (error) {
      console.log('   ❌ Error verificando zonas:', error.message);
    }

    // 3. Verificar sectores disponibles
    console.log('\n3. Verificando sectores disponibles...');
    try {
      const sectores = await Sector.findAll({
        attributes: ['id', 'nombre', 'mt2'],
        limit: 5
      });
      console.log(`   📊 Sectores encontrados: ${sectores.length}`);
      sectores.forEach(sector => {
        console.log(`      - ${sector.nombre} (${sector.mt2} m²)`);
      });
    } catch (error) {
      console.log('   ❌ Error verificando sectores:', error.message);
    }

    // 4. Crear datos de prueba si no existen
    console.log('\n4. Creando datos de prueba...');
    
    try {
      // Obtener primera zona y sector
      const zona = await Zona.findOne();
      const sector = await Sector.findOne();
      
      if (!zona || !sector) {
        console.log('   ❌ No hay zonas o sectores disponibles para crear datos de prueba');
        return;
      }

      // Verificar si ya hay datos de prueba
      const datosExistentes = await MetrosSuperficie.count();
      
      if (datosExistentes === 0) {
        console.log('   📝 Creando datos de prueba...');
        
        const datosPrueba = [
          {
            fecha: new Date(2025, 0, 15), // 15 de enero 2025
            zona_id: zona.id,
            sector_id: sector.id,
            pabellones_limpiados: 10,
            metros_cuadrados: 1500.50,
            tipo_zona: 'HEMBRA',
            observacion: 'Datos de prueba - Hembra'
          },
          {
            fecha: new Date(2025, 0, 20), // 20 de enero 2025
            zona_id: zona.id,
            sector_id: sector.id,
            pabellones_limpiados: 8,
            metros_cuadrados: 1200.75,
            tipo_zona: 'MACHO',
            observacion: 'Datos de prueba - Macho'
          },
          {
            fecha: new Date(2025, 1, 10), // 10 de febrero 2025
            zona_id: zona.id,
            sector_id: sector.id,
            pabellones_limpiados: 12,
            metros_cuadrados: 1800.25,
            tipo_zona: 'HEMBRA',
            observacion: 'Datos de prueba - Febrero'
          }
        ];

        await MetrosSuperficie.bulkCreate(datosPrueba);
        console.log('   ✅ Datos de prueba creados exitosamente');
      } else {
        console.log('   ✅ Ya existen datos en la tabla');
      }

      // 5. Verificar datos después de la creación
      console.log('\n5. Verificando datos finales...');
      const [datosFinales] = await sequelize.query('SELECT COUNT(*) as total FROM metros_superficie');
      console.log(`   📊 Total registros: ${datosFinales[0].total}`);

      // Mostrar algunos registros
      const registros = await MetrosSuperficie.findAll({
        include: [
          { model: Zona, as: 'Zona', attributes: ['nombre'] },
          { model: Sector, as: 'Sector', attributes: ['nombre'] }
        ],
        limit: 3,
        order: [['fecha', 'DESC']]
      });

      console.log('   📋 Últimos registros:');
      registros.forEach(registro => {
        console.log(`      - ${registro.fecha.toISOString().split('T')[0]}: ${registro.pabellones_limpiados} pabellones, ${registro.metros_cuadrados} m² (${registro.tipo_zona})`);
      });

    } catch (error) {
      console.log('   ❌ Error creando datos de prueba:', error.message);
    }

    console.log('\n✅ Verificación completada!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarDatosMetrosSuperficie(); 