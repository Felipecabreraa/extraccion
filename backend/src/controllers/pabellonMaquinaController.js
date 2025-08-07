const { PabellonMaquina, Planilla, Sector } = require('../models');

// Función para actualizar pabellones limpiados y mt2 en la planilla
const actualizarPlanilla = async (planillaId) => {
  try {
    console.log(`🔄 Actualizando planilla ID: ${planillaId}`);
    
    // Obtener la planilla
    const planilla = await Planilla.findByPk(planillaId);
    if (!planilla) {
      console.log(`❌ Planilla ${planillaId} no encontrada`);
      return;
    }

    // Obtener el sector para los metros cuadrados
    const sector = await Sector.findByPk(planilla.sector_id);
    if (!sector) {
      console.log(`❌ Sector ${planilla.sector_id} no encontrado para planilla ${planillaId}`);
      return;
    }
    
    // Contar pabellones únicos limpiados
    const registros = await PabellonMaquina.findAll({ 
      where: { planilla_id: planillaId },
      attributes: ['pabellon_id']
    });
    const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;

    console.log(`📊 Datos a actualizar: pabellones_limpiados=${pabellonesLimpiados}, mt2=${sector.mt2}`);

    // Actualizar la planilla con los valores calculados
    const datosActualizados = {
      pabellones_limpiados: pabellonesLimpiados,
      mt2: sector.mt2
    };

    await planilla.update(datosActualizados);

    console.log(`✅ Planilla ${planillaId} actualizada exitosamente:`);
    console.log(`   - Pabellones limpiados: ${pabellonesLimpiados}`);
    console.log(`   - Metros cuadrados: ${sector.mt2}`);
    
    return { pabellones_limpiados: pabellonesLimpiados, mt2: sector.mt2 };
  } catch (error) {
    console.error(`❌ Error actualizando planilla ${planillaId}:`, error);
    throw error;
  }
};

exports.listar = async (req, res) => {
  try {
    const { planilla_id } = req.query;
    const where = {};
    if (planilla_id) where.planilla_id = planilla_id;
    
    const registros = await PabellonMaquina.findAll({ where });
    
    // Si se está consultando por planilla_id, actualizar automáticamente los campos
    if (planilla_id) {
      try {
        await actualizarPlanilla(planilla_id);
        console.log(`🔄 Campos de planilla ${planilla_id} actualizados automáticamente`);
      } catch (error) {
        console.error(`⚠️ Error actualizando planilla ${planilla_id} automáticamente:`, error);
      }
    }
    
    res.json(registros);
  } catch (error) {
    console.error('Error listando pabellon_maquina:', error);
    res.status(500).json({ 
      message: 'Error al listar registros', 
      error: error.message 
    });
  }
};

exports.crear = async (req, res) => {
  try {
    console.log('📝 Creando registro pabellon_maquina:', req.body);
    
    const nuevo = await PabellonMaquina.create(req.body);
    console.log('✅ Registro creado exitosamente:', nuevo.id);
    
    // Actualizar pabellones limpiados y mt2 en la planilla
    if (req.body.planilla_id) {
      try {
        const resultado = await actualizarPlanilla(req.body.planilla_id);
        console.log('✅ Planilla actualizada después de crear registro:', resultado);
      } catch (error) {
        console.error('⚠️ Error actualizando planilla después de crear:', error);
        // No fallar la operación principal por un error en la actualización
      }
    }
    
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error creando pabellon_maquina:', error);
    res.status(500).json({ 
      message: 'Error al crear el registro', 
      error: error.message 
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    console.log(`🗑️ Eliminando registro pabellon_maquina ID: ${req.params.id}`);
    
    const registro = await PabellonMaquina.findByPk(req.params.id);
    if (!registro) {
      console.log('❌ Registro no encontrado');
      return res.status(404).json({ message: 'No encontrado' });
    }
    
    const planillaId = registro.planilla_id;
    console.log(`📋 Planilla asociada: ${planillaId}`);
    
    await registro.destroy();
    console.log('✅ Registro eliminado exitosamente');
    
    // Actualizar pabellones limpiados y mt2 en la planilla
    if (planillaId) {
      try {
        const resultado = await actualizarPlanilla(planillaId);
        console.log('✅ Planilla actualizada después de eliminar registro:', resultado);
      } catch (error) {
        console.error('⚠️ Error actualizando planilla después de eliminar:', error);
        // No fallar la operación principal por un error en la actualización
      }
    }
    
    res.json({ message: 'Eliminado' });
  } catch (error) {
    console.error('❌ Error eliminando pabellon_maquina:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el registro', 
      error: error.message 
    });
  }
}; 