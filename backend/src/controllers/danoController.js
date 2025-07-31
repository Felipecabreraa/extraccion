const { Dano } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Variable para invalidar cache del dashboard
let dashboardCacheInvalid = false;

// Función para invalidar cache
const invalidateDashboardCache = () => {
  dashboardCacheInvalid = true;
  console.log('Cache del dashboard invalidado debido a cambios en daños');
};

exports.listar = async (req, res) => {
  const { tipo, planilla_id, pabellon_id, maquina_id, limit, offset } = req.query;
  const where = {};
  if (tipo) where.tipo = tipo;
  if (planilla_id) where.planilla_id = planilla_id;
  if (pabellon_id) where.pabellon_id = pabellon_id;
  if (maquina_id) where.maquina_id = maquina_id;
  const danos = await Dano.findAll({
    where,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [['id', 'DESC']]
  });
  res.json(danos);
};

exports.obtener = async (req, res) => {
  const dano = await Dano.findByPk(req.params.id);
  if (!dano) return res.status(404).json({ message: 'No encontrado' });
  res.json(dano);
};

exports.crear = async (req, res) => {
  const nuevo = await Dano.create(req.body);
  // Invalidar cache cuando se crea un nuevo daño
  invalidateDashboardCache();
  res.status(201).json(nuevo);
};

exports.actualizar = async (req, res) => {
  const dano = await Dano.findByPk(req.params.id);
  if (!dano) return res.status(404).json({ message: 'No encontrado' });
  await dano.update(req.body);
  // Invalidar cache cuando se actualiza un daño
  invalidateDashboardCache();
  res.json(dano);
};

exports.eliminar = async (req, res) => {
  const dano = await Dano.findByPk(req.params.id);
  if (!dano) return res.status(404).json({ message: 'No encontrado' });
  await dano.destroy();
  // Invalidar cache cuando se elimina un daño
  invalidateDashboardCache();
  res.json({ message: 'Eliminado' });
};

// Exportar función para verificar si el cache está invalidado
exports.isDashboardCacheInvalid = () => dashboardCacheInvalid;

// Exportar función para resetear el estado del cache
exports.resetDashboardCache = () => {
  dashboardCacheInvalid = false;
};

