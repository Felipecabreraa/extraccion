const { Planilla, Usuario, Sector, Zona, PabellonMaquina, Barredor, MaquinaPlanilla, Dano } = require('../models');
const { Op } = require('sequelize');

exports.listar = async (req, res) => {
  try {
    console.log('Iniciando consulta de planillas...');
    
    // Obtener filtros de la query
    const { estado } = req.query;
    const where = {};
    
    // Filtrar por estado si se especifica
    if (estado && estado !== 'TODAS') {
      where.estado = estado;
    }
    
    // Filtrar por rol del usuario AUTENTICADO (no por query parameter)
    if (req.usuario.rol === 'supervisor') {
      // Supervisores ven solo sus planillas
      where.supervisor_id = req.usuario.id;
      console.log(`🔒 Filtrando planillas para supervisor ID: ${req.usuario.id}`);
    } else if (req.usuario.rol === 'administrador') {
      // Administradores ven todas las planillas
      console.log('🔓 Administrador viendo todas las planillas');
    } else {
      // Otros roles (operador) ven solo planillas activas o completadas
      where.estado = { [Op.in]: ['ACTIVA', 'COMPLETADA'] };
      console.log('👁️ Operador viendo solo planillas activas/completadas');
    }
    
    const planillas = await Planilla.findAll({
      where,
      order: [['id', 'DESC']]
    });
    
    // Obtener datos relacionados por separado para evitar problemas de asociaciones
    const resultado = await Promise.all(planillas.map(async (planilla) => {
      // Obtener supervisor
      const supervisor = await Usuario.findByPk(planilla.supervisor_id);
      
      // Obtener sector
      const sector = await Sector.findByPk(planilla.sector_id);
      
      // Obtener zona a través del sector
      const zona = sector ? await Zona.findByPk(sector.zona_id) : null;
      
      // Obtener validador
      const validador = planilla.validado_por ? await Usuario.findByPk(planilla.validado_por) : null;
      
      // Obtener pabellones limpiados
      const registros = await PabellonMaquina.findAll({ where: { planilla_id: planilla.id } });
      const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;
      
      return {
        ...planilla.toJSON(),
        supervisor_nombre: supervisor ? supervisor.nombre : '',
        supervisor_rol: supervisor ? supervisor.rol : '',
        sector_nombre: sector ? sector.nombre : '',
        zona_id: sector ? sector.zona_id : null,
        zona_nombre: zona ? zona.nombre : '',
        mt2_sector: sector ? sector.mt2 : '',
        cantidad_pabellones: sector ? sector.cantidad_pabellones : 0,
        pabellones_limpiados: pabellonesLimpiados,
        validador_nombre: validador ? validador.nombre : ''
      };
    }));
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en listar planillas:', error);
    res.status(500).json({ 
      message: 'Error al listar planillas',
      error: error.message,
      code: 'PLANILLAS_LIST_ERROR'
    });
  }
};

