const { Planilla, Sector, PabellonMaquina } = require('../src/models');
const sequelize = require('../src/config/database');

async function actualizarCamposPlanillasExistentes() {
  try {
    console.log('🔄 Iniciando actualización de campos de planillas existentes...\n');
    
    // Obtener todas las planillas
    const planillas = await Planilla.findAll();
    console.log(`📋 Encontradas ${planillas.length} planillas para actualizar\n`);
    
    if (planillas.length === 0) {
      console.log('✅ No hay planillas para actualizar');
      return;
    }
    
    let actualizadas = 0;
    let errores = 0;
    
    for (const planilla of planillas) {
      try {
        console.log(`🔄 Procesando planilla ID: ${planilla.id}`);
        
        // Obtener el sector para los metros cuadrados
        const sector = await Sector.findByPk(planilla.sector_id);
        if (!sector) {
          console.log(`   ⚠️ Sector ${planilla.sector_id} no encontrado para planilla ${planilla.id}`);
          errores++;
          continue;
        }
        
        // Contar pabellones únicos limpiados
        const registros = await PabellonMaquina.findAll({ 
          where: { planilla_id: planilla.id },
          attributes: ['pabellon_id']
        });
        const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;
        
        console.log(`   📊 Datos calculados:`);
        console.log(`      - Pabellones limpiados: ${pabellonesLimpiados}`);
        console.log(`      - Metros cuadrados: ${sector.mt2}`);
        
        // Verificar si los valores son diferentes
        const valoresActuales = {
          pabellones_limpiados: planilla.pabellones_limpiados,
          mt2: planilla.mt2
        };
        
        const valoresNuevos = {
          pabellones_limpiados: pabellonesLimpiados,
          mt2: sector.mt2
        };
        
        if (valoresActuales.pabellones_limpiados === valoresNuevos.pabellones_limpiados && 
            valoresActuales.mt2 === valoresNuevos.mt2) {
          console.log(`   ✅ Planilla ${planilla.id} ya tiene los valores correctos`);
        } else {
          // Actualizar la planilla
          await planilla.update(valoresNuevos);
          console.log(`   ✅ Planilla ${planilla.id} actualizada exitosamente`);
          actualizadas++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error actualizando planilla ${planilla.id}:`, error.message);
        errores++;
      }
    }
    
    console.log('\n=== RESUMEN DE ACTUALIZACIÓN ===');
    console.log(`📋 Total de planillas procesadas: ${planillas.length}`);
    console.log(`✅ Planillas actualizadas: ${actualizadas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`✅ Planillas sin cambios: ${planillas.length - actualizadas - errores}`);
    
    if (errores === 0) {
      console.log('\n🎉 ¡Todas las planillas han sido procesadas exitosamente!');
    } else {
      console.log(`\n⚠️ Se encontraron ${errores} errores durante la actualización`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
actualizarCamposPlanillasExistentes(); 