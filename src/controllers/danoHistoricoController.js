const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Función para obtener datos históricos de daños del 2024 con las 8 queries fundamentales
async function obtenerDatosHistoricos2024(year = 2024) {
  try {
    console.log(`📊 Obteniendo datos históricos de daños del ${year} con queries optimizadas...`);
    
    // Verificar si existe la tabla migracion_ordenes
    const [tablas] = await sequelize.query("SHOW TABLES LIKE 'migracion_ordenes'");
    
    if (tablas.length === 0) {
      console.log('⚠️ Tabla migracion_ordenes no existe, retornando datos vacíos');
      return {
        total: 0,
        porMes: [],
        porZona: [],
        porTipo: [],
        porDescripcion: [],
        porOperador: [],
        porMaquina: [],
        promedioPorServicio: 0,
        ultimos12Meses: [],
        heatmapData: []
      };
    }
    
    // 1. ✅ Total de daños registrados en 2024
    const queryTotal = `
      SELECT COALESCE(SUM(cantidad_dano), 0) AS total_danos
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
    `;
    
    // 2. 📁 Daños agrupados por tipo
    const queryPorTipo = `
      SELECT 
        COALESCE(tipo_dano, 'Sin tipo') as tipo_dano, 
        SUM(cantidad_dano) AS total
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
      GROUP BY tipo_dano
      ORDER BY total DESC
    `;
    
    // 3. 🧱 Daños agrupados por descripción
    const queryPorDescripcion = `
      SELECT 
        COALESCE(descripcion_dano, 'Sin descripción') as descripcion_dano, 
        SUM(cantidad_dano) AS total
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
      GROUP BY descripcion_dano
      ORDER BY total DESC
      LIMIT 20
    `;
    
    // 4. 👷 Daños agrupados por operador
    const queryPorOperador = `
      SELECT 
        COALESCE(operador, 'Sin operador') as operador, 
        SUM(cantidad_dano) AS total
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
      GROUP BY operador
      ORDER BY total DESC
      LIMIT 15
    `;
    
    // 5. 🏭 Daños por sector
    const queryPorSector = `
      SELECT 
        COALESCE(sector, 'Sin sector') as sector, 
        SUM(cantidad_dano) AS total
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
      GROUP BY sector
      ORDER BY total DESC
    `;
    
    // 6. ⚙️ Daños por máquina
    const queryPorMaquina = `
      SELECT 
        COALESCE(maquina, 'Sin máquina') as maquina, 
        SUM(cantidad_dano) AS total
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
      GROUP BY maquina
      ORDER BY total DESC
      LIMIT 15
    `;
    
    // 7. 📅 Daños por mes (tendencia mensual)
    const queryPorMes = `
      SELECT 
        MONTH(fecha_inicio) AS mes, 
        SUM(cantidad_dano) AS total
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
      GROUP BY MONTH(fecha_inicio)
      ORDER BY mes ASC
    `;
    
    // 8. 🧮 Promedio de daños por servicio
    const queryPromedio = `
      SELECT COALESCE(AVG(cantidad_dano), 0) AS promedio
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND cantidad_dano IS NOT NULL
    `;
    
    // Ejecutar todas las consultas en paralelo
    const [
      totalResult,
      porTipoResult,
      porDescripcionResult,
      porOperadorResult,
      porSectorResult,
      porMaquinaResult,
      porMesResult,
      promedioResult
    ] = await Promise.all([
      sequelize.query(queryTotal),
      sequelize.query(queryPorTipo),
      sequelize.query(queryPorDescripcion),
      sequelize.query(queryPorOperador),
      sequelize.query(queryPorSector),
      sequelize.query(queryPorMaquina),
      sequelize.query(queryPorMes),
      sequelize.query(queryPromedio)
    ]);
    
    // Formatear respuesta con los datos procesados
    const response = {
      // 1. 🔢 Cantidad total de daños en 2024
      total: parseInt(totalResult[0][0]?.total_danos) || 0,
      
      // 2. 📁 Daños agrupados por tipo
      porTipo: porTipoResult[0].map(item => ({
        tipo: item.tipo_dano,
        cantidad: parseInt(item.total) || 0
      })),
      
      // 3. 🧱 Daños agrupados por descripción
      porDescripcion: porDescripcionResult[0].map(item => ({
        descripcion: item.descripcion_dano,
        cantidad: parseInt(item.total) || 0
      })),
      
      // 4. 👷 Daños agrupados por operador
      porOperador: porOperadorResult[0].map(item => ({
        operador: item.operador,
        cantidad: parseInt(item.total) || 0
      })),
      
      // 5. 🏭 Daños por sector
      porZona: porSectorResult[0].map(item => ({
        zona: item.sector,
        cantidad: parseInt(item.total) || 0
      })),
      
      // 6. ⚙️ Daños por máquina
      porMaquina: porMaquinaResult[0].map(item => ({
        maquina: item.maquina,
        cantidad: parseInt(item.total) || 0
      })),
      
      // 7. 📅 Daños por mes (tendencia mensual)
      porMes: porMesResult[0].map(item => ({
        mes: item.mes,
        cantidad: parseInt(item.total) || 0,
        nombreMes: new Date(year, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' })
      })),
      
      // 8. 🧮 Promedio de daños por servicio
      promedioPorServicio: parseFloat(promedioResult[0][0]?.promedio || 0).toFixed(2),
      
      // Datos adicionales para compatibilidad
      porPabellon: [],
      ultimos12Meses: [],
      heatmapData: []
    };
    
    console.log(`✅ Datos históricos del ${year} obtenidos exitosamente`);
    console.log(`🔢 Total de daños: ${response.total}`);
    console.log(`📁 Tipos de daño: ${response.porTipo.length}`);
    console.log(`🧱 Descripciones únicas: ${response.porDescripcion.length}`);
    console.log(`👷 Operadores involucrados: ${response.porOperador.length}`);
    console.log(`🏭 Sectores con daños: ${response.porZona.length}`);
    console.log(`⚙️ Máquinas involucradas: ${response.porMaquina.length}`);
    console.log(`📅 Meses con datos: ${response.porMes.length}`);
    console.log(`🧮 Promedio por servicio: ${response.promedioPorServicio}`);
    
    return response;
    
  } catch (error) {
    console.error('❌ Error obteniendo datos históricos:', error.message);
    return {
      total: 0,
      porMes: [],
      porZona: [],
      porTipo: [],
      porDescripcion: [],
      porOperador: [],
      porMaquina: [],
      porPabellon: [],
      promedioPorServicio: 0,
      ultimos12Meses: [],
      heatmapData: []
    };
  }
}

// Exportar la función para uso directo
exports.obtenerDatosHistoricos2024 = obtenerDatosHistoricos2024;

// Endpoint para obtener estadísticas combinadas (actuales + históricas)
exports.getDanoStatsCombinadas = async (req, res) => {
  try {
    console.log('🔄 Obteniendo estadísticas combinadas de daños...');
    
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;
    
    // Obtener datos actuales (desde la tabla dano)
    const { getDanoStats } = require('./dashboardController');
    let datosActuales = null;
    
    // Crear un mock response que capture la respuesta
    const mockRes = {
      json: (data) => {
        datosActuales = data;
        return data;
      },
      status: (code) => ({
        json: (data) => {
          datosActuales = data;
          return data;
        }
      })
    };
    
    // Llamar a getDanoStats con el mock
    await getDanoStats({ query: { year, month } }, mockRes);
    
    // Verificar que se obtuvieron datos
    if (!datosActuales) {
      console.log('⚠️ No se obtuvieron datos actuales, usando datos por defecto');
      datosActuales = {
        totalAnual: { actual: 0, anterior: 0, variacion: 0 },
        porMes: [],
        porZona: [],
        totalAnualPorZona: [],
        totalGeneral: 0,
        porTipo: [],
        ultimos12Meses: [],
        heatmapData: []
      };
    }
    
    // Obtener datos históricos
    const datosHistoricos = await obtenerDatosHistoricos2024(year);
    
    // Combinar datos
    const response = {
      // Datos actuales
      totalAnual: datosActuales.totalAnual,
      porMes: datosActuales.porMes,
      porZona: datosActuales.porZona,
      totalAnualPorZona: datosActuales.totalAnualPorZona,
      totalGeneral: datosActuales.totalGeneral,
      porTipo: datosActuales.porTipo,
      ultimos12Meses: datosActuales.ultimos12Meses,
      heatmapData: datosActuales.heatmapData,
      
      // Datos históricos del 2024
      datosHistoricos: {
        total: datosHistoricos.total,
        porMes: datosHistoricos.porMes,
        porZona: datosHistoricos.porZona,
        porTipo: datosHistoricos.porTipo,
        ultimos12Meses: datosHistoricos.ultimos12Meses,
        heatmapData: datosHistoricos.heatmapData
      },
      
      // Totales combinados
      totalCombinado: {
        actual: datosActuales.totalAnual?.actual || 0,
        historico: datosHistoricos.total,
        total: (datosActuales.totalAnual?.actual || 0) + datosHistoricos.total
      },
      
      // Metadatos
      metadata: {
        fuenteActual: 'tabla_dano',
        fuenteHistorica: 'migracion_ordenes',
        año: year,
        mes: month,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('✅ Estadísticas combinadas obtenidas exitosamente');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas combinadas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas combinadas',
      details: error.message 
    });
  }
};

// Endpoint específico para datos históricos
exports.getDanoStatsHistoricos = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2024;
    const datosHistoricos = await obtenerDatosHistoricos2024(year);
    
    res.json({
      ...datosHistoricos,
      metadata: {
        fuente: 'migracion_ordenes',
        año: year,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo datos históricos:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos históricos',
      details: error.message 
    });
  }
};