exports.obtener = async (req, res) => {
  try {
    const planilla = await Planilla.findByPk(req.params.id);
    if (!planilla) return res.status(404).json({ message: 'No encontrada' });
    
    // Obtener datos relacionados por separado
    const supervisor = await Usuario.findByPk(planilla.supervisor_id);
    const sector = await Sector.findByPk(planilla.sector_id);
    const zona = sector ? await Zona.findByPk(sector.zona_id) : null;
    const validador = planilla.validado_por ? await Usuario.findByPk(planilla.validado_por) : null;
    
    const resultado = {
      ...planilla.toJSON(),
      supervisor_nombre: supervisor ? supervisor.nombre : '',
      supervisor_rol: supervisor ? supervisor.rol : '',
      sector_nombre: sector ? sector.nombre : '',
      zona_id: sector ? sector.zona_id : null,
      zona_nombre: zona ? zona.nombre : '',
      validador_nombre: validador ? validador.nombre : ''
    };
    
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo planilla:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.crear = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear planilla:', req.body);
    
    // Validar campos requeridos
    if (!req.body.supervisor_id || !req.body.sector_id || !req.body.fecha_inicio) {
      console.log('❌ Campos faltantes:', {
        supervisor_id: req.body.supervisor_id,
        sector_id: req.body.sector_id,
        fecha_inicio: req.body.fecha_inicio
      });
      return res.status(400).json({
        message: 'Campos requeridos faltantes',
        required: ['supervisor_id', 'sector_id', 'fecha_inicio'],
        received: {
          supervisor_id: req.body.supervisor_id,
          sector_id: req.body.sector_id,
          fecha_inicio: req.body.fecha_inicio
        }
      });
    }

    // Obtener datos del sector para completar automáticamente mt2 y pabellones_total
    const sectorId = parseInt(req.body.sector_id) || null;
    const sector = sectorId ? await Sector.findByPk(sectorId) : null;
    
    // Filtrar y limpiar datos
    const planillaData = {
      supervisor_id: parseInt(req.body.supervisor_id) || null,
      sector_id: parseInt(req.body.sector_id) || null,
      mt2: req.body.mt2 ? parseFloat(req.body.mt2) : (sector ? sector.mt2 : null),
      pabellones_total: req.body.pabellones_total || req.body.pabellones || (sector ? sector.cantidad_pabellones : null),
      pabellones_limpiados: req.body.pabellones_limpiados || 0,
      fecha_inicio: req.body.fecha_inicio || new Date(),
      fecha_termino: req.body.fecha_termino || null,
      ticket: req.body.ticket || null,
      estado: 'PENDIENTE', // Estado inicial: pendiente de datos
      observacion: req.body.observacion || null
    };

    console.log('📋 Datos procesados para crear planilla:', planillaData);

    // Validar que los IDs sean válidos
    if (!planillaData.supervisor_id || !planillaData.sector_id) {
      console.log('❌ IDs inválidos:', {
        supervisor_id: planillaData.supervisor_id,
        sector_id: planillaData.sector_id
      });
      return res.status(400).json({
        message: 'IDs de supervisor y sector deben ser válidos',
        received: {
          supervisor_id: planillaData.supervisor_id,
          sector_id: planillaData.sector_id
        }
      });
    }

    console.log('✅ Creando planilla con datos válidos...');
    const nueva = await Planilla.create(planillaData);
    console.log('✅ Planilla creada exitosamente:', nueva.id);
    
    // Recrear la vista unificada para incluir la nueva planilla
    try {
      console.log('🔄 Actualizando vista unificada...');
      await sequelize.query(`
        CREATE OR REPLACE VIEW vw_ordenes_unificada_completa AS
        
        -- DATOS HISTÓRICOS DE 2025
        SELECT 
          id_orden_servicio as idOrdenServicio,
          fecha_inicio as fechaOrdenServicio,
          fecha_fin as fechaFinOrdenServicio,
          COALESCE(supervisor, 'Sin supervisor') as nombreSupervisor,
          COALESCE(nombreSector, sector, 'Sin sector') as nombreSector,
          COALESCE(pabellones_total, 0) as cantidadPabellones,
          COALESCE(pabellones_limpiados, 0) as cantLimpiar,
          COALESCE(mts2, 0) as mts2,
          COALESCE(maquina, 'Sin máquina') as nroMaquina,
          COALESCE(operador, 'Sin operador') as nombreOperador,
          odometro_inicio as odometroInicio,
          odometro_fin as odometroFin,
          litros_petroleo as litrosPetroleo,
          COALESCE(barredor, 'Sin barredor') as nombreBarredor,
          COALESCE(tipo_dano, 'Sin tipo') as nombreTipoDano,
          COALESCE(descripcion_dano, 'Sin descripción') as nombreDescripcionDano,
          COALESCE(cantidad_dano, 0) as cantidadDano,
          nroPabellon,
          pabellon_id,
          observacion,
          'historico_2025' as source,
          NOW() as fechaCreacion
        FROM migracion_ordenes_2025
        WHERE fecha_inicio IS NOT NULL
        
        UNION ALL
        
        -- DATOS ACTUALES DEL SISTEMA
        SELECT 
          p.id as idOrdenServicio,
          p.fecha_inicio as fechaOrdenServicio,
          p.fecha_termino as fechaFinOrdenServicio,
          COALESCE(u.nombre, 'Sin supervisor') as nombreSupervisor,
          COALESCE(s.nombre, 'Sin sector') as nombreSector,
          COALESCE(p.pabellones_total, 0) as cantidadPabellones,
          COALESCE(p.pabellones_limpiados, 0) as cantLimpiar,
          COALESCE(p.mt2, 0) as mts2,
          COALESCE(m.numero, 'Sin máquina') as nroMaquina,
          COALESCE(CONCAT(op.nombre, ' ', op.apellido), 'Sin operador') as nombreOperador,
          mp.odometro_inicio as odometroInicio,
          mp.odometro_fin as odometroFin,
          mp.petroleo as litrosPetroleo,
          'Sin barredor' as nombreBarredor,
          COALESCE(d.tipo, 'Sin tipo') as nombreTipoDano,
          COALESCE(d.descripcion, 'Sin descripción') as nombreDescripcionDano,
          COALESCE(d.cantidad, 0) as cantidadDano,
          NULL as nroPabellon,
          NULL as pabellon_id,
          COALESCE(d.observacion, p.observacion) as observacion,
          'sistema_actual' as source,
          NOW() as fechaCreacion
        FROM planilla p
        LEFT JOIN usuario u ON p.supervisor_id = u.id
        LEFT JOIN sector s ON p.sector_id = s.id
        LEFT JOIN maquina_planilla mp ON p.id = mp.planilla_id
        LEFT JOIN maquina m ON mp.maquina_id = m.id
        LEFT JOIN operador op ON mp.operador_id = op.id
        LEFT JOIN dano d ON p.id = d.planilla_id
        WHERE p.fecha_inicio IS NOT NULL
      `);
      console.log('✅ Vista unificada actualizada');
    } catch (error) {
      console.log('⚠️  Error actualizando vista unificada:', error.message);
    }
    
    res.status(201).json(nueva);
  } catch (error) {
    console.error('❌ Error creando planilla:', error);
    console.error('❌ Detalles del error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error al crear la planilla', 
      error: error.message,
      details: error.name === 'SequelizeValidationError' ? error.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      })) : null
    });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const planilla = await Planilla.findByPk(req.params.id);
    if (!planilla) return res.status(404).json({ message: 'Planilla no encontrada' });
    
    // Validar permisos según rol
    const userRol = req.usuario.rol;
    const currentEstado = planilla.estado;
    
    // Supervisores solo pueden editar planillas pendientes o activas
    if (userRol === 'supervisor' && !['PENDIENTE', 'ACTIVA'].includes(currentEstado)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para editar esta planilla en su estado actual' 
      });
    }
    
    // Filtrar solo los campos que existen en el modelo
    const planillaData = {
      supervisor_id: req.body.supervisor_id,
      sector_id: req.body.sector_id,
      mt2: req.body.mt2,
      pabellones_total: req.body.pabellones_total || req.body.pabellones,
      pabellones_limpiados: req.body.pabellones_limpiados,
      fecha_inicio: req.body.fecha_inicio,
      fecha_termino: req.body.fecha_termino,
      ticket: req.body.ticket,
      observacion: req.body.observacion
    };

    // Solo administradores pueden cambiar el estado
    if (userRol === 'administrador' && req.body.estado) {
      planillaData.estado = req.body.estado;
      
      // Si se está validando o cancelando, agregar información
      if (req.body.estado === 'COMPLETADA' || req.body.estado === 'CANCELADA') {
        planillaData.validado_por = req.usuario.id;
        planillaData.fecha_validacion = new Date();
        planillaData.observacion_validacion = req.body.observacion_validacion || null;
      }
    }

    await planilla.update(planillaData);
    res.json(planilla);
  } catch (error) {
    console.error('Error actualizando planilla:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la planilla', 
      error: error.message 
    });
  }
};

