const { Zona } = require('../src/models');

async function updateZonasTipo() {
  try {
    console.log('🔄 Actualizando tipos de zonas...');

    // Primero, asegurar que las zonas tengan los nombres correctos
    const zonasExistentes = await Zona.findAll({
      order: [['id', 'ASC']]
    });

    console.log('📋 Zonas existentes:');
    zonasExistentes.forEach(zona => {
      console.log(`   ID: ${zona.id}, Nombre actual: ${zona.nombre}`);
    });

    // Actualizar nombres si es necesario
    for (let i = 1; i <= Math.max(3, zonasExistentes.length); i++) {
      const zona = await Zona.findByPk(i);
      if (zona && zona.nombre !== `Zona ${i}`) {
        await zona.update({ nombre: `Zona ${i}` });
        console.log(`✅ Zona ${i} renombrada a "Zona ${i}"`);
      }
    }

    // Aplicar regla de negocio específica para las 3 zonas actuales
    const zonasParaActualizar = await Zona.findAll({
      order: [['id', 'ASC']]
    });

    for (const zona of zonasParaActualizar) {
      let tipoCorrecto;
      if (zona.id === 1 || zona.id === 3) {
        tipoCorrecto = 'HEMBRA';
      } else if (zona.id === 2) {
        tipoCorrecto = 'MACHO';
      } else {
        // Para zonas adicionales futuras: pares = HEMBRA, impares = MACHO
        tipoCorrecto = zona.id % 2 === 0 ? 'HEMBRA' : 'MACHO';
      }

      if (zona.tipo !== tipoCorrecto) {
        await zona.update({ tipo: tipoCorrecto });
        console.log(`✅ Zona ${zona.id} (${zona.nombre}) actualizada como ${tipoCorrecto}`);
      }
    }

    console.log('\n📋 Distribución actual de zonas:');
    console.log('   Zona 1 - HEMBRA');
    console.log('   Zona 2 - MACHO');
    console.log('   Zona 3 - HEMBRA');

    // Verificar resultados finales
    const zonasFinales = await Zona.findAll({
      order: [['id', 'ASC']]
    });

    console.log('\n📊 Estado final de las zonas:');
    zonasFinales.forEach(zona => {
      console.log(`   ${zona.nombre} - ${zona.tipo}`);
    });

    console.log('\n✅ Actualización completada exitosamente');
  } catch (error) {
    console.error('❌ Error actualizando zonas:', error);
  } finally {
    process.exit(0);
  }
}

updateZonasTipo(); 