// Endpoint para comparar años
exports.compararAnios = async (req, res) => {
  try {
    const anioActual = req.query.anioActual ? parseInt(req.query.anioActual) : 2024;
    const anioComparacion = req.query.anioComparacion ? parseInt(req.query.anioComparacion) : 2023;
    
    console.log(`📊 Comparando años: ${anioActual} vs ${anioComparacion}`);
    
    // Obtener datos de ambos años
    const datosActual = await obtenerDatosHistoricos2024(anioActual);
    const datosComparacion = await obtenerDatosHistoricos2024(anioComparacion);
    
    // Calcular variaciones
    const variacionTotal = datosComparacion.total > 0 ? 
      ((datosActual.total - datosComparacion.total) / datosComparacion.total) * 100 : 0;
    
    const variacionPromedio = datosComparacion.promedioPorServicio > 0 ?
      ((parseFloat(datosActual.promedioPorServicio) - parseFloat(datosComparacion.promedioPorServicio)) / parseFloat(datosComparacion.promedioPorServicio)) * 100 : 0;
    
    const response = {
      anioActual: {
        total: datosActual.total,
        promedioPorServicio: datosActual.promedioPorServicio,
        porMes: datosActual.porMes,
        porZona: datosActual.porZona,
        porTipo: datosActual.porTipo
      },
      anioComparacion: {
        total: datosComparacion.total,
        promedioPorServicio: datosComparacion.promedioPorServicio,
        porMes: datosComparacion.porMes,
        porZona: datosComparacion.porZona,
        porTipo: datosComparacion.porTipo
      },
      variaciones: {
        total: {
          diferencia: datosActual.total - datosComparacion.total,
          porcentaje: variacionTotal,
          tendencia: variacionTotal > 0 ? 'incremento' : variacionTotal < 0 ? 'decremento' : 'sin cambio'
        },
        promedio: {
          diferencia: parseFloat(datosActual.promedioPorServicio) - parseFloat(datosComparacion.promedioPorServicio),
          porcentaje: variacionPromedio,
          tendencia: variacionPromedio > 0 ? 'incremento' : variacionPromedio < 0 ? 'decremento' : 'sin cambio'
        }
      },
      metadata: {
        anioActual,
        anioComparacion,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`✅ Comparación de años completada`);
    console.log(`📈 Variación total: ${variacionTotal.toFixed(2)}%`);
    console.log(`📊 Variación promedio: ${variacionPromedio.toFixed(2)}%`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error comparando años:', error);
    res.status(500).json({ 
      error: 'Error al comparar años',
      details: error.message 
    });
  }
};

// Endpoint para obtener top 10 operadores con más daños
exports.getTop10OperadoresDanos = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2024;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    console.log(`🏆 Obteniendo top ${limit} operadores con más daños del ${year}...`);
    
    // Verificar si existe la tabla migracion_ordenes
    const [tablas] = await sequelize.query("SHOW TABLES LIKE 'migracion_ordenes'");
    
    if (tablas.length === 0) {
      console.log('⚠️ Tabla migracion_ordenes no existe');
      return res.json({
        operadores: [],
        estadisticas: {
          total_operadores_activos: 0,
          total_danos_anio: 0,
          promedio_danos_por_operador: 0
        },
        metadata: {
          año: year,
          limite: limit,
          timestamp: new Date().toISOString(),
          mensaje: 'Tabla migracion_ordenes no existe'
        }
      });
    }
    
    // Consulta para obtener top operadores
    const queryTopOperadores = `
      SELECT 
        operador,
        SUM(cantidad_dano) as total_danos,
        COUNT(DISTINCT id_orden_servicio) as total_ordenes,
        AVG(cantidad_dano) as promedio_danos_por_orden,
        MAX(fecha_inicio) as ultima_fecha,
        MIN(fecha_inicio) as primera_fecha
      FROM migracion_ordenes 
      WHERE YEAR(fecha_inicio) = ? 
        AND operador IS NOT NULL 
        AND operador != '' 
        AND cantidad_dano IS NOT NULL
      GROUP BY operador
      ORDER BY total_danos DESC
      LIMIT ?
    `;
    
    // Consulta para estadísticas generales
    const queryEstadisticas = `
      SELECT 
        COUNT(DISTINCT operador) as total_operadores_activos,
        SUM(cantidad_dano) as total_danos_anio,
        AVG(cantidad_dano) as promedio_danos_por_operador
      FROM migracion_ordenes 
      WHERE YEAR(fecha_inicio) = ? 
        AND operador IS NOT NULL 
        AND operador != '' 
        AND cantidad_dano IS NOT NULL
    `;
    
    const [topOperadores, estadisticas] = await Promise.all([
      sequelize.query(queryTopOperadores, { replacements: [year, limit] }),
      sequelize.query(queryEstadisticas, { replacements: [year] })
    ]);
    
    // Formatear respuesta
    const operadoresFormateados = topOperadores[0].map((operador, index) => ({
      posicion: index + 1,
      nombre: operador.operador,
      total_danos: parseInt(operador.total_danos),
      total_ordenes: parseInt(operador.total_ordenes),
      promedio_por_orden: parseFloat(operador.promedio_danos_por_orden).toFixed(2),
      porcentaje_total: estadisticas[0][0].total_danos_anio > 0 ? 
        ((operador.total_danos / estadisticas[0][0].total_danos_anio) * 100).toFixed(2) : '0.00',
      periodo: {
        primera_fecha: operador.primera_fecha,
        ultima_fecha: operador.ultima_fecha
      }
    }));
    
    const response = {
      operadores: operadoresFormateados,
      estadisticas: {
        total_operadores_activos: parseInt(estadisticas[0][0].total_operadores_activos),
        total_danos_anio: parseInt(estadisticas[0][0].total_danos_anio),
        promedio_danos_por_operador: parseFloat(estadisticas[0][0].promedio_danos_por_operador).toFixed(2)
      },
      metadata: {
        año: year,
        limite: limit,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`✅ Top ${limit} operadores obtenidos exitosamente`);
    console.log(`👷 Total operadores activos: ${response.estadisticas.total_operadores_activos}`);
    console.log(`🔧 Total daños del año: ${response.estadisticas.total_danos_anio}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo top operadores:', error);
    res.status(500).json({ 
      error: 'Error al obtener top operadores',
      details: error.message 
    });
  }
};

// Endpoint para obtener datos por zona (para distribución por zona)
exports.getDatosPorZona = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2024;
    
    console.log(`🗺️ Obteniendo datos por zona del ${year}...`);
    
    // Verificar si existe la tabla migracion_ordenes
    const [tablas] = await sequelize.query("SHOW TABLES LIKE 'migracion_ordenes'");
    
    if (tablas.length === 0) {
      console.log('⚠️ Tabla migracion_ordenes no existe');
      return res.json({
        sectores: [],
        total_sectores: 0,
        total_danos: 0,
        metadata: {
          año: year,
          timestamp: new Date().toISOString(),
          mensaje: 'Tabla migracion_ordenes no existe'
        }
      });
    }
    
    // Consulta para obtener sectores con sus daños
    const querySectores = `
      SELECT 
        sector,
        SUM(cantidad_dano) as cantidad,
        COUNT(DISTINCT id_orden_servicio) as total_ordenes,
        COUNT(DISTINCT operador) as operadores_unicos,
        COUNT(DISTINCT maquina) as maquinas_unicas
      FROM migracion_ordenes 
      WHERE YEAR(fecha_inicio) = ? 
        AND sector IS NOT NULL 
        AND sector != '' 
        AND cantidad_dano IS NOT NULL
      GROUP BY sector
      ORDER BY cantidad DESC
    `;
    
    // Consulta para totales
    const queryTotales = `
      SELECT 
        COUNT(DISTINCT sector) as total_sectores,
        SUM(cantidad_dano) as total_danos
      FROM migracion_ordenes 
      WHERE YEAR(fecha_inicio) = ? 
        AND sector IS NOT NULL 
        AND sector != '' 
        AND cantidad_dano IS NOT NULL
    `;
    
    const [sectores, totales] = await Promise.all([
      sequelize.query(querySectores, { replacements: [year] }),
      sequelize.query(queryTotales, { replacements: [year] })
    ]);
    
    // Formatear respuesta
    const sectoresFormateados = sectores[0].map(sector => ({
      sector: sector.sector,
      cantidad: parseInt(sector.cantidad),
      total_ordenes: parseInt(sector.total_ordenes),
      operadores_unicos: parseInt(sector.operadores_unicos),
      maquinas_unicas: parseInt(sector.maquinas_unicas)
    }));
    
    const response = {
      sectores: sectoresFormateados,
      total_sectores: parseInt(totales[0][0].total_sectores),
      total_danos: parseInt(totales[0][0].total_danos),
      metadata: {
        año: year,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`✅ Datos por zona obtenidos exitosamente`);
    console.log(`🗺️ Total sectores: ${response.total_sectores}`);
    console.log(`🔧 Total daños: ${response.total_danos}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo datos por zona:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos por zona',
      details: error.message 
    });
  }
};