// Función para verificar si una planilla está completa (tiene todos los datos necesarios)
const verificarPlanillaCompleta = async (planillaId) => {
  try {
    // Verificar que tenga barredores
    const barredores = await Barredor.count({ where: { planilla_id: planillaId } });
    
    // Verificar que tenga máquinas
    const maquinas = await MaquinaPlanilla.count({ where: { planilla_id: planillaId } });
    
    // Verificar que tenga pabellones
    const pabellones = await PabellonMaquina.count({ where: { planilla_id: planillaId } });
    
    // Verificar que tenga daños (opcional)
    const danos = await Dano.count({ where: { planilla_id: planillaId } });
    
    // Considerar completa si tiene al menos barredores, máquinas y pabellones
    return barredores > 0 && maquinas > 0 && pabellones > 0;
  } catch (error) {
    console.error('Error verificando planilla completa:', error);
    return false;
  }
};

// Nuevo método para validar planillas (solo administradores)
exports.validar = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observacion_validacion } = req.body;
    
    // Verificar que el usuario sea administrador
    if (req.usuario.rol !== 'administrador') {
      return res.status(403).json({ 
        message: 'Solo los administradores pueden validar planillas' 
      });
    }
    
    const planilla = await Planilla.findByPk(id);
    if (!planilla) {
      return res.status(404).json({ message: 'Planilla no encontrada' });
    }
    
    // Validar que la planilla esté activa (lista para validar)
    if (planilla.estado !== 'ACTIVA') {
      return res.status(400).json({ 
        message: 'Solo se pueden validar planillas en estado ACTIVA' 
      });
    }
    
    // Validar el estado
    if (!['COMPLETADA', 'CANCELADA'].includes(estado)) {
      return res.status(400).json({ 
        message: 'Estado de validación inválido' 
      });
    }
    
    // Actualizar la planilla
    const updateData = {
      estado,
      validado_por: req.usuario.id,
      fecha_validacion: new Date(),
      observacion_validacion
    };
    
    await planilla.update(updateData);
    
    res.json({
      message: `Planilla ${estado === 'COMPLETADA' ? 'validada' : 'cancelada'} exitosamente`,
      planilla
    });
    
  } catch (error) {
    console.error('Error validando planilla:', error);
    res.status(500).json({ 
      message: 'Error al validar la planilla', 
      error: error.message 
    });
  }
};

