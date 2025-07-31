const sequelize = require('../config/database');

// Controlador limpio para estadísticas de daños
exports.getDanoStats = async (req, res) => {
  // Declarar variables fuera del try para que estén disponibles en el catch
  let origen, year, currentYear, currentMonth;
  
  try {
    console.log('🔍 Iniciando getDanoStats desde controlador separado');
    console.log('🔍 req:', req ? 'válido' : 'undefined');
    console.log('🔍 req.query:', req?.query);
    
    // Extraer parámetros de manera segura
    const query = req?.query || {};
    origen = query.origen;
    year = query.year;
    const month = query.month;
    
    currentYear = year ? parseInt(year) : new Date().getFullYear();
    currentMonth = month ? parseInt(month) : null;
    
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
    const danosPorTipoQuery = `
      SELECT 
        COALESCE(nombreTipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreTipoDano
      ORDER BY total_danos DESC
    `;
    
    console.log('🔍 Query daños por tipo:', danosPorTipoQuery);
    
    const [danosPorTipoResult] = await sequelize.query(danosPorTipoQuery, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    console.log('✅ Consulta de daños por tipo completada. Resultados:', danosPorTipoResult.length);

    // 2. Resumen general de daños
    console.log('2. Ejecutando consulta de resumen...');
    const resumenQuery = `
      SELECT 
        COUNT(*) as total_ordenes_con_danos,
        COALESCE(SUM(cantidadDano), 0) as total_danos,
        COUNT(DISTINCT nombreTipoDano) as tipos_danos_diferentes,
        COUNT(DISTINCT nombreSector) as sectores_con_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
    `;
    
    console.log('🔍 Query resumen:', resumenQuery);
    
    const [resumenDanosResult] = await sequelize.query(resumenQuery, { 
      replacements: params,
      timeout: queryTimeout 
    });

    console.log('✅ Consulta de resumen completada. Resultados:', resumenDanosResult);

    // 3. Daños por sector
    console.log('3. Ejecutando consulta de daños por sector...');
    const danosPorSectorQuery = `
      SELECT 
        COALESCE(nombreSector, 'Sin sector') as sector,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSector
      ORDER BY total_danos DESC
      LIMIT 10
    `;
    
    const [danosPorSectorResult] = await sequelize.query(danosPorSectorQuery, { 
      replacements: params,
      timeout: queryTimeout 
    });

    // 4. Daños por supervisor
    console.log('4. Ejecutando consulta de daños por supervisor...');
    const danosPorSupervisorQuery = `
      SELECT 
        COALESCE(nombreSupervisor, 'Sin supervisor') as supervisor,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSupervisor
      ORDER BY total_danos DESC
      LIMIT 10
    `;
    
    const [danosPorSupervisorResult] = await sequelize.query(danosPorSupervisorQuery, { 
      replacements: params,
      timeout: queryTimeout 
    });

    // 5. Evolución temporal
    console.log('5. Ejecutando consulta de evolución...');
    const evolucionQuery = `
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as mes,
        COUNT(*) as cantidad_ordenes,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m')
      ORDER BY mes
    `;
    
    const [evolucionResult] = await sequelize.query(evolucionQuery, { 
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
        sector: item.sector || 'Sin sector',
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      danosPorSupervisor: danosPorSupervisorResult.map(item => ({
        supervisor: item.supervisor || 'Sin supervisor',
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      evolucion: evolucionResult.map(item => ({
        mes: item.mes,
        cantidad_ordenes: parseInt(item.cantidad_ordenes),
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

    console.log('✅ Estadísticas de daños obtenidas desde vista unificada completa vw_ordenes_unificada_completa');
    console.log('📊 Resumen:', response.resumen);
    console.log('📊 Tipos de daños:', response.danosPorTipo.length);
    console.log('📊 Sectores:', response.danosPorSector.length);
    console.log('📊 Supervisores:', response.danosPorSupervisor.length);
    console.log('📊 Evolución:', response.evolucion.length);
    
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de daños:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    console.error('🔍 Query parameters:', { origen, year, currentYear, currentMonth });
    
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
        year: currentYear || new Date().getFullYear(),
        month: currentMonth,
        timestamp: new Date().toISOString(),
        fuente: 'fallback',
        error: error.message,
        stack: error.stack
      }
    };
    
    res.json(fallbackResponse);
  }
}; 

// Nuevo método para obtener estadísticas de daños por zona
exports.getDanoStatsPorZona = async (req, res) => {
  try {
    console.log('🗺️ Obteniendo estadísticas de daños por zona...');
    
    const query = req?.query || {};
    const origen = query.origen;
    const year = query.year;
    const month = query.month;
    const zonaId = query.zona_id; // Nuevo parámetro para filtrar por zona
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : null;
    
    console.log('📊 Parámetros extraídos:', { origen, year, currentYear, currentMonth, zonaId });
    
    const queryTimeout = 8000;
    
    // Construir filtros para la vista unificada
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

    // 1. Obtener todas las zonas disponibles
    const [zonasResult] = await sequelize.query(`
      SELECT 
        z.id as zona_id,
        z.nombre as zona_nombre,
        z.tipo as zona_tipo,
        COUNT(DISTINCT s.id) as total_sectores
      FROM zona z
      LEFT JOIN sector s ON z.id = s.zona_id
      GROUP BY z.id, z.nombre, z.tipo
      ORDER BY z.id ASC
    `, { timeout: queryTimeout });

    console.log('✅ Zonas obtenidas:', zonasResult.length);

    // 2. Obtener sectores con sus zonas y daños
    let sectoresQuery = `
      SELECT 
        s.id as sector_id,
        s.nombre as sector_nombre,
        s.zona_id,
        z.nombre as zona_nombre,
        z.tipo as zona_tipo,
        COALESCE(SUM(v.cantidadDano), 0) as total_danos,
        COUNT(DISTINCT v.idOrdenServicio) as ordenes_con_danos
      FROM sector s
      LEFT JOIN zona z ON s.zona_id = z.id
      LEFT JOIN vw_ordenes_2025_actual v ON s.nombre = v.nombreSector
      ${whereClause}
      GROUP BY s.id, s.nombre, s.zona_id, z.nombre, z.tipo
      HAVING total_danos > 0
      ORDER BY total_danos DESC
    `;

    // Si se especifica una zona específica, filtrar por ella
    if (zonaId) {
      sectoresQuery = sectoresQuery.replace(
        'GROUP BY s.id, s.nombre, s.zona_id, z.nombre, z.tipo',
        `WHERE s.zona_id = ? GROUP BY s.id, s.nombre, s.zona_id, z.nombre, z.tipo`
      );
      params.unshift(parseInt(zonaId));
    }

    const [sectoresResult] = await sequelize.query(sectoresQuery, { 
      replacements: params,
      timeout: queryTimeout 
    });

    console.log('✅ Sectores con daños obtenidos:', sectoresResult.length);

    // 3. Agrupar sectores por zona
    const sectoresPorZona = {};
    zonasResult.forEach(zona => {
      sectoresPorZona[zona.zona_id] = {
        zona_id: zona.zona_id,
        zona_nombre: zona.zona_nombre,
        zona_tipo: zona.zona_tipo,
        total_sectores: zona.total_sectores,
        sectores_con_danos: [],
        total_danos: 0,
        total_ordenes: 0
      };
    });

    // Llenar datos de sectores por zona
    sectoresResult.forEach(sector => {
      if (sectoresPorZona[sector.zona_id]) {
        sectoresPorZona[sector.zona_id].sectores_con_danos.push({
          sector_id: sector.sector_id,
          sector_nombre: sector.sector_nombre,
          total_danos: parseInt(sector.total_danos),
          ordenes_con_danos: parseInt(sector.ordenes_con_danos)
        });
        sectoresPorZona[sector.zona_id].total_danos += parseInt(sector.total_danos);
        sectoresPorZona[sector.zona_id].total_ordenes += parseInt(sector.ordenes_con_danos);
      }
    });

    // 4. Obtener resumen general
    const [resumenResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT v.idOrdenServicio) as total_ordenes_con_danos,
        COALESCE(SUM(v.cantidadDano), 0) as total_danos,
        COUNT(DISTINCT v.nombreTipoDano) as tipos_danos_diferentes,
        COUNT(DISTINCT v.nombreSector) as sectores_con_danos
      FROM vw_ordenes_2025_actual v
      ${whereClause}
    `, { 
      replacements: params.slice(zonaId ? 1 : 0), // Remover zonaId si existe
      timeout: queryTimeout 
    });

    // 5. Obtener daños por tipo para la zona seleccionada (si aplica)
    let danosPorTipoQuery = `
      SELECT 
        COALESCE(v.nombreTipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(v.cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual v
      ${whereClause}
      GROUP BY v.nombreTipoDano
      ORDER BY total_danos DESC
    `;

    let danosPorTipoResult;

    if (zonaId) {
      // Si hay filtro por zona, agregar JOIN con sector
      danosPorTipoQuery = `
        SELECT 
          COALESCE(v.nombreTipoDano, 'Sin tipo') as tipo_dano,
          COUNT(*) as cantidad,
          COALESCE(SUM(v.cantidadDano), 0) as total_danos
        FROM vw_ordenes_2025_actual v
        INNER JOIN sector s ON v.nombreSector = s.nombre
        WHERE s.zona_id = ? AND YEAR(v.fechaOrdenServicio) = ? AND v.cantidadDano > 0
        ${origen && origen !== 'todos' ? 'AND v.source = ?' : ''}
        ${currentMonth ? 'AND MONTH(v.fechaOrdenServicio) = ?' : ''}
        GROUP BY v.nombreTipoDano
        ORDER BY total_danos DESC
      `;
      
      const tipoParams = [parseInt(zonaId), currentYear];
      if (origen && origen !== 'todos') tipoParams.push(origen);
      if (currentMonth) tipoParams.push(currentMonth);
      
      [danosPorTipoResult] = await sequelize.query(danosPorTipoQuery, { 
        replacements: tipoParams,
        timeout: queryTimeout 
      });
    } else {
      [danosPorTipoResult] = await sequelize.query(danosPorTipoQuery, { 
        replacements: params,
        timeout: queryTimeout 
      });
    }

    // Formatear respuesta
    const response = {
      resumen: {
        total_ordenes_con_danos: parseInt(resumenResult[0].total_ordenes_con_danos),
        total_danos: parseInt(resumenResult[0].total_danos),
        tipos_danos_diferentes: parseInt(resumenResult[0].tipos_danos_diferentes),
        sectores_con_danos: parseInt(resumenResult[0].sectores_con_danos)
      },
      zonas: Object.values(sectoresPorZona).filter(zona => zona.sectores_con_danos.length > 0),
      danosPorTipo: danosPorTipoResult.map(item => ({
        tipo: item.tipo_dano || 'Sin tipo',
        cantidad: parseInt(item.cantidad),
        total_danos: parseInt(item.total_danos)
      })),
      metadata: {
        origen: origen || 'todos',
        year: currentYear,
        month: currentMonth,
        zona_id: zonaId ? parseInt(zonaId) : null,
        timestamp: new Date().toISOString(),
        fuente: 'vw_ordenes_2025_actual'
      }
    };

    console.log('✅ Estadísticas de daños por zona obtenidas exitosamente');
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de daños por zona:', error);
    res.status(500).json({ 
      message: 'Error obteniendo estadísticas de daños por zona',
      error: error.message 
    });
  }
};

// Método para obtener zonas disponibles
exports.getZonasDisponibles = async (req, res) => {
  try {
    console.log('🗺️ Obteniendo zonas disponibles...');
    
    const queryTimeout = 5000;
    
    // Obtener zonas con información de sectores
    const [zonasResult] = await sequelize.query(`
      SELECT 
        z.id as zona_id,
        z.nombre as zona_nombre,
        z.tipo as zona_tipo,
        COUNT(DISTINCT s.id) as total_sectores,
        COUNT(DISTINCT CASE WHEN s.id IS NOT NULL THEN s.id END) as sectores_con_datos
      FROM zona z
      LEFT JOIN sector s ON z.id = s.zona_id
      GROUP BY z.id, z.nombre, z.tipo
      ORDER BY z.id ASC
    `, { timeout: queryTimeout });

    console.log('✅ Zonas obtenidas:', zonasResult.length);

    // Formatear respuesta
    const response = {
      zonas: zonasResult.map(zona => ({
        id: zona.zona_id,
        nombre: zona.zona_nombre,
        tipo: zona.zona_tipo,
        total_sectores: parseInt(zona.total_sectores),
        sectores_con_datos: parseInt(zona.sectores_con_datos)
      })),
      metadata: {
        total_zonas: zonasResult.length,
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ Zonas disponibles obtenidas exitosamente');
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo zonas disponibles:', error);
    res.status(500).json({ 
      message: 'Error obteniendo zonas disponibles',
      error: error.message 
    });
  }
}; 