// Endpoint para obtener datos completos con todas las queries específicas
exports.getDatosCompletos = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2024;
    
    console.log(`📊 Obteniendo datos completos del ${year} con queries específicas...`);
    
    // Verificar si existe la tabla migracion_ordenes
    const [tablas] = await sequelize.query("SHOW TABLES LIKE 'migracion_ordenes'");
    
    if (tablas.length === 0) {
      console.log('⚠️ Tabla migracion_ordenes no existe');
      return res.json({
        distribucionTipo: [],
        topMaquinas: [],
        topOperadores: [],
        metadata: {
          año: year,
          timestamp: new Date().toISOString(),
          mensaje: 'Tabla migracion_ordenes no existe'
        }
      });
    }
    
    // 1️⃣ Query para distribución por tipo de daño
    const queryDistribucionTipo = `
      SELECT 
        COALESCE(tipo_dano, 'Sin tipo') as tipo_dano, 
        SUM(cantidad_dano) AS total
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND tipo_dano IS NOT NULL
        AND cantidad_dano IS NOT NULL
      GROUP BY tipo_dano
      ORDER BY total DESC
    `;
    
    // 2️⃣ Query para top 10 máquinas con más daños
    const queryTopMaquinas = `
      SELECT 
        COALESCE(maquina, 'Sin máquina') as maquina, 
        SUM(cantidad_dano) AS total_danos
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND maquina IS NOT NULL
        AND cantidad_dano IS NOT NULL
      GROUP BY maquina
      ORDER BY total_danos DESC
      LIMIT 10
    `;
    
    // 3️⃣ Query para top operadores con cálculos completos
    const queryTopOperadores = `
      SELECT 
        operador,
        SUM(cantidad_dano) AS total_danos,
        COUNT(DISTINCT id_orden_servicio) AS total_ordenes,
        SUM(cantidad_dano) / COUNT(DISTINCT id_orden_servicio) AS promedio_por_orden,
        (SUM(cantidad_dano) * 100.0 / (
            SELECT SUM(cantidad_dano)
            FROM migracion_ordenes
            WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
            AND cantidad_dano IS NOT NULL
        )) AS porcentaje_total,
        MIN(fecha_inicio) AS fecha_inicio,
        MAX(fecha_inicio) AS fecha_fin
      FROM migracion_ordenes
      WHERE fecha_inicio BETWEEN '${year}-01-01' AND '${year}-12-31'
        AND operador IS NOT NULL 
        AND operador != '' 
        AND cantidad_dano IS NOT NULL
      GROUP BY operador
      ORDER BY total_danos DESC
      LIMIT 10
    `;
    
    // Ejecutar todas las queries en paralelo
    const [distribucionTipo, topMaquinas, topOperadores] = await Promise.all([
      sequelize.query(queryDistribucionTipo),
      sequelize.query(queryTopMaquinas),
      sequelize.query(queryTopOperadores)
    ]);
    
    // Formatear respuesta
    const response = {
      // 1️⃣ Distribución por tipo de daño
      distribucionTipo: distribucionTipo[0].map(item => ({
        tipo: item.tipo_dano,
        cantidad: parseInt(item.total),
        porcentaje: 0 // Se calculará después
      })),
      
      // 2️⃣ Top 10 máquinas
      topMaquinas: topMaquinas[0].map((item, index) => ({
        posicion: index + 1,
        maquina: item.maquina,
        total_danos: parseInt(item.total_danos)
      })),
      
      // 3️⃣ Top 10 operadores con cálculos completos
      topOperadores: topOperadores[0].map((item, index) => ({
        posicion: index + 1,
        nombre: item.operador,
        total_danos: parseInt(item.total_danos),
        total_ordenes: parseInt(item.total_ordenes),
        promedio_por_orden: parseFloat(item.promedio_por_orden).toFixed(2),
        porcentaje_total: parseFloat(item.porcentaje_total).toFixed(2),
        periodo: {
          fecha_inicio: item.fecha_inicio,
          fecha_fin: item.fecha_fin
        }
      })),
      
      metadata: {
        año: year,
        timestamp: new Date().toISOString()
      }
    };
    
    // Calcular porcentajes para distribución por tipo
    const totalTipo = response.distribucionTipo.reduce((sum, item) => sum + item.cantidad, 0);
    response.distribucionTipo.forEach(item => {
      item.porcentaje = totalTipo > 0 ? ((item.cantidad / totalTipo) * 100).toFixed(2) : '0.00';
    });
    
    console.log(`✅ Datos completos obtenidos exitosamente`);
    console.log(`📁 Tipos de daño: ${response.distribucionTipo.length}`);
    console.log(`⚙️ Top máquinas: ${response.topMaquinas.length}`);
    console.log(`👷 Top operadores: ${response.topOperadores.length}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo datos completos:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos completos',
      details: error.message 
    });
  }
};

 