// Nuevo método para marcar planilla como activa (cuando está completa de datos)
exports.marcarActiva = async (req, res) => {
  try {
    const { id } = req.params;
    
    const planilla = await Planilla.findByPk(id);
    if (!planilla) {
      return res.status(404).json({ message: 'Planilla no encontrada' });
    }
    
    // Solo se puede marcar como activa si está pendiente
    if (planilla.estado !== 'PENDIENTE') {
      return res.status(400).json({ 
        message: 'Solo se pueden marcar como activas las planillas pendientes' 
      });
    }
    
    // Verificar que la planilla esté completa
    const estaCompleta = await verificarPlanillaCompleta(id);
    if (!estaCompleta) {
      return res.status(400).json({ 
        message: 'La planilla debe tener barredores, máquinas y pabellones para ser marcada como activa' 
      });
    }
    
    // Marcar como activa
    await planilla.update({ estado: 'ACTIVA' });
    
    res.json({
      message: 'Planilla marcada como activa exitosamente',
      planilla
    });
    
  } catch (error) {
    console.error('Error marcando planilla como activa:', error);
    res.status(500).json({ 
      message: 'Error al marcar la planilla como activa', 
      error: error.message 
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const planillaId = req.params.id;
    
    // Verificar que la planilla existe
    const planilla = await Planilla.findByPk(planillaId);
    if (!planilla) {
      return res.status(404).json({ message: 'Planilla no encontrada' });
    }

    // Solo se pueden eliminar planillas pendientes
    if (planilla.estado !== 'PENDIENTE') {
      return res.status(400).json({ 
        message: 'Solo se pueden eliminar planillas en estado PENDIENTE' 
      });
    }

    console.log(`🗑️ Iniciando eliminación en cascada para planilla ID: ${planillaId}`);

    // Iniciar transacción para asegurar consistencia
    const transaction = await require('../config/database').transaction();

    try {
      // 1. Eliminar barredores asociados
      const barredoresEliminados = await Barredor.destroy({
        where: { planilla_id: planillaId },
        transaction
      });
      console.log(`   📋 Barredores eliminados: ${barredoresEliminados}`);

      // 2. Eliminar máquinas asociadas
      const maquinasEliminadas = await MaquinaPlanilla.destroy({
        where: { planilla_id: planillaId },
        transaction
      });
      console.log(`   🚜 Máquinas eliminadas: ${maquinasEliminadas}`);

      // 3. Eliminar pabellones asociados (pabellon_maquina)
      const pabellonesEliminados = await PabellonMaquina.destroy({
        where: { planilla_id: planillaId },
        transaction
      });
      console.log(`   🏢 Pabellones eliminados: ${pabellonesEliminados}`);

      // 4. Eliminar daños asociados
      const danosEliminados = await Dano.destroy({
        where: { planilla_id: planillaId },
        transaction
      });
      console.log(`   ⚠️ Daños eliminados: ${danosEliminados}`);

      // 5. Finalmente, eliminar la planilla principal
      await planilla.destroy({ transaction });

      // Confirmar transacción
      await transaction.commit();

      console.log(`✅ Planilla ID ${planillaId} eliminada exitosamente con todos sus datos relacionados`);

      res.json({ 
        message: 'Planilla eliminada exitosamente con todos sus datos relacionados',
        detalles: {
          planilla_id: planillaId,
          barredores_eliminados: barredoresEliminados,
          maquinas_eliminadas: maquinasEliminadas,
          pabellones_eliminados: pabellonesEliminados,
          danos_eliminados: danosEliminados
        }
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error eliminando planilla:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la planilla y sus datos relacionados', 
      error: error.message 
    });
  }
};

// Método para actualizar automáticamente pabellones limpiados y mt2 de una planilla específica
exports.actualizarValores = async (req, res) => {
  try {
    const { id } = req.params;
    
    const planilla = await Planilla.findByPk(id);
    if (!planilla) {
      return res.status(404).json({ message: 'Planilla no encontrada' });
    }
    
    // Obtener el sector
    const sector = await Sector.findByPk(planilla.sector_id);
    if (!sector) {
      return res.status(400).json({ message: 'Sector no encontrado para esta planilla' });
    }
    
    // Contar pabellones únicos limpiados
    const registros = await PabellonMaquina.findAll({ 
      where: { planilla_id: planilla.id },
      attributes: ['pabellon_id']
    });
    const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;
    
    // Actualizar la planilla
    const datosActualizacion = {
      mt2: sector.mt2,
      pabellones_total: sector.cantidad_pabellones,
      pabellones_limpiados: pabellonesLimpiados
    };
    
    await planilla.update(datosActualizacion);
    
    console.log(`✅ Planilla ${id} actualizada: ${pabellonesLimpiados} pabellones limpiados, ${sector.mt2} m²`);
    
    res.json({
      message: 'Planilla actualizada exitosamente',
      planilla: {
        ...planilla.toJSON(),
        mt2: sector.mt2,
        pabellones_total: sector.cantidad_pabellones,
        pabellones_limpiados: pabellonesLimpiados
      }
    });
    
  } catch (error) {
    console.error('Error actualizando valores de planilla:', error);
    res.status(500).json({ 
      message: 'Error al actualizar los valores de la planilla', 
      error: error.message 
    });
  }
};

// Método para forzar la actualización de campos calculados de una planilla
exports.actualizarCamposCalculados = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Forzando actualización de campos calculados para planilla ID: ${id}`);
    
    const planilla = await Planilla.findByPk(id);
    if (!planilla) {
      return res.status(404).json({ message: 'Planilla no encontrada' });
    }

    // Obtener el sector para los metros cuadrados
    const sector = await Sector.findByPk(planilla.sector_id);
    if (!sector) {
      return res.status(400).json({ message: 'Sector no encontrado' });
    }
    
    // Contar pabellones únicos limpiados
    const registros = await PabellonMaquina.findAll({ 
      where: { planilla_id: id },
      attributes: ['pabellon_id']
    });
    const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;

    console.log(`📊 Datos calculados: pabellones_limpiados=${pabellonesLimpiados}, mt2=${sector.mt2}`);

    // Actualizar la planilla
    await planilla.update({
      pabellones_limpiados: pabellonesLimpiados,
      mt2: sector.mt2
    });

    console.log(`✅ Planilla ${id} actualizada exitosamente`);

    res.json({
      message: 'Campos calculados actualizados exitosamente',
      planilla_id: id,
      pabellones_limpiados,
      mt2: sector.mt2,
      planilla: planilla
    });
  } catch (error) {
    console.error('❌ Error actualizando campos calculados:', error);
    res.status(500).json({ 
      message: 'Error al actualizar campos calculados', 
      error: error.message 
    });
  }
};