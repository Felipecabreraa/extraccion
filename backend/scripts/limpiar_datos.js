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
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
limpiarDatos(); 