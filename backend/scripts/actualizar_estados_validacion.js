const { Planilla, Usuario } = require('../src/models');
const sequelize = require('../src/config/database');
const { Op } = require('sequelize');

async function actualizarEstadosValidacion() {
  try {
    console.log('🔄 Iniciando actualización de estados para sistema de validación...');

    // 1. Actualizar planillas existentes
    console.log('\n📋 Actualizando estados de planillas existentes...');
    
    // Planillas pendientes -> pendientes de validación
    const planillasPendientes = await Planilla.update(
      { estado: 'PENDIENTE_VALIDACION' },
      { 
        where: { 
          estado: 'PENDIENTE',
          supervisor_id: { [Op.ne]: null } // Solo las que tienen supervisor
        }
      }
    );
    console.log(`   ✅ ${planillasPendientes[0]} planillas pendientes actualizadas a PENDIENTE_VALIDACION`);

    // Planillas activas -> validadas (asumiendo que ya fueron validadas)
    const planillasActivas = await Planilla.update(
      { 
        estado: 'VALIDADA',
        validado_por: 1, // Asumiendo que el admin ID 1 las validó
        fecha_validacion: new Date()
      },
      { where: { estado: 'ACTIVA' } }
    );
    console.log(`   ✅ ${planillasActivas[0]} planillas activas actualizadas a VALIDADA`);

    // 2. Verificar usuarios administradores
    console.log('\n👥 Verificando usuarios administradores...');
    const administradores = await Usuario.findAll({
      where: { rol: 'administrador' },
      attributes: ['id', 'nombre', 'email']
    });

    if (administradores.length === 0) {
      console.log('   ⚠️  No se encontraron usuarios administradores');
      console.log('   💡 Creando usuario administrador por defecto...');
      
      await Usuario.create({
        nombre: 'Administrador Sistema',
        email: 'admin@sistema.com',
        password: 'admin123', // Cambiar en producción
        rol: 'administrador'
      });
      console.log('   ✅ Usuario administrador creado');
    } else {
      console.log(`   ✅ Se encontraron ${administradores.length} administradores:`);
      administradores.forEach(admin => {
        console.log(`      - ID: ${admin.id}, Nombre: ${admin.nombre}, Email: ${admin.email}`);
      });
    }

    // 3. Verificar usuarios supervisores
    console.log('\n👷 Verificando usuarios supervisores...');
    const supervisores = await Usuario.findAll({
      where: { rol: 'supervisor' },
      attributes: ['id', 'nombre', 'email']
    });

    if (supervisores.length === 0) {
      console.log('   ⚠️  No se encontraron usuarios supervisores');
    } else {
      console.log(`   ✅ Se encontraron ${supervisores.length} supervisores:`);
      supervisores.forEach(sup => {
        console.log(`      - ID: ${sup.id}, Nombre: ${sup.nombre}, Email: ${sup.email}`);
      });
    }

    // 4. Estadísticas finales
    console.log('\n📊 Estadísticas del sistema de validación:');
    
    const estadisticas = await Planilla.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['estado']
    });

    estadisticas.forEach(stat => {
      console.log(`   - ${stat.estado}: ${stat.dataValues.cantidad} planillas`);
    });

    // 5. Verificar planillas sin supervisor
    const planillasSinSupervisor = await Planilla.count({
      where: { supervisor_id: null }
    });

    if (planillasSinSupervisor > 0) {
      console.log(`\n⚠️  ADVERTENCIA: ${planillasSinSupervisor} planillas sin supervisor asignado`);
      console.log('   💡 Estas planillas no pueden ser validadas hasta que se les asigne un supervisor');
    }

    console.log('\n✅ Actualización de estados completada exitosamente');
    console.log('\n📋 Resumen del flujo de validación:');
    console.log('   1. Supervisor crea planilla → PENDIENTE_VALIDACION');
    console.log('   2. Administrador revisa y valida → VALIDADA o RECHAZADA');
    console.log('   3. Si es rechazada → vuelve a PENDIENTE_VALIDACION');
    console.log('   4. Si es validada → puede pasar a ACTIVA o COMPLETADA');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  actualizarEstadosValidacion()
    .then(() => {
      console.log('\n🎉 Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = actualizarEstadosValidacion; 