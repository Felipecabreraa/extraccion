const { Planilla, Sector, PabellonMaquina } = require('../src/models');
const sequelize = require('../src/config/database');

async function actualizarPlanillasExistentes() {
  try {
    console.log('🔄 Iniciando actualización de planillas existentes...');
    
    // Obtener todas las planillas
    const planillas = await Planilla.findAll();
    console.log(`📋 Total de planillas a procesar: ${planillas.length}`);
    
    let actualizadas = 0;
    let errores = 0;
    
    for (const planilla of planillas) {
      try {
        console.log(`\n📝 Procesando planilla ID: ${planilla.id}`);
        
        // Obtener el sector
        const sector = await Sector.findByPk(planilla.sector_id);
        if (!sector) {
          console.log(`   ⚠️ Sector no encontrado para planilla ${planilla.id}`);
          continue;
        }
        
        // Contar pabellones únicos limpiados
        const registros = await PabellonMaquina.findAll({ 
          where: { planilla_id: planilla.id },
          attributes: ['pabellon_id']
        });
        const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;
        
        // Preparar datos de actualización
        const datosActualizacion = {
          mt2: sector.mt2,
          pabellones_total: sector.cantidad_pabellones,
          pabellones_limpiados: pabellonesLimpiados
        };
        
        // Verificar si hay cambios
        const hayCambios = 
          planilla.mt2 !== sector.mt2 ||
          planilla.pabellones_total !== sector.cantidad_pabellones ||
          planilla.pabellones_limpiados !== pabellonesLimpiados;
        
        if (hayCambios) {
          await planilla.update(datosActualizacion);
          console.log(`   ✅ Planilla ${planilla.id} actualizada:`);
          console.log(`      - MT2: ${planilla.mt2} → ${sector.mt2}`);
          console.log(`      - Pabellones total: ${planilla.pabellones_total} → ${sector.cantidad_pabellones}`);
          console.log(`      - Pabellones limpiados: ${planilla.pabellones_limpiados} → ${pabellonesLimpiados}`);
          actualizadas++;
        } else {
          console.log(`   ℹ️ Planilla ${planilla.id} ya está actualizada`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error procesando planilla ${planilla.id}:`, error.message);
        errores++;
      }
    }
    
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN:');
    console.log(`✅ Planillas actualizadas: ${actualizadas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📋 Total procesadas: ${planillas.length}`);
    
    if (errores === 0) {
      console.log('\n🎉 ¡Actualización completada exitosamente!');
    } else {
      console.log(`\n⚠️ Completado con ${errores} errores`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  actualizarPlanillasExistentes();
}

module.exports = actualizarPlanillasExistentes; 