// Método para obtener estadísticas de daños desde la vista unificada completa
exports.getDanoStatsVistaUnificada = async (req, res) => {
  try {
    console.log('🔍 Iniciando getDanoStats con req:', req ? 'válido' : 'undefined');
    console.log('🔍 req.query:', req?.query);
    
    // Extraer parámetros de manera segura
    const query = req?.query || {};
    const origen = query.origen;
    const year = query.year;
    const month = query.month;
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : null;
    
    console.log('📊 Parámetros extraídos:', { origen, year, currentYear, currentMonth });
    
    const queryTimeout = 8000;
    
    // Construir filtros para la vista unificada completa
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ? AND cantidadDano > 0';
    let params = [currentYear];
    
    if (origen && origen !== 'todos') {
      whereClause += ' AND source = ?';
      params.push(origen);
    }
    
    if (currentMonth) {
      whereClause += ' AND MONTH(fechaOrdenServicio) = ?';
      params.push(currentMonth);
    }
    
    // 1. Daños por tipo desde vista unificada completa
    const [danosPorTipoResult] = await sequelize.query(`
      SELECT 
        COALESCE(nombreTipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreTipoDano
      ORDER BY total_danos DESC
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 2. Daños por sector
    const [danosPorSectorResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSector
      ORDER BY total_danos DESC
      LIMIT 10
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 3. Daños por supervisor
    const [danosPorSupervisorResult] = await sequelize.query(`
      SELECT 
        nombreSupervisor as supervisor_nombre,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSupervisor
      ORDER BY total_danos DESC
      LIMIT 10
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 4. Evolución mensual de daños
    const [evolucionDanosResult] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as periodo,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND cantidadDano > 0
        ${origen && origen !== 'todos' ? 'AND source = ?' : ''}
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m')
      ORDER BY periodo ASC
    `, { 
      replacements: origen && origen !== 'todos' ? [origen] : [],
      timeout: queryTimeout 
    });
    
    // 5. Resumen general de daños
    const [resumenDanosResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_ordenes_con_danos,
        COALESCE(SUM(cantidadDano), 0) as total_danos,
        COUNT(DISTINCT nombreTipoDano) as tipos_danos_diferentes,
        COUNT(DISTINCT nombreSector) as sectores_con_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });

    // Formatear respuesta
    const response = {
      resumen: {
        total_ordenes_con_danos: parseInt(resumenDanosResult[0].total_ordenes_con_danos),
        total_danos: parseInt(resumenDanosResult[0].total_danos),
        tipos_danos_diferentes: parseInt(resumenDanosResult[0].tipos_danos_diferentes),
        sectores_con_danos: parseInt(resumenDanosResult[0].sectores_con_danos)
      },
      danosPorTipo: danosPorTipoResult.map(item => ({
        tipo: item.tipo_dano || 'Sin tipo',
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      danosPorSector: danosPorSectorResult.map(item => ({
        sector: item.sector_nombre || 'Sin sector',
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      danosPorSupervisor: danosPorSupervisorResult.map(item => ({
        supervisor: item.supervisor_nombre || 'Sin supervisor',
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      evolucion: evolucionDanosResult.map(item => ({
        periodo: item.periodo,
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      metadata: {
        origen: origen || 'todos',
        year: currentYear,
        month: currentMonth,
        timestamp: new Date().toISOString(),
        fuente: 'vw_ordenes_unificada_completa'
      }
    };

    console.log('Estadísticas de daños obtenidas desde vista unificada completa vw_ordenes_unificada_completa');
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de daños:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    console.error('📊 Parámetros de consulta:', { origen, year: currentYear, month: currentMonth });
    
    const fallbackResponse = {
      resumen: {
        total_ordenes_con_danos: 0,
        total_danos: 0,
        tipos_danos_diferentes: 0,
        sectores_con_danos: 0
      },
      danosPorTipo: [],
      danosPorSector: [],
      danosPorSupervisor: [],
      evolucion: [],
      metadata: {
        origen: origen || 'error',
        year: currentYear,
        month: currentMonth,
        timestamp: new Date().toISOString(),
        fuente: 'fallback',
        error: error.message
      }
    };
    
    res.json(fallbackResponse);
  }
}; 

// NUEVO MÉTODO LIMPIO PARA ESTADÍSTICAS DE DAÑOS
exports.getDanoStatsNuevo = async (req, res) => {
  try {
    console.log('🔍 Iniciando getDanoStatsNuevo');
    console.log('🔍 req:', req ? 'válido' : 'undefined');
    console.log('🔍 req.query:', req?.query);
    
    // Extraer parámetros de manera segura
    const query = req?.query || {};
    const origen = query.origen;
    const year = query.year;
    const month = query.month;
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : null;
    
    console.log('📊 Parámetros extraídos:', { origen, year, currentYear, currentMonth });
    
    const queryTimeout = 8000;
    
    // Construir filtros para la vista unificada completa
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ? AND cantidadDano > 0';
    let params = [currentYear];
    
    if (origen && origen !== 'todos') {
      whereClause += ' AND source = ?';
      params.push(origen);
    }
    
    if (currentMonth) {
      whereClause += ' AND MONTH(fechaOrdenServicio) = ?';
      params.push(currentMonth);
    }

    console.log('🔍 Where clause:', whereClause);
    console.log('🔍 Params:', params);

    // 1. Daños por tipo desde vista unificada completa
    console.log('1. Ejecutando consulta de daños por tipo...');
    const [danosPorTipoResult] = await sequelize.query(`
      SELECT 
        COALESCE(nombreTipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreTipoDano
      ORDER BY total_danos DESC
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    console.log('✅ Consulta de daños por tipo completada');

    // 2. Resumen general de daños
    console.log('2. Ejecutando consulta de resumen...');
    const [resumenDanosResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_ordenes_con_danos,
        COALESCE(SUM(cantidadDano), 0) as total_danos,
        COUNT(DISTINCT nombreTipoDano) as tipos_danos_diferentes,
        COUNT(DISTINCT nombreSector) as sectores_con_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });

    console.log('✅ Consulta de resumen completada');

    // Formatear respuesta
    const response = {
      resumen: {
        total_ordenes_con_danos: parseInt(resumenDanosResult[0].total_ordenes_con_danos),
        total_danos: parseInt(resumenDanosResult[0].total_danos),
        tipos_danos_diferentes: parseInt(resumenDanosResult[0].tipos_danos_diferentes),
        sectores_con_danos: parseInt(resumenDanosResult[0].sectores_con_danos)
      },
      danosPorTipo: danosPorTipoResult.map(item => ({
        tipo: item.tipo_dano || 'Sin tipo',
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      danosPorSector: [],
      danosPorSupervisor: [],
      evolucion: [],
      metadata: {
        origen: origen || 'todos',
        year: currentYear,
        month: currentMonth,
        timestamp: new Date().toISOString(),
        fuente: 'vw_ordenes_unificada_completa'
      }
    };

    console.log('✅ Estadísticas de daños obtenidas desde vista unificada completa vw_ordenes_unificada_completa');
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de daños:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    
    const fallbackResponse = {
      resumen: {
        total_ordenes_con_danos: 0,
        total_danos: 0,
        tipos_danos_diferentes: 0,
        sectores_con_danos: 0
      },
      danosPorTipo: [],
      danosPorSector: [],
      danosPorSupervisor: [],
      evolucion: [],
      metadata: {
        origen: 'error',
        year: new Date().getFullYear(),
        timestamp: new Date().toISOString(),
        fuente: 'fallback',
        error: error.message
      }
    };
    
    res.json(fallbackResponse);
  }
}; 