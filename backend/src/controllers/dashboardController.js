const { Planilla, Maquina, Operador, Sector, Usuario, Barredor, Dano, MaquinaPlanilla, PabellonMaquina, Pabellon, ReporteDanosMensuales } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Función para formatear valores muy pequeños con precisión adecuada
const formatSmallValue = (value, decimals = 4) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue === 0) return '0';
  
  // Para valores muy pequeños, mostrar más decimales
  if (numValue < 0.0001) {
    return numValue.toFixed(6);
  } else if (numValue < 0.001) {
    return numValue.toFixed(5);
  } else if (numValue < 0.01) {
    return numValue.toFixed(4);
  } else if (numValue < 1) {
    return numValue.toFixed(3);
  } else {
    return numValue.toFixed(decimals);
  }
};

const formatLargeValue = (value, decimals = 1) => {
  if (!value || value === 0) return '0';
  
  const num = parseFloat(value);
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  } else {
    return num.toFixed(decimals);
  }
};

const formatAreaValue = (value) => {
  if (!value || value === 0) return '0 m²';
  
  const num = parseFloat(value);
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B m²';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M m²';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K m²';
  } else {
    return num.toLocaleString() + ' m²';
  }
};
const danoController = require('./danoController');

// Función para obtener el nombre del mes
const getMonthName = (month) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[month - 1] || 'Desconocido';
};

// Cache más agresivo para cargar más rápido
let metricsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (aumentado)

// Función helper para mapear valores de origen a valores reales en la BD
const mapOrigenToSource = (origen) => {
  if (origen === 'historico') {
    return 'historico_2025';
  } else if (origen === 'sistema') {
    return 'sistema';
  } else if (origen === 'todos') {
    return null; // No aplicar filtro
  } else if (origen) {
    return origen; // Usar el valor tal como viene
  }
  return null;
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    console.log('Iniciando obtención de métricas del dashboard...');
    
    // Verificar si el cache está invalidado por cambios en daños
    const isCacheInvalid = danoController.isDashboardCacheInvalid();
    
    // Verificar cache primero (más agresivo)
    if (metricsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION && !isCacheInvalid) {
      console.log('Sirviendo datos desde cache (rápido)');
      return res.json(metricsCache);
    }
    
    // Si el cache está invalidado, resetearlo
    if (isCacheInvalid) {
      console.log('Cache invalidado, actualizando datos...');
      danoController.resetDashboardCache();
    }

    // Configurar timeout más corto para consultas más rápidas
    const queryTimeout = 8000; // 8 segundos para consultas más complejas
    
    // Obtener parámetros de filtro
    const { origen, year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Construir filtros para la vista unificada
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    // Mapear valores de origen a los valores reales en la base de datos
    const sourceValue = mapOrigenToSource(origen);
    
    if (sourceValue) {
      whereClause += ' AND source COLLATE utf8mb4_unicode_ci = ?';
      params.push(sourceValue);
    }
    
    // 1. Métricas básicas desde la vista unificada (incluyendo mts2) - CORREGIDO
    console.log('🔍 Ejecutando consulta principal con whereClause:', whereClause);
    console.log('🔍 Params:', params);
    
    const [totalPlanillasResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as total,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantLimpiar), 0) as total_pabellones_limpiados,
        COALESCE(SUM(mts2), 0) as total_mts2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    console.log('✅ Resultado consulta principal:', totalPlanillasResult[0]);
    
    // 1.1. Pabellones por planilla única (CORREGIDO)
    const [pabellonesPorPlanillaResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        ${whereClause}
        GROUP BY idOrdenServicio
      ) as planillas_unicas
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    const totalPlanillas = totalPlanillasResult[0].total || 0;
    
    // Calcular estados basándose en fechas y origen de datos
    // Planillas activas: las que tienen fechaFinOrdenServicio NULL o igual a fechaOrdenServicio
    const [planillasActivasResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      AND (fechaFinOrdenServicio IS NULL OR fechaFinOrdenServicio = fechaOrdenServicio)
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // Planillas completadas: las que tienen fechaFinOrdenServicio diferente a fechaOrdenServicio
    const [planillasCompletadasResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      AND fechaFinOrdenServicio IS NOT NULL 
      AND fechaFinOrdenServicio != fechaOrdenServicio
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    const planillasActivas = planillasActivasResult[0].cantidad || 0;
    const planillasCompletadas = planillasCompletadasResult[0].cantidad || 0;
    
    // Obtener planillas pendientes y canceladas desde la vista unificada
    let planillasPendientes = 0;
    let planillasCanceladas = 0;
    
    // Obtener planillas pendientes y canceladas del sistema actual
    // Siempre obtener datos del sistema actual para el dashboard principal
    try {
      // Planillas pendientes: del sistema actual con fechaFinOrdenServicio NULL
      const [planillasPendientesResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
        FROM vw_ordenes_unificada_completa
        WHERE source = 'sistema_actual'
        AND fechaFinOrdenServicio IS NULL
      `, { timeout: queryTimeout });
      
      // Planillas canceladas: del sistema actual con fechaFinOrdenServicio igual a fechaOrdenServicio
      const [planillasCanceladasResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
        FROM vw_ordenes_unificada_completa
        WHERE source = 'sistema_actual'
        AND fechaFinOrdenServicio IS NOT NULL
        AND fechaFinOrdenServicio = fechaOrdenServicio
      `, { timeout: queryTimeout });
        
        planillasPendientes = planillasPendientesResult[0].cantidad || 0;
        planillasCanceladas = planillasCanceladasResult[0].cantidad || 0;
        
        console.log('📊 Planillas del sistema actual (desde vista unificada):', {
          pendientes: planillasPendientes,
          canceladas: planillasCanceladas,
          activas: planillasActivas,
          completadas: planillasCompletadas
        });
        
        // Debug: Verificar datos en la vista unificada
        const [debugResult] = await sequelize.query(`
          SELECT 
            source,
            COUNT(DISTINCT idOrdenServicio) as total,
            COUNT(DISTINCT CASE WHEN fechaFinOrdenServicio IS NULL THEN idOrdenServicio END) as sin_fecha_fin,
            COUNT(DISTINCT CASE WHEN fechaFinOrdenServicio IS NOT NULL THEN idOrdenServicio END) as con_fecha_fin
          FROM vw_ordenes_unificada_completa
          GROUP BY source
        `, { timeout: queryTimeout });
        
        console.log('🔍 Debug - Datos en vista unificada:', debugResult);
        
        // Debug adicional: Verificar consulta específica de planillas pendientes
        const [debugPendientes] = await sequelize.query(`
          SELECT idOrdenServicio, fechaFinOrdenServicio
          FROM vw_ordenes_unificada_completa
          WHERE source = 'sistema_actual'
          AND fechaFinOrdenServicio IS NULL
        `, { timeout: queryTimeout });
        
        console.log('🔍 Debug - Planillas pendientes encontradas:', debugPendientes);
      } catch (error) {
        console.error('❌ Error obteniendo planillas del sistema actual:', error);
      }
    
    // 2. Métricas del mes actual (incluyendo mts2) - CORREGIDO
    const [metricasMesResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes,
        COALESCE(SUM(mts2), 0) as mts2_mes
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
    `, { 
      replacements: sourceValue ? [currentYear, currentMonth, sourceValue] : [currentYear, currentMonth],
      timeout: queryTimeout 
    });
    
    // 2.1. Pabellones del mes por planilla única (CORREGIDO)
    const [pabellonesMesUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
        ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
        GROUP BY idOrdenServicio
      ) as planillas_mes_unicas
    `, { 
      replacements: sourceValue ? [currentYear, currentMonth, sourceValue] : [currentYear, currentMonth],
      timeout: queryTimeout 
    });
    
    // 3. Métricas del mes anterior (incluyendo mts2) - CORREGIDO
    const [metricasMesAnteriorResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_mes_anterior,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_anterior,
        COALESCE(SUM(mts2), 0) as mts2_mes_anterior
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
    `, { 
      replacements: sourceValue ? [previousYear, previousMonth, sourceValue] : [previousYear, previousMonth],
      timeout: queryTimeout 
    });
    
    // 3.1. Pabellones del mes anterior por planilla única (CORREGIDO)
    const [pabellonesMesAnteriorUnicosResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_anterior_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
        ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
        GROUP BY idOrdenServicio
      ) as planillas_mes_anterior_unicas
    `, { 
      replacements: sourceValue ? [previousYear, previousMonth, sourceValue] : [previousYear, previousMonth],
      timeout: queryTimeout 
    });
    
    // 4. Datos para gráficos de tendencias mensuales (últimos 6 meses) - incluyendo mts2 - CORREGIDO
    console.log('🔍 Ejecutando consulta de tendencias mensuales...');
    console.log('🔍 currentYear:', currentYear);
    console.log('🔍 sourceValue:', sourceValue);
    
    const [tendenciasMensualesResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones,
        COALESCE(SUM(mts2), 0) as mts2
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `, { 
      replacements: sourceValue ? [currentYear, sourceValue] : [currentYear],
      timeout: 8000 
    });
    
    console.log('📊 Resultado tendencias mensuales:', tendenciasMensualesResult);
    
    // 4.1. Pabellones por mes por planilla única (CORREGIDO)
    console.log('🔍 Ejecutando consulta de pabellones únicos...');
    
    const [tendenciasMensualesUnicosResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          fechaOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        WHERE YEAR(fechaOrdenServicio) = ?
        ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
        GROUP BY idOrdenServicio, fechaOrdenServicio
      ) as planillas_mensuales_unicas
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `, { 
      replacements: sourceValue ? [currentYear, sourceValue] : [currentYear],
      timeout: 8000 
    });
    
    console.log('📈 Resultado pabellones únicos:', tendenciasMensualesUnicosResult);
    
    // 5. Datos para gráficos de rendimiento por sector (top 5) - incluyendo mts2 - CORREGIDO
    const [rendimientoSectorResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(mts2), 0) as mts2_total
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSector
      ORDER BY pabellones_total DESC
      LIMIT 5
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 5.1. Pabellones por sector por planilla única (CORREGIDO)
    const [rendimientoSectorUnicosResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          nombreSector,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        ${whereClause}
        GROUP BY idOrdenServicio, nombreSector
      ) as planillas_sector_unicas
      GROUP BY nombreSector
      ORDER BY pabellones_total_unicos DESC
      LIMIT 5
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 6. Obtener métricas de otras entidades (mantener consultas existentes)
    const [
      totalMaquinas,
      totalOperadores,
      totalSectores,
      totalBarredores,
      totalPabellones
    ] = await Promise.all([
      Maquina.count({ timeout: queryTimeout }),
      Operador.count({ timeout: queryTimeout }),
      Sector.count({ timeout: queryTimeout }),
      Barredor.count({ timeout: queryTimeout }),
      Pabellon.count({ timeout: queryTimeout })
    ]);

    // 7. NUEVO: Calcular operadores activos (operadores que han trabajado en el último mes)
    const [operadoresActivosResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT nombreOperador) as operadores_activos
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
      AND nombreOperador IS NOT NULL AND nombreOperador != 'Sin operador'
    `, { 
      replacements: sourceValue ? [currentYear, currentMonth, sourceValue] : [currentYear, currentMonth],
      timeout: queryTimeout 
    });

    const operadoresActivos = operadoresActivosResult[0].operadores_activos || 0;

    console.log('Métricas obtenidas desde vista unificada vw_ordenes_unificada_completa');

    // Cálculo de eficiencia real mejorado
    const eficienciaActual = totalPlanillas > 0 ? 
      Math.round((planillasCompletadas / totalPlanillas) * 100) : 0;

    // Cálculo de eficiencia promedio (basado en pabellones limpiados vs total)
    const eficienciaPromedio = totalPlanillasResult[0].total_pabellones > 0 ? 
      Math.round((totalPlanillasResult[0].total_pabellones_limpiados / totalPlanillasResult[0].total_pabellones) * 100) : 0;

    // Cálculo de variaciones (incluyendo mts2) - CORREGIDO para pabellones únicos
    const planillasMes = metricasMesResult[0].planillas_mes || 0;
    const pabellonesMes = pabellonesMesUnicosResult[0].pabellones_mes_unicos || 0; // CORREGIDO: pabellones únicos
    const mts2Mes = metricasMesResult[0].mts2_mes || 0;
    const planillasMesAnterior = metricasMesAnteriorResult[0].planillas_mes_anterior || 0;
    const pabellonesMesAnterior = pabellonesMesAnteriorUnicosResult[0].pabellones_mes_anterior_unicos || 0; // CORREGIDO: pabellones únicos
    const mts2MesAnterior = metricasMesAnteriorResult[0].mts2_mes_anterior || 0;
    
    const variacionPlanillas = planillasMesAnterior > 0 ? 
      ((planillasMes - planillasMesAnterior) / planillasMesAnterior * 100).toFixed(1) : 0;
    const variacionPabellones = pabellonesMesAnterior > 0 ? 
      ((pabellonesMes - pabellonesMesAnterior) / pabellonesMesAnterior * 100).toFixed(1) : 0;
    const variacionMts2 = mts2MesAnterior > 0 ? 
      ((mts2Mes - mts2MesAnterior) / mts2MesAnterior * 100).toFixed(1) : 0;

    // Sistema de alertas mejorado
    const alertas = [];
    
    if (eficienciaActual < 80) {
      alertas.push({
        id: 1,
        tipo: 'error',
        titulo: 'Eficiencia Operacional Crítica',
        mensaje: `La eficiencia global está en ${eficienciaActual}%, por debajo del umbral del 80%`,
        prioridad: 'alta',
        categoria: 'rendimiento',
        tiempo: 'Ahora'
      });
    }

    if (planillasPendientes > 5) {
      alertas.push({
        id: 2,
        tipo: 'warning',
        titulo: 'Planillas Pendientes',
        mensaje: `Hay ${planillasPendientes} planillas pendientes que requieren atención`,
        prioridad: 'media',
        categoria: 'operaciones',
        tiempo: 'Ahora'
      });
    }

    // Formatear datos de gráficos (incluyendo mts2) - CORREGIDO para pabellones únicos
    console.log('🔍 Formateando tendencias mensuales...');
    console.log('🔍 tendenciasMensualesResult.length:', tendenciasMensualesResult.length);
    console.log('🔍 tendenciasMensualesUnicosResult.length:', tendenciasMensualesUnicosResult.length);
    
    const tendenciasMensuales = tendenciasMensualesResult.map((item, index) => {
      const pabellonesUnicos = tendenciasMensualesUnicosResult[index]?.pabellones_unicos || 0;
      const tendencia = {
        mes: new Date(currentYear, item.mes - 1).toLocaleDateString('es-ES', { month: 'short' }),
        planillas: parseInt(item.planillas),
        pabellones: parseInt(pabellonesUnicos), // CORREGIDO: pabellones únicos
        mts2: parseInt(item.mts2)
      };
      console.log(`🔍 Tendencia ${index}:`, tendencia);
      return tendencia;
    });
    
    console.log('🎯 Tendencias formateadas finales:', tendenciasMensuales);
    console.log('📊 Total tendencias formateadas:', tendenciasMensuales.length);

    const rendimientoPorSector = rendimientoSectorResult.map((item, index) => {
      const pabellonesUnicos = rendimientoSectorUnicosResult[index]?.pabellones_total_unicos || 0;
      return {
        nombre: item.sector_nombre || 'Sin sector',
        planillas: parseInt(item.planillas),
        pabellones: parseInt(pabellonesUnicos), // CORREGIDO: pabellones únicos
        mts2: parseInt(item.mts2_total)
      };
    });

    const response = {
      // Métricas principales - incluyendo mts2
      totalPlanillas,
      planillasActivas,
      planillasCompletadas,
      planillasPendientes,
      planillasCanceladas,
      totalMaquinas,
      totalOperadores,
      totalSectores,
      totalBarredores,
      totalPabellones: pabellonesPorPlanillaResult[0].total_pabellones_unicos, // CORREGIDO: pabellones únicos
      totalMts2: totalPlanillasResult[0].total_mts2,
      
      // NUEVO: Operadores activos (operadores que han trabajado en el último mes)
      operadoresActivos,
      
      // Métricas del mes (reales) - incluyendo mts2 - CORREGIDO para pabellones únicos
      planillasMes,
      pabellonesMes, // Ya está corregido arriba
      mts2Mes: metricasMesResult[0].mts2_mes,
      planillasMesAnterior,
      pabellonesMesAnterior, // Ya está corregido arriba
      mts2MesAnterior: metricasMesAnteriorResult[0].mts2_mes_anterior,
      
      // Variaciones (reales) - incluyendo mts2
      variacionPlanillas: parseFloat(variacionPlanillas),
      variacionPabellones: parseFloat(variacionPabellones),
      variacionMts2: parseFloat(variacionMts2),
      
      // Eficiencia mejorada
      eficienciaGlobal: eficienciaActual,
      eficienciaPromedio, // NUEVO: Eficiencia basada en pabellones limpiados
      
      // Daños (mantener por ahora)
      danosMes: 3,
      danosPorTipo: [],
      
      // Alertas
      alertas,
      
      // Datos reales para gráficos
      charts: {
        tendenciasMensuales,
        rendimientoPorSector
      },
      
      // Metadatos
      metadata: {
        origen: origen || 'todos',
        year: currentYear,
        timestamp: new Date().toISOString(),
        fuente: 'planilla'
      }
    };

    // Guardar en cache
    metricsCache = response;
    cacheTimestamp = Date.now();

    console.log('Respuesta preparada con datos reales desde vista unificada vw_ordenes_unificada_completa');
    res.json(response);

  } catch (error) {
    console.error('Error obteniendo métricas del dashboard:', error);
    
    // Si hay cache disponible, servir desde cache en caso de error
    if (metricsCache) {
      console.log('Sirviendo datos desde cache debido a error');
      return res.json(metricsCache);
    }
    
    // Respuesta de fallback rápida - incluyendo mts2
    const fallbackResponse = {
      totalPlanillas: 0,
      planillasActivas: 0,
      planillasCompletadas: 0,
      planillasPendientes: 0,
      planillasCanceladas: 0,
      totalMaquinas: 0,
      totalOperadores: 0,
      totalSectores: 0,
      totalBarredores: 0,
      totalPabellones: 0,
      totalMts2: 0,
      operadoresActivos: 0, // NUEVO
      planillasMes: 0,
      pabellonesMes: 0,
      mts2Mes: 0,
      planillasMesAnterior: 0,
      pabellonesMesAnterior: 0,
      mts2MesAnterior: 0,
      variacionPlanillas: 0,
      variacionPabellones: 0,
      variacionMts2: 0,
      eficienciaGlobal: 0,
      eficienciaPromedio: 0, // NUEVO
      danosMes: 0,
      danosPorTipo: [],
      alertas: [],
      charts: {
        tendenciasMensuales: [],
        rendimientoPorSector: []
      },
      metadata: {
        origen: 'error',
        year: new Date().getFullYear(),
        timestamp: new Date().toISOString(),
        fuente: 'fallback'
      }
    };
    
    res.json(fallbackResponse);
  }
};

exports.getChartData = async (req, res) => {
  try {
    console.log('Obteniendo datos de gráficos...');
    
    // Obtener parámetros de filtro
    const { origen, year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const queryTimeout = 5000; // 5 segundos para consultas más complejas
    
    // Construir filtros para la vista unificada
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    // Mapear valores de origen a los valores reales en la base de datos
    const sourceValue = mapOrigenToSource(origen);
    
    if (sourceValue) {
      whereClause += ' AND source COLLATE utf8mb4_unicode_ci = ?';
      params.push(sourceValue);
    }
    
    // 1. Planillas por estado desde vista unificada
    const [planillasPorEstadoResult] = await sequelize.query(`
      SELECT 
        nombreEstado as estado,
        COUNT(*) as cantidad
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreEstado
      ORDER BY cantidad DESC
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 2. Planillas por mes (últimos 12 meses)
    const [planillasPorMesResult] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as periodo,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m')
      ORDER BY periodo ASC
    `, { 
      replacements: sourceValue ? [sourceValue] : [],
      timeout: queryTimeout 
    });
    
    // 3. Top sectores por rendimiento
    const [topSectoresResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(*) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(cantLimpiar), 0) as pabellones_limpiados
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSector
      ORDER BY pabellones_total DESC
      LIMIT 10
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });

    // Formatear datos
    const planillasPorEstado = planillasPorEstadoResult.map(item => ({
      estado: item.estado || 'Sin estado',
      cantidad: parseInt(item.cantidad)
    }));
    
    const planillasPorMes = planillasPorMesResult.map(item => ({
      periodo: item.periodo,
      cantidad: parseInt(item.cantidad),
      pabellones_total: parseInt(item.pabellones_total)
    }));
    
    const topSectores = topSectoresResult.map(item => ({
      sector: item.sector_nombre || 'Sin sector',
      planillas: parseInt(item.planillas),
      pabellones_total: parseInt(item.pabellones_total),
      pabellones_limpiados: parseInt(item.pabellones_limpiados)
    }));

    const response = {
      planillasPorEstado,
      planillasPorMes,
      topSectores,
      metadata: {
        origen: origen || 'todos',
        year: currentYear,
        timestamp: new Date().toISOString(),
        fuente: 'planilla'
      }
    };

    console.log('Datos de gráficos obtenidos desde vista unificada vw_ordenes_unificada_completa');
    res.json(response);

  } catch (error) {
    console.error('Error obteniendo datos de gráficos:', error);
    
    const fallbackResponse = {
      planillasPorEstado: [],
      planillasPorMes: [],
      topSectores: [],
      metadata: {
        origen: 'error',
        year: new Date().getFullYear(),
        timestamp: new Date().toISOString(),
        fuente: 'fallback'
      }
    };
    
    res.json(fallbackResponse);
  }
};

// Endpoint para limpiar cache (útil para desarrollo)
exports.clearCache = async (req, res) => {
  try {
    metricsCache = null;
    cacheTimestamp = null;
    console.log('Cache limpiado');
    res.json({ message: 'Cache limpiado exitosamente' });
  } catch (error) {
    console.error('Error limpiando cache:', error);
    res.status(500).json({ message: 'Error limpiando cache' });
  }
};

// Nuevo endpoint para estadísticas unificadas usando tablas existentes
exports.getUnifiedStats = async (req, res) => {
  try {
    console.log('Obteniendo estadísticas unificadas...');
    
    const { origen, year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : null;
    
    const queryTimeout = 10000; // 10 segundos para consultas complejas
    
    // Construir filtros para la vista unificada
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    // Mapear valores de origen a los valores reales en la base de datos
    const sourceValue = mapOrigenToSource(origen);
    
    if (sourceValue) {
      whereClause += ' AND source COLLATE utf8mb4_unicode_ci = ?';
      params.push(sourceValue);
    }
    
    if (currentMonth) {
      whereClause += ' AND MONTH(fechaOrdenServicio) = ?';
      params.push(currentMonth);
    }
    
    // 1. Resumen general desde vista unificada
    const [resumenResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_planillas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantLimpiar), 0) as total_pabellones_limpiados,
        COALESCE(AVG(cantidadPabellones), 0) as promedio_pabellones_por_planilla,
        COUNT(DISTINCT nombreSector) as sectores_activos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 2. Distribución por estado
    const [estadosResult] = await sequelize.query(`
      SELECT 
        nombreEstado as estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreEstado
      ORDER BY cantidad DESC
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 3. Top 10 supervisores
    const [supervisoresResult] = await sequelize.query(`
      SELECT 
        nombreSupervisor as supervisor_nombre,
        COUNT(*) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(cantLimpiar), 0) as pabellones_limpiados
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSupervisor
      ORDER BY pabellones_total DESC
      LIMIT 10
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    // 4. Evolución mensual (últimos 12 meses)
    const [evolucionResult] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as periodo,
        COUNT(*) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(cantLimpiar), 0) as pabellones_limpiados
      FROM vw_ordenes_unificada_completa
      WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m')
      ORDER BY periodo ASC
    `, { 
      replacements: sourceValue ? [sourceValue] : [],
      timeout: queryTimeout 
    });

    // Formatear respuesta
    const response = {
      resumen: {
        total_planillas: parseInt(resumenResult[0].total_planillas),
        total_mt2: 0, // No disponible en esta vista
        total_pabellones_limpiados: parseInt(resumenResult[0].total_pabellones_limpiados),
        promedio_mt2_por_planilla: 0, // No disponible en esta vista
        sectores_activos: parseInt(resumenResult[0].sectores_activos)
      },
      estados: estadosResult.map(item => ({
        estado: item.estado || 'Sin estado',
        cantidad: parseInt(item.cantidad),
        pabellones_total: parseInt(item.pabellones_total)
      })),
      supervisores: supervisoresResult.map(item => ({
        supervisor: item.supervisor_nombre || 'Sin supervisor',
        planillas: parseInt(item.planillas),
        pabellones_total: parseInt(item.pabellones_total),
        pabellones_limpiados: parseInt(item.pabellones_limpiados)
      })),
      evolucion: evolucionResult.map(item => ({
        periodo: item.periodo,
        planillas: parseInt(item.planillas),
        pabellones_total: parseInt(item.pabellones_total),
        pabellones_limpiados: parseInt(item.pabellones_limpiados)
      })),
      metadata: {
        origen: origen || 'todos',
        year: currentYear,
        month: currentMonth,
        timestamp: new Date().toISOString(),
        fuente: 'planilla'
      }
    };

    console.log('Estadísticas unificadas obtenidas desde vista vw_ordenes_unificada_completa');
    res.json(response);

  } catch (error) {
    console.error('Error obteniendo estadísticas unificadas:', error);
    
    const fallbackResponse = {
      resumen: {
        total_planillas: 0,
        total_mt2: 0,
        total_pabellones_limpiados: 0,
        promedio_mt2_por_planilla: 0,
        sectores_activos: 0
      },
      estados: [],
      supervisores: [],
      evolucion: [],
      metadata: {
        origen: 'error',
        year: new Date().getFullYear(),
        timestamp: new Date().toISOString(),
        fuente: 'fallback'
      }
    };
    
    res.json(fallbackResponse);
  }
};

exports.getDanoStats = async (req, res) => {
  try {
    console.log('Obteniendo estadísticas de daños...');
    
    // Verificar si el cache está invalidado por cambios en daños
    const isCacheInvalid = danoController.isDashboardCacheInvalid();
    
    // Si el cache está invalidado, resetearlo
    if (isCacheInvalid) {
      console.log('Cache invalidado, actualizando estadísticas de daños...');
      danoController.resetDashboardCache();
    }
    
    const queryTimeout = 8000; // 8 segundos para consultas más complejas
    
    // Leer año y mes de la query
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;
    const previousYear = year - 1;
    
    // Helper para filtro de fechas
    function getDateRange(y, m) {
      if (m) {
        return {
          [Op.gte]: new Date(y, m - 1, 1),
          [Op.lt]: new Date(y, m, 1)
        };
      } else {
        return {
          [Op.gte]: new Date(y, 0, 1),
          [Op.lt]: new Date(y + 1, 0, 1)
        };
      }
    }
    
    // 1. TOTAL DAÑOS POR AÑO
    const danosAnoActual = await Dano.count({
      where: {
        planilla_id: {
          [Op.in]: sequelize.literal(`(
            SELECT id FROM planilla 
            WHERE YEAR(fecha_inicio) = ${year}
          )`)
        }
      },
      timeout: queryTimeout
    });
    
    const danosAnoAnterior = await Dano.count({
      where: {
        planilla_id: {
          [Op.in]: sequelize.literal(`(
            SELECT id FROM planilla 
            WHERE YEAR(fecha_inicio) = ${previousYear}
          )`)
        }
      },
      timeout: queryTimeout
    });
    
    // 2. RESUMEN DE DAÑOS POR MES (año o mes actual)
    const danosPorMes = await Dano.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('Planilla.fecha_inicio')), 'mes'],
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'cantidad']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: getDateRange(year, null)
        }
      }],
      group: [sequelize.fn('MONTH', sequelize.col('Planilla.fecha_inicio'))],
      order: [[sequelize.fn('MONTH', sequelize.col('Planilla.fecha_inicio')), 'ASC']],
      raw: true,
      timeout: queryTimeout
    });
    
    // 3. RESUMEN DE DAÑOS POR ZONA (año y mes si aplica)
    const danosPorZona = await Dano.findAll({
      attributes: [
        [sequelize.col('Planilla->Sector.nombre'), 'zona'],
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'cantidad']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: getDateRange(year, month)
        },
        include: [{
          model: Sector,
          as: 'Sector',
          attributes: ['nombre']
        }]
      }],
      group: [sequelize.col('Planilla->Sector.nombre')],
      order: [[sequelize.fn('COUNT', sequelize.col('Dano.id')), 'DESC']],
      raw: true,
      timeout: queryTimeout
    });
    
    // 4. TOTAL ANUAL POR ZONA (año y mes si aplica)
    const totalAnualPorZona = await Dano.findAll({
      attributes: [
        [sequelize.col('Planilla->Sector.nombre'), 'zona'],
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'total_anual']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: getDateRange(year, month)
        },
        include: [{
          model: Sector,
          as: 'Sector',
          attributes: ['nombre']
        }]
      }],
      group: [sequelize.col('Planilla->Sector.nombre')],
      order: [[sequelize.fn('COUNT', sequelize.col('Dano.id')), 'DESC']],
      raw: true,
      timeout: queryTimeout
    });
    
    // 5. TOTAL GENERAL (solo daños con planilla válida)
    const totalGeneral = await Dano.count({
      include: [{
        model: Planilla,
        as: 'Planilla',
        required: true // Solo daños con planilla existente
      }],
      timeout: queryTimeout
    });
    
    // 6. DAÑOS POR TIPO (año y mes si aplica)
    const danosPorTipo = await Dano.findAll({
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'cantidad']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: getDateRange(year, month)
        }
      }],
      group: ['tipo'],
      raw: true,
      timeout: queryTimeout
    });
    
    // 7. DAÑOS POR MES (últimos 12 meses)
    const ultimos12Meses = await Dano.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('Planilla.fecha_inicio'), '%Y-%m'), 'periodo'],
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'cantidad']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: {
            [Op.gte]: new Date(year - 1, 0, 1)
          }
        }
      }],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('Planilla.fecha_inicio'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('Planilla.fecha_inicio'), '%Y-%m'), 'DESC']],
      limit: 12,
      raw: true,
      timeout: queryTimeout
    });

    // 8. DATOS PARA HEATMAP (por día y mes del año actual)
    const heatmapData = await Dano.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('Planilla.fecha_inicio')), 'mes'],
        [sequelize.fn('DAY', sequelize.col('Planilla.fecha_inicio')), 'dia'],
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'cantidad']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1)
          }
        }
      }],
      group: [
        sequelize.fn('MONTH', sequelize.col('Planilla.fecha_inicio')),
        sequelize.fn('DAY', sequelize.col('Planilla.fecha_inicio'))
      ],
      raw: true,
      timeout: queryTimeout
    });
    
    // 9. ANÁLISIS PREDICTIVO - TENDENCIAS Y PATRONES
    const tendenciasPredictivas = await Dano.findAll({
      attributes: [
        [sequelize.fn('WEEKDAY', sequelize.col('Planilla.fecha_inicio')), 'dia_semana'],
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'cantidad'],
        [sequelize.fn('AVG', sequelize.col('Dano.cantidad')), 'promedio_cantidad']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: getDateRange(year, null)
        }
      }],
      group: [sequelize.fn('WEEKDAY', sequelize.col('Planilla.fecha_inicio'))],
      raw: true,
      timeout: queryTimeout
    });
    
    // 10. ANÁLISIS DE CRITICIDAD - DAÑOS POR SEVERIDAD
    const danosPorCriticidad = await Dano.findAll({
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('Dano.id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('Dano.cantidad')), 'total_unidades'],
        [sequelize.fn('AVG', sequelize.col('Dano.cantidad')), 'promedio_unidades']
      ],
      include: [{
        model: Planilla,
        as: 'Planilla',
        attributes: [],
        where: {
          fecha_inicio: getDateRange(year, month)
        }
      }],
      group: ['tipo'],
      raw: true,
      timeout: queryTimeout
    });
    
    // 11. ANÁLISIS DE EFICIENCIA - DAÑOS VS PLANILLAS
    const eficienciaDanos = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_planillas,
        COUNT(d.id) as total_danos,
        ROUND((COUNT(d.id) / COUNT(DISTINCT p.id)) * 100, 2) as porcentaje_planillas_con_danos,
        ROUND(AVG(d.cantidad), 2) as promedio_danos_por_planilla
      FROM planilla p
      LEFT JOIN dano d ON p.id = d.planilla_id
      WHERE YEAR(p.fecha_inicio) = ?
      ${month ? 'AND MONTH(p.fecha_inicio) = ?' : ''}
    `, {
      replacements: month ? [year, month] : [year],
      timeout: queryTimeout
    });
    
    // 12. ALERTAS INTELIGENTES
    const alertas = [];
    
    // Alerta por aumento de daños
    const variacionDanos = danosAnoAnterior > 0 ? 
      ((danosAnoActual - danosAnoAnterior) / danosAnoAnterior * 100) : 0;
    
    if (variacionDanos > 20) {
      alertas.push({
        id: 1,
        tipo: 'error',
        titulo: 'Aumento Crítico de Daños',
        mensaje: `Los daños han aumentado un ${variacionDanos.toFixed(1)}% respecto al año anterior`,
        prioridad: 'alta',
        categoria: 'tendencia',
        tiempo: 'Ahora'
      });
    }
    
    // Alerta por zonas críticas
    const zonaMasCritica = danosPorZona[0];
    if (zonaMasCritica && zonaMasCritica.cantidad > 50) {
      alertas.push({
        id: 2,
        tipo: 'warning',
        titulo: 'Zona Crítica Detectada',
        mensaje: `La zona ${zonaMasCritica.zona} tiene ${zonaMasCritica.cantidad} daños registrados`,
        prioridad: 'media',
        categoria: 'zona',
        tiempo: 'Ahora'
      });
    }
    
    // Alerta por eficiencia baja
    const eficienciaData = eficienciaDanos[0][0];
    if (eficienciaData && eficienciaData.porcentaje_planillas_con_danos > 30) {
      alertas.push({
        id: 3,
        tipo: 'info',
        titulo: 'Eficiencia Operacional',
        mensaje: `El ${eficienciaData.porcentaje_planillas_con_danos}% de las planillas tienen daños registrados`,
        prioridad: 'baja',
        categoria: 'eficiencia',
        tiempo: 'Ahora'
      });
    }
    
    // Formatear datos para el frontend
    const response = {
      totalAnual: {
        actual: danosAnoActual,
        anterior: danosAnoAnterior,
        variacion: parseFloat(variacionDanos.toFixed(1))
      },
      porMes: danosPorMes.map(item => ({
        mes: item.mes,
        cantidad: parseInt(item.cantidad),
        nombreMes: new Date(year, item.mes - 1).toLocaleDateString('es-ES', { month: 'long' })
      })),
      porZona: danosPorZona.map(item => ({
        zona: item.zona || 'Sin zona',
        cantidad: parseInt(item.cantidad)
      })),
      totalAnualPorZona: totalAnualPorZona.map(item => ({
        zona: item.zona || 'Sin zona',
        total: parseInt(item.total_anual)
      })),
      totalGeneral,
      porTipo: danosPorTipo.map(item => ({
        tipo: item.tipo || 'Sin tipo',
        cantidad: parseInt(item.cantidad)
      })),
      ultimos12Meses: ultimos12Meses.map(item => ({
        periodo: item.periodo,
        cantidad: parseInt(item.cantidad)
      })),
      heatmapData: heatmapData.map(item => ({
        mes: parseInt(item.mes),
        dia: parseInt(item.dia),
        cantidad: parseInt(item.cantidad)
      })),
      // Nuevos datos analíticos
      tendenciasPredictivas: tendenciasPredictivas.map(item => ({
        diaSemana: item.dia_semana,
        cantidad: parseInt(item.cantidad),
        promedioCantidad: parseFloat(item.promedio_cantidad || 0)
      })),
      danosPorCriticidad: danosPorCriticidad.map(item => ({
        tipo: item.tipo || 'Sin tipo',
        cantidad: parseInt(item.cantidad),
        totalUnidades: parseInt(item.total_unidades || 0),
        promedioUnidades: parseFloat(item.promedio_unidades || 0)
      })),
      eficiencia: {
        totalPlanillas: parseInt(eficienciaData?.total_planillas || 0),
        totalDanos: parseInt(eficienciaData?.total_danos || 0),
        porcentajePlanillasConDanos: parseFloat(eficienciaData?.porcentaje_planillas_con_danos || 0),
        promedioDanosPorPlanilla: parseFloat(eficienciaData?.promedio_danos_por_planilla || 0)
      },
      alertas,
      metadata: {
        year,
        month,
        timestamp: new Date().toISOString(),
        fuente: 'analisis_avanzado'
      }
    };
    
    console.log('Estadísticas de daños obtenidas exitosamente');
    res.json(response);
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de daños:', error);
    
    // Respuesta de fallback
    const fallbackResponse = {
      totalAnual: { actual: 0, anterior: 0, variacion: 0 },
      porMes: [],
      porZona: [],
      totalAnualPorZona: [],
      totalGeneral: 0,
      porTipo: [],
      ultimos12Meses: [],
      heatmapData: [],
      tendenciasPredictivas: [],
      danosPorCriticidad: [],
      eficiencia: {
        totalPlanillas: 0,
        totalDanos: 0,
        porcentajePlanillasConDanos: 0,
        promedioDanosPorPlanilla: 0
      },
      alertas: [],
      metadata: {
        year: new Date().getFullYear(),
        timestamp: new Date().toISOString(),
        fuente: 'fallback'
      }
    };
    
    res.json(fallbackResponse);
  }
};

// Nuevo método para análisis predictivo avanzado
exports.getDanoPredictiveAnalysis = async (req, res) => {
  try {
    console.log('Obteniendo análisis predictivo de daños...');
    
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const queryTimeout = 10000;
    
    // 1. ANÁLISIS DE PATRONES TEMPORALES
    const patronesTemporales = await sequelize.query(`
      SELECT 
        MONTH(p.fecha_inicio) as mes,
        DAYOFWEEK(p.fecha_inicio) as dia_semana,
        COUNT(d.id) as cantidad_danos,
        AVG(d.cantidad) as promedio_cantidad,
        COUNT(DISTINCT p.id) as planillas_afectadas
      FROM planilla p
      LEFT JOIN dano d ON p.id = d.planilla_id
      WHERE YEAR(p.fecha_inicio) = ?
      GROUP BY MONTH(p.fecha_inicio), DAYOFWEEK(p.fecha_inicio)
      ORDER BY mes, dia_semana
    `, {
      replacements: [currentYear],
      timeout: queryTimeout
    });
    
    // 2. ANÁLISIS DE CORRELACIÓN CON ACTIVIDAD
    const correlacionActividad = await sequelize.query(`
      SELECT 
        s.nombre as sector,
        COUNT(p.id) as total_planillas,
        COUNT(d.id) as total_danos,
        ROUND((COUNT(d.id) / COUNT(p.id)) * 100, 2) as ratio_danos_planilla,
        AVG(d.cantidad) as promedio_danos_por_incidente
      FROM sector s
      LEFT JOIN planilla p ON s.id = p.sector_id
      LEFT JOIN dano d ON p.id = d.planilla_id
      WHERE YEAR(p.fecha_inicio) = ?
      GROUP BY s.id, s.nombre
      HAVING total_planillas > 0
      ORDER BY ratio_danos_planilla DESC
    `, {
      replacements: [currentYear],
      timeout: queryTimeout
    });
    
    // 3. PREDICCIÓN BASADA EN TENDENCIAS HISTÓRICAS
    const tendenciasHistoricas = await sequelize.query(`
      SELECT 
        YEAR(p.fecha_inicio) as anio,
        MONTH(p.fecha_inicio) as mes,
        COUNT(d.id) as cantidad_danos,
        AVG(d.cantidad) as promedio_cantidad,
        COUNT(DISTINCT p.id) as planillas_afectadas
      FROM planilla p
      LEFT JOIN dano d ON p.id = d.planilla_id
      WHERE YEAR(p.fecha_inicio) >= ? - 2
      GROUP BY YEAR(p.fecha_inicio), MONTH(p.fecha_inicio)
      ORDER BY anio, mes
    `, {
      replacements: [currentYear],
      timeout: queryTimeout
    });
    
    // 4. ANÁLISIS DE ESTACIONALIDAD
    const estacionalidad = await sequelize.query(`
      SELECT 
        MONTH(p.fecha_inicio) as mes,
        COUNT(d.id) as cantidad_danos,
        AVG(d.cantidad) as promedio_cantidad,
        STDDEV(d.cantidad) as desviacion_estandar
      FROM planilla p
      LEFT JOIN dano d ON p.id = d.planilla_id
      WHERE YEAR(p.fecha_inicio) >= ? - 1
      GROUP BY MONTH(p.fecha_inicio)
      ORDER BY mes
    `, {
      replacements: [currentYear],
      timeout: queryTimeout
    });
    
    // 5. CALCULAR PREDICCIONES
    const predicciones = [];
    const mesesActuales = patronesTemporales[0].filter(item => item.mes <= new Date().getMonth() + 1);
    const promedioMensual = mesesActuales.length > 0 ? 
      mesesActuales.reduce((sum, item) => sum + item.cantidad_danos, 0) / mesesActuales.length : 0;
    
    // Predicción para los próximos 6 meses
    for (let i = 1; i <= 6; i++) {
      const mesPrediccion = (new Date().getMonth() + i) % 12 || 12;
      const datosHistoricos = estacionalidad[0].find(item => item.mes === mesPrediccion);
      
      let prediccion = promedioMensual;
      if (datosHistoricos) {
        // Ajustar por estacionalidad
        const factorEstacional = datosHistoricos.cantidad_danos / promedioMensual;
        prediccion = promedioMensual * factorEstacional;
      }
      
      predicciones.push({
        mes: mesPrediccion,
        nombreMes: new Date(currentYear, mesPrediccion - 1).toLocaleDateString('es-ES', { month: 'long' }),
        prediccion: Math.round(prediccion),
        confianza: Math.max(0.6, 1 - (i * 0.1)), // Confianza decrece con el tiempo
        rango: {
          minimo: Math.round(prediccion * 0.7),
          maximo: Math.round(prediccion * 1.3)
        }
      });
    }
    
    const response = {
      patronesTemporales: patronesTemporales[0].map(item => ({
        mes: item.mes,
        diaSemana: item.dia_semana,
        cantidadDanos: parseInt(item.cantidad_danos || 0),
        promedioCantidad: parseFloat(item.promedio_cantidad || 0),
        planillasAfectadas: parseInt(item.planillas_afectadas || 0)
      })),
      correlacionActividad: correlacionActividad[0].map(item => ({
        sector: item.sector,
        totalPlanillas: parseInt(item.total_planillas),
        totalDanos: parseInt(item.total_danos || 0),
        ratioDanosPlanilla: parseFloat(item.ratio_danos_planilla || 0),
        promedioDanosPorIncidente: parseFloat(item.promedio_danos_por_incidente || 0)
      })),
      tendenciasHistoricas: tendenciasHistoricas[0].map(item => ({
        anio: item.anio,
        mes: item.mes,
        cantidadDanos: parseInt(item.cantidad_danos || 0),
        promedioCantidad: parseFloat(item.promedio_cantidad || 0),
        planillasAfectadas: parseInt(item.planillas_afectadas || 0)
      })),
      estacionalidad: estacionalidad[0].map(item => ({
        mes: item.mes,
        cantidadDanos: parseInt(item.cantidad_danos || 0),
        promedioCantidad: parseFloat(item.promedio_cantidad || 0),
        desviacionEstandar: parseFloat(item.desviacion_estandar || 0)
      })),
      predicciones,
      metadata: {
        year: currentYear,
        timestamp: new Date().toISOString(),
        fuente: 'analisis_predictivo'
      }
    };
    
    console.log('Análisis predictivo de daños obtenido exitosamente');
    res.json(response);
    
  } catch (error) {
    console.error('Error obteniendo análisis predictivo:', error);
    
    const fallbackResponse = {
      patronesTemporales: [],
      correlacionActividad: [],
      tendenciasHistoricas: [],
      estacionalidad: [],
      predicciones: [],
      metadata: {
        year: new Date().getFullYear(),
        timestamp: new Date().toISOString(),
        fuente: 'fallback'
      }
    };
    
    res.json(fallbackResponse);
  }
}; 

// NUEVA FUNCIÓN: Daños por Operador - Usando Vista Unificada
exports.getDanoStatsPorOperador = async (req, res) => {
  try {
    console.log('🔄 Iniciando obtención de estadísticas de daños por operador desde vista unificada...');
    
    // Obtener parámetros de filtro
    const { year, origen } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Configurar timeout para consultas
    const queryTimeout = 12000;
    
    // Construir filtros para la vista unificada
    let whereClause = 'WHERE YEAR(v.fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    if (origen && origen !== 'todos') {
      whereClause += ' AND v.source COLLATE utf8mb4_unicode_ci = ?';
      params.push(origen);
    }
    
    // 1. RESUMEN ANUAL POR TIPO (HEMBRA/MACHO) - CON JOIN REAL Y SUMA
    const [resumenAnualTipoResult] = await sequelize.query(`
      SELECT 
        COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona,
        MONTH(v.fechaOrdenServicio) as mes,
        SUM(v.cantidadDano) as cantidad_total_danos
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      ${whereClause}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY 
        COALESCE(z.tipo, 'SIN_CLASIFICAR'),
        MONTH(v.fechaOrdenServicio)
      ORDER BY tipo_zona, mes
    `, {
      replacements: params,
      timeout: queryTimeout
    });
    
    // 2. DAÑOS MENSUALES POR OPERADOR - CON JOIN REAL Y SUMA
    const [danosMensualesPorOperadorResult] = await sequelize.query(`
      SELECT 
        v.nombreOperador as nombre_completo,
        MONTH(v.fechaOrdenServicio) as mes,
        SUM(v.cantidadDano) as cantidad_total_danos,
        COALESCE(z.tipo, 'SIN_CLASIFICAR') as tipo_zona
      FROM vw_ordenes_unificada_completa v
      LEFT JOIN sector s ON v.nombreSector = s.nombre
      LEFT JOIN zona z ON s.zona_id = z.id
      ${whereClause}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY v.nombreOperador, MONTH(v.fechaOrdenServicio), COALESCE(z.tipo, 'SIN_CLASIFICAR')
      ORDER BY v.nombreOperador, mes
    `, {
      replacements: params,
      timeout: queryTimeout
    });
    
    // 3. TOP OPERADORES CON MÁS DAÑOS (por suma)
    const [topOperadoresResult] = await sequelize.query(`
      SELECT 
        v.nombreOperador as nombre_completo,
        SUM(v.cantidadDano) as cantidad_total_danos,
        COUNT(DISTINCT MONTH(v.fechaOrdenServicio)) as meses_con_danos,
        COUNT(DISTINCT v.idOrdenServicio) as planillas_afectadas,
        ROUND(AVG(v.cantidadDano), 2) as promedio_danos_por_incidente
      FROM vw_ordenes_unificada_completa v
      ${whereClause.replace('v.', '')}
      AND v.cantidadDano > 0
      AND v.nombreOperador != 'Sin operador'
      GROUP BY v.nombreOperador
      HAVING cantidad_total_danos > 0
      ORDER BY cantidad_total_danos DESC
      LIMIT 10
    `, {
      replacements: params,
      timeout: queryTimeout
    });
    
    // Procesar datos para el formato requerido
    const resumenAnualTipo = {
      HEMBRA: { total: 0, meses: {} },
      MACHO: { total: 0, meses: {} },
      SIN_CLASIFICAR: { total: 0, meses: {} }
    };
    
    // Inicializar meses para todos los tipos
    for (let mes = 1; mes <= 12; mes++) {
      resumenAnualTipo.HEMBRA.meses[mes] = 0;
      resumenAnualTipo.MACHO.meses[mes] = 0;
      resumenAnualTipo.SIN_CLASIFICAR.meses[mes] = 0;
    }
    
    // Procesar datos del resumen anual
    resumenAnualTipoResult.forEach(item => {
      const tipo = item.tipo_zona;
      const mes = item.mes;
      const total = parseInt(item.cantidad_total_danos || 0);
      if (resumenAnualTipo[tipo]) {
        resumenAnualTipo[tipo].meses[mes] = total;
        resumenAnualTipo[tipo].total += total;
      }
    });
    
    // Procesar datos mensuales por operador
    const operadoresMensuales = {};
    const nombresMeses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
      'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'
    ];
    
    danosMensualesPorOperadorResult.forEach(item => {
      const operador = item.nombre_completo;
      const mes = item.mes;
      const total = parseInt(item.cantidad_total_danos || 0);
      const tipoZona = item.tipo_zona;
      
      if (!operadoresMensuales[operador]) {
        operadoresMensuales[operador] = {
          nombre: operador,
          tipoZona: tipoZona,
          meses: {},
          totalAnual: 0
        };
        // Inicializar todos los meses en 0
        for (let m = 1; m <= 12; m++) {
          operadoresMensuales[operador].meses[m] = 0;
        }
      }
      operadoresMensuales[operador].meses[mes] = total;
      operadoresMensuales[operador].totalAnual += total;
    });
    
    // Convertir a array y ordenar por total anual descendente
    const operadoresArray = Object.values(operadoresMensuales)
      .sort((a, b) => b.totalAnual - a.totalAnual);
    
    // Calcular totales anuales
    const totalDanos = Object.values(resumenAnualTipo).reduce((sum, tipo) => sum + tipo.total, 0);
    const totalesAnuales = {
      totalOperadores: operadoresArray.length,
      totalDanos: totalDanos,
      cantidadTotalDanos: totalDanos,
      totalPlanillasAfectadas: 0,
      promedioDanosPorOperador: operadoresArray.length > 0 ? 
        Math.round((totalDanos / operadoresArray.length) * 100) / 100 : 0
    };
    
    const response = {
      resumenAnualTipo,
      operadoresMensuales: operadoresArray,
      topOperadores: topOperadoresResult.map(item => ({
        nombreCompleto: item.nombre_completo,
        cantidadTotalDanos: parseInt(item.cantidad_total_danos || 0),
        mesesConDanos: parseInt(item.meses_con_danos || 0),
        planillasAfectadas: parseInt(item.planillas_afectadas || 0),
        promedioDanosPorIncidente: parseFloat(item.promedio_danos_por_incidente || 0)
      })),
      totalesAnuales,
      nombresMeses,
      metadata: {
        year: currentYear,
        currentMonth: currentMonth,
        timestamp: new Date().toISOString(),
        fuente: 'vw_ordenes_unificada_completa con JOIN sector-zona y SUM',
        filtros: {
          year: currentYear,
          origen: origen || 'todos'
        }
      }
    };
    
    console.log('✅ Estadísticas de daños por operador obtenidas exitosamente');
    console.log(`📊 Resumen: HEMBRA=${resumenAnualTipo.HEMBRA.total}, MACHO=${resumenAnualTipo.MACHO.total}, SIN_CLASIFICAR=${resumenAnualTipo.SIN_CLASIFICAR.total}, TOTAL=${totalDanos}`);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de daños por operador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Método para obtener métricas de consumo de petróleo por máquina
exports.getPetroleoMetrics = async (req, res) => {
  try {
    console.log('🔍 Iniciando obtención de métricas de consumo de petróleo...');
    
    // Obtener parámetros de filtro
    const { origen, year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month && month !== 'todos' ? parseInt(month) : null;
    
    // Construir filtros para la vista unificada - usar TODOS los datos de vw_ordenes_unificada_completa
    let whereClause = `WHERE YEAR(fechaOrdenServicio) = ${currentYear} AND litrosPetroleo IS NOT NULL AND litrosPetroleo > 0`;
    
    // Agregar filtro de mes si se especifica
    if (currentMonth) {
      whereClause += ` AND MONTH(fechaOrdenServicio) = ${currentMonth}`;
    }
    
    // No aplicar filtro de source para usar todos los datos de la vista unificada

    // 1. INDICADOR PRINCIPAL: Litros de petróleo consumido por máquina (calculado por máquina individual)
    const [litrosPorMaquinaResult] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(DISTINCT idOrdenServicio) as totalOrdenesServicio,
        COUNT(*) as totalRegistros,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorRegistro,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellon,
        CASE 
          WHEN SUM(mts2) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(mts2), 4)
          ELSE 0 
        END as litrosPorMts2
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nroMaquina
      HAVING totalLitros > 0
      ORDER BY totalLitros DESC
    `);

    // 2. Estadísticas generales de consumo de petróleo - CORREGIDO (lógica correcta)
    const [estadisticasGeneralesResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT nroMaquina) as totalMaquinas,
        COUNT(DISTINCT idOrdenServicio) as totalOrdenesServicio,
        COUNT(*) as totalRegistros,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitrosConsumidos,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellonesProcesados,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        COALESCE(SUM(kmPorMaquina), 0) as totalKmRecorridos,
        COUNT(*) as totalRegistros,
        -- CORRECCIÓN: Calcular promedio por registro (por máquina individual)
        CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND(SUM(litrosPetroleo) / COUNT(*), 2)
          ELSE 0 
        END as promedioLitrosPorRegistro,
        -- CORRECCIÓN: Calcular litros por pabellón (por máquina individual)
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellonGlobal,
        -- CORRECCIÓN: Calcular litros por m² (por máquina individual)
        CASE 
          WHEN SUM(mts2) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(mts2), 4)
          ELSE 0 
        END as litrosPorMts2Global,
        -- CORRECCIÓN: Calcular litros por km (por máquina individual)
        CASE 
          WHEN SUM(kmPorMaquina) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(kmPorMaquina), 4)
          ELSE 0 
        END as promedioLitroKm
      FROM (
        SELECT 
          *,
          CASE WHEN odometroInicio IS NOT NULL AND odometroFin IS NOT NULL AND odometroFin > odometroInicio THEN (odometroFin - odometroInicio) ELSE 0 END as kmPorMaquina
        FROM vw_ordenes_unificada_completa
        ${whereClause}
      ) as datos_agrupados
    `);

    const estadisticas = estadisticasGeneralesResult[0];
    
    // 3. Consumo mensual de petróleo - CORREGIDO (por máquina individual)
    const [consumoMensualResult] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as mes,
        DATE_FORMAT(fechaOrdenServicio, '%Y') as anio,
        MONTH(fechaOrdenServicio) as mesNumero,
        COUNT(DISTINCT idOrdenServicio) as ordenesServicio,
        COUNT(DISTINCT nroMaquina) as maquinasActivas,
        COUNT(*) as registros,
        COALESCE(SUM(litrosPetroleo), 0) as litrosConsumidos,
        COALESCE(SUM(cantidadPabellones), 0) as pabellonesProcesados,
        COALESCE(SUM(cantLimpiar), 0) as pabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as mts2Procesados,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorRegistro,
        COALESCE(SUM(kmPorMaquina), 0) as kmRecorridos,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellon,
        CASE 
          WHEN SUM(mts2) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(mts2), 4)
          ELSE 0 
        END as litrosPorMts2,
        CASE 
          WHEN SUM(kmPorMaquina) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(kmPorMaquina), 4)
          ELSE 0 
        END as litrosPorKm
      FROM (
        SELECT 
          *,
          CASE WHEN odometroInicio IS NOT NULL AND odometroFin IS NOT NULL AND odometroFin > odometroInicio THEN (odometroFin - odometroInicio) ELSE 0 END as kmPorMaquina
        FROM vw_ordenes_unificada_completa
        ${whereClause}
      ) as datos_agrupados
      GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m'), DATE_FORMAT(fechaOrdenServicio, '%Y'), MONTH(fechaOrdenServicio)
      ORDER BY mes DESC
      LIMIT 12
    `);

    // 4. Top máquinas con mayor consumo de petróleo
    const topMaquinasMayorConsumo = litrosPorMaquinaResult
      .sort((a, b) => parseFloat(b.totalLitros) - parseFloat(a.totalLitros))
      .slice(0, 10);

    // 5. Top máquinas con menor consumo de petróleo
    const topMaquinasMenorConsumo = litrosPorMaquinaResult
      .sort((a, b) => parseFloat(a.totalLitros) - parseFloat(b.totalLitros))
      .slice(0, 10);

    // 6. Consumo de petróleo por sector - CORREGIDO para mts2 único
    const [consumoPorSectorResult] = await sequelize.query(`
      SELECT 
        nombreSector,
        COUNT(DISTINCT idOrdenServicio) as ordenesServicio,
        COUNT(*) as registros,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2Unico), 0) as totalMts2,
        COALESCE(AVG(litrosPetroleo), 0) as promedioLitrosPorRegistro
      FROM (
        SELECT 
          *,
          CASE WHEN ROW_NUMBER() OVER (PARTITION BY idOrdenServicio ORDER BY idOrdenServicio) = 1 THEN mts2 ELSE 0 END as mts2Unico
        FROM vw_ordenes_unificada_completa
        ${whereClause}
      ) as datos_con_mts2_unico
      GROUP BY nombreSector
      HAVING totalLitros > 0
      ORDER BY totalLitros DESC
    `);

    // Calcular total de litros para validación
    const totalLitrosGlobal = parseFloat(estadisticas.totalLitrosConsumidos);
    
    // Mejorar la distribución de consumo por sector con datos más claros
    const distribucionConsumoPorSector = consumoPorSectorResult.map(sector => ({
      sector: sector.nombreSector,
      litros: parseFloat(sector.totalLitros),
      porcentaje: totalLitrosGlobal > 0 ? ((parseFloat(sector.totalLitros) / totalLitrosGlobal) * 100).toFixed(2) : 0,
      ordenes: parseInt(sector.ordenesServicio),
      registros: parseInt(sector.registros),
      pabellones: parseInt(sector.totalPabellones),
      pabellonesLimpiados: parseInt(sector.totalPabellonesLimpiados),
      mts2: parseFloat(sector.totalMts2),
      promedioPorRegistro: parseFloat(sector.promedioLitrosPorRegistro),
      // Calcular eficiencia del sector
      eficiencia: parseFloat(sector.totalPabellones) > 0 ? 
        (parseFloat(sector.totalLitros) / parseFloat(sector.totalPabellones)).toFixed(2) : 0
    }));

    // Calcular estadísticas de la distribución
    const estadisticasDistribucion = {
      totalSectores: distribucionConsumoPorSector.length,
      totalLitros: totalLitrosGlobal,
      promedioLitrosPorSector: totalLitrosGlobal / distribucionConsumoPorSector.length,
      sectorMayorConsumo: distribucionConsumoPorSector[0] || null,
      sectorMenorConsumo: distribucionConsumoPorSector[distribucionConsumoPorSector.length - 1] || null,
      sumaPorcentajes: distribucionConsumoPorSector.reduce((sum, sector) => sum + sector.porcentaje, 0)
    };

    // 7. Eficiencia de consumo por máquina (litros por pabellón)
    const [eficienciaConsumoResult] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(DISTINCT idOrdenServicio) as totalOrdenesServicio,
        COUNT(*) as totalRegistros,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        COALESCE(SUM(cantidadPabellones), 0) as totalPabellones,
        COALESCE(SUM(cantLimpiar), 0) as totalPabellonesLimpiados,
        COALESCE(SUM(mts2), 0) as totalMts2,
        CASE 
          WHEN SUM(cantidadPabellones) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantidadPabellones), 2)
          ELSE 0 
        END as litrosPorPabellon,
        CASE 
          WHEN SUM(cantLimpiar) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(cantLimpiar), 2)
          ELSE 0 
        END as litrosPorPabellonLimpiado,
        CASE 
          WHEN SUM(mts2) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(mts2), 4)
          ELSE 0 
        END as litrosPorMts2
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nroMaquina
      HAVING totalLitros > 0
      ORDER BY litrosPorPabellon ASC
    `);

    // Calcular métricas adicionales
    const litrosPorPabellonGlobal = estadisticas.litrosPorPabellonGlobal;
    const litrosPorMts2Global = estadisticas.litrosPorMts2Global;

    // Clasificar máquinas por eficiencia de consumo
    const clasificarEficienciaConsumo = (litrosPorPabellon) => {
      if (litrosPorPabellon <= 50) return 'Excelente';
      if (litrosPorPabellon <= 100) return 'Bueno';
      if (litrosPorPabellon <= 150) return 'Regular';
      return 'Mejorar';
    };

    // Aplicar clasificación a los datos
    const litrosPorMaquina = litrosPorMaquinaResult.map(maquina => ({
      ...maquina,
      totalLitros: parseFloat(maquina.totalLitros),
      promedioLitrosPorRegistro: parseFloat(maquina.promedioLitrosPorRegistro),
      totalPabellones: parseInt(maquina.totalPabellones),
      totalPabellonesLimpiados: parseInt(maquina.totalPabellonesLimpiados),
      totalMts2: parseFloat(maquina.totalMts2),
      litrosPorPabellon: parseFloat(maquina.litrosPorPabellon),
      litrosPorMts2: parseFloat(maquina.litrosPorMts2 || 0),
      nivelEficiencia: clasificarEficienciaConsumo(parseFloat(maquina.litrosPorPabellon)),
      porcentajeDelTotal: parseFloat(estadisticas.totalLitrosConsumidos) > 0 ? 
        ((parseFloat(maquina.totalLitros) / parseFloat(estadisticas.totalLitrosConsumidos)) * 100).toFixed(2) : 0
    }));

    const eficienciaConsumo = eficienciaConsumoResult.map(maquina => ({
      ...maquina,
      totalLitros: parseFloat(maquina.totalLitros),
      totalPabellones: parseInt(maquina.totalPabellones),
      totalPabellonesLimpiados: parseInt(maquina.totalPabellonesLimpiados),
      totalMts2: parseFloat(maquina.totalMts2),
      litrosPorPabellon: parseFloat(maquina.litrosPorPabellon),
      litrosPorPabellonLimpiado: parseFloat(maquina.litrosPorPabellonLimpiado),
      litrosPorMts2: parseFloat(maquina.litrosPorMts2),
      nivelEficiencia: clasificarEficienciaConsumo(parseFloat(maquina.litrosPorPabellon))
    }));

    // 8. Datos de kilómetros recorridos por máquina
    const [kmPorMaquinaResult] = await sequelize.query(`
      SELECT 
        nroMaquina,
        COUNT(DISTINCT idOrdenServicio) as totalOrdenesServicio,
        COUNT(*) as totalRegistros,
        COUNT(CASE WHEN odometroInicio IS NOT NULL AND odometroFin IS NOT NULL AND odometroFin > odometroInicio THEN 1 END) as registrosConKm,
        SUM(CASE WHEN odometroInicio IS NOT NULL AND odometroFin IS NOT NULL AND odometroFin > odometroInicio THEN (odometroFin - odometroInicio) ELSE 0 END) as totalKmRecorridos,
        AVG(CASE WHEN odometroInicio IS NOT NULL AND odometroFin IS NOT NULL AND odometroFin > odometroInicio THEN (odometroFin - odometroInicio) ELSE NULL END) as promedioKmRecorridos,
        COALESCE(SUM(litrosPetroleo), 0) as totalLitros,
        CASE 
          WHEN SUM(CASE WHEN odometroInicio IS NOT NULL AND odometroFin IS NOT NULL AND odometroFin > odometroInicio THEN (odometroFin - odometroInicio) ELSE 0 END) > 0 
          THEN ROUND(SUM(litrosPetroleo) / SUM(CASE WHEN odometroInicio IS NOT NULL AND odometroFin IS NOT NULL AND odometroFin > odometroInicio THEN (odometroFin - odometroInicio) ELSE 0 END), 4)
          ELSE 0 
        END as rendimientoLitroKm
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nroMaquina
      HAVING totalKmRecorridos > 0
      ORDER BY totalKmRecorridos DESC
    `);

    // Procesar datos de kilómetros
    const kmPorMaquina = kmPorMaquinaResult.map(maquina => ({
      ...maquina,
      totalKmRecorridos: parseFloat(maquina.totalKmRecorridos),
      promedioKmRecorridos: parseFloat(maquina.promedioKmRecorridos || 0),
      totalLitros: parseFloat(maquina.totalLitros),
      rendimientoLitroKm: parseFloat(maquina.rendimientoLitroKm || 0),
      registrosConKm: parseInt(maquina.registrosConKm),
      totalOrdenesServicio: parseInt(maquina.totalOrdenesServicio),
      totalRegistros: parseInt(maquina.totalRegistros)
    }));

    const response = {
      // KPIs principales
      kpis: {
        totalLitrosConsumidos: parseFloat(estadisticas.totalLitrosConsumidos),
        totalMaquinas: parseInt(estadisticas.totalMaquinas),
        totalOrdenesServicio: parseInt(estadisticas.totalOrdenesServicio),
        totalRegistros: parseInt(estadisticas.totalRegistros),
        promedioLitrosPorRegistro: parseFloat(estadisticas.promedioLitrosPorRegistro).toFixed(2),
        totalPabellonesProcesados: parseInt(estadisticas.totalPabellonesProcesados),
        totalPabellonesLimpiados: parseInt(estadisticas.totalPabellonesLimpiados),
        totalMts2: parseFloat(estadisticas.totalMts2),
        litrosPorPabellonGlobal: parseFloat(litrosPorPabellonGlobal),
        litrosPorMts2Global: parseFloat(litrosPorMts2Global),
        promedioLitroKm: parseFloat(estadisticas.promedioLitroKm || 0),
        // KPIs de kilómetros
        totalKmRecorridos: kmPorMaquina.reduce((sum, maquina) => sum + maquina.totalKmRecorridos, 0),
        promedioKmRecorridos: kmPorMaquina.length > 0 ? kmPorMaquina.reduce((sum, maquina) => sum + maquina.promedioKmRecorridos, 0) / kmPorMaquina.length : 0,
        maquinasConKm: kmPorMaquina.length,
        // KPI de rendimiento global (L/km)
        rendimientoGlobalLitroKm: parseFloat(estadisticas.promedioLitroKm || 0).toFixed(2)
      },
      
      // INDICADOR PRINCIPAL: Litros de petróleo por máquina
      litrosPorMaquina,
      
      // Rankings de consumo
      topMaquinasMayorConsumo,
      topMaquinasMenorConsumo,
      
      // Eficiencia de consumo por máquina
      eficienciaConsumo,
      
      // Datos de kilómetros recorridos por máquina
      kmPorMaquina,
      
      // Consumo por sector
      consumoPorSector: consumoPorSectorResult.map(sector => ({
        ...sector,
        totalLitros: parseFloat(sector.totalLitros),
        totalPabellones: parseInt(sector.totalPabellones),
        totalPabellonesLimpiados: parseInt(sector.totalPabellonesLimpiados),
        totalMts2: parseFloat(sector.totalMts2),
        promedioLitrosPorRegistro: parseFloat(sector.promedioLitrosPorRegistro),
        porcentajeDelTotal: totalLitrosGlobal > 0 ? ((parseFloat(sector.totalLitros) / totalLitrosGlobal) * 100).toFixed(2) : 0
      })),
      
      // NUEVA SECCIÓN: Distribución de Consumo por Sector Mejorada
      distribucionConsumoPorSector: {
        titulo: "Distribución de Consumo por Sector",
        subtitulo: "Análisis de consumo de combustible por sector operativo",
        totalSectores: estadisticasDistribucion.totalSectores,
        totalLitros: estadisticasDistribucion.totalLitros,
        sumaPorcentajes: estadisticasDistribucion.sumaPorcentajes,
        
        // MEJORAS VISUALES: Datos formateados para mejor visualización
        resumenVisual: {
          titulo: "TOTAL LITROS CONSUMIDOS",
          valor: totalLitrosGlobal.toLocaleString(),
          unidad: "L",
          sectoresActivos: estadisticasDistribucion.totalSectores,
          texto: `${estadisticasDistribucion.totalSectores} sectores activos`
        },
        
        // Gráfico de donut mejorado con datos claros
        graficoDonut: {
          titulo: "Distribución por Sector",
          subtitulo: "Porcentaje de consumo por sector operativo",
          datos: distribucionConsumoPorSector.slice(0, 8).map((sector, index) => ({
            id: index + 1,
            sector: sector.sector,
            litros: sector.litros,
            porcentaje: sector.porcentaje,
            color: [
              '#3B82F6', // Azul
              '#F59E0B', // Naranja
              '#10B981', // Verde
              '#EC4899', // Rosa
              '#8B5CF6', // Púrpura
              '#EF4444', // Rojo
              '#6B7280', // Gris
              '#FCD34D'  // Amarillo
            ][index % 8],
            // Formato para leyenda clara
            leyenda: `${sector.sector}: ${sector.litros.toLocaleString()} L (${sector.porcentaje}%)`,
            // Formato compacto para gráfico
            etiqueta: sector.sector,
            valor: sector.litros,
            porcentaje: sector.porcentaje
          })),
          total: totalLitrosGlobal,
          sumaPorcentajes: distribucionConsumoPorSector.slice(0, 8).reduce((sum, sector) => sum + sector.porcentaje, 0)
        },
        
        // Tabla de datos mejorada
        tablaSectores: {
          titulo: "Detalle por Sector",
          columnas: [
            { titulo: "Sector", campo: "sector" },
            { titulo: "Litros", campo: "litros", formato: "numero" },
            { titulo: "Porcentaje", campo: "porcentaje", formato: "porcentaje" },
            { titulo: "Órdenes", campo: "ordenes", formato: "numero" },
            { titulo: "Pabellones", campo: "pabellones", formato: "numero" },
            { titulo: "Eficiencia", campo: "eficiencia", formato: "decimal" }
          ],
          datos: distribucionConsumoPorSector.map((sector, index) => ({
            posicion: index + 1,
            sector: sector.sector,
            litros: sector.litros,
            porcentaje: sector.porcentaje,
            ordenes: sector.ordenes,
            registros: sector.registros,
            pabellones: sector.pabellones,
            pabellonesLimpiados: sector.pabellonesLimpiados,
            mts2: sector.mts2,
            promedioPorRegistro: sector.promedioPorRegistro,
            eficiencia: sector.eficiencia,
            // Formato para mostrar
            litrosFormateado: sector.litros.toLocaleString(),
            porcentajeFormateado: `${sector.porcentaje}%`,
            eficienciaFormateada: `${sector.eficiencia} L/pabellón`
          }))
        },
        
        // KPIs destacados
        kpisDestacados: {
          sectorMayorConsumo: estadisticasDistribucion.sectorMayorConsumo ? {
            titulo: "Sector Mayor Consumo",
            sector: estadisticasDistribucion.sectorMayorConsumo.sector,
            litros: estadisticasDistribucion.sectorMayorConsumo.litros,
            porcentaje: estadisticasDistribucion.sectorMayorConsumo.porcentaje,
            formateado: `${estadisticasDistribucion.sectorMayorConsumo.litros.toLocaleString()} L (${estadisticasDistribucion.sectorMayorConsumo.porcentaje}%)`
          } : null,
          sectorMenorConsumo: estadisticasDistribucion.sectorMenorConsumo ? {
            titulo: "Sector Menor Consumo",
            sector: estadisticasDistribucion.sectorMenorConsumo.sector,
            litros: estadisticasDistribucion.sectorMenorConsumo.litros,
            porcentaje: estadisticasDistribucion.sectorMenorConsumo.porcentaje,
            formateado: `${estadisticasDistribucion.sectorMenorConsumo.litros.toLocaleString()} L (${estadisticasDistribucion.sectorMenorConsumo.porcentaje}%)`
          } : null,
          promedioPorSector: {
            titulo: "Promedio por Sector",
            valor: estadisticasDistribucion.promedioLitrosPorSector,
            formateado: `${estadisticasDistribucion.promedioLitrosPorSector.toFixed(0)} L`
          }
        },
        
        // Configuración visual
        configuracionVisual: {
          colores: {
            primario: '#3B82F6',
            secundario: '#F59E0B',
            exito: '#10B981',
            advertencia: '#EC4899',
            peligro: '#EF4444',
            neutral: '#6B7280'
          },
          tipografia: {
            titulo: { tamano: '1.5rem', peso: '600', color: '#1F2937' },
            subtitulo: { tamano: '1rem', peso: '500', color: '#6B7280' },
            datos: { tamano: '2rem', peso: '700', color: '#059669' }
          },
          espaciado: {
            padding: '1.5rem',
            margin: '1rem',
            borderRadius: '0.75rem'
          }
        }
      },
      
      // Consumo mensual - MEJORADO
      consumoMensual: consumoMensualResult.map(mes => {
        // Función para obtener nombre del mes en español
        const getMonthName = (monthNumber) => {
          const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          return meses[monthNumber - 1] || 'Desconocido';
        };

        const mesNombre = `${getMonthName(mes.mesNumero)} ${mes.anio}`;
        
        return {
          ...mes,
          mesNombre: mesNombre,
          litrosConsumidos: parseFloat(mes.litrosConsumidos),
          pabellonesProcesados: parseInt(mes.pabellonesProcesados),
          pabellonesLimpiados: parseInt(mes.pabellonesLimpiados),
          mts2Procesados: parseFloat(mes.mts2Procesados),
          ordenesServicio: parseInt(mes.ordenesServicio),
          maquinasActivas: parseInt(mes.maquinasActivas),
          registros: parseInt(mes.registros),
          promedioLitrosPorRegistro: parseFloat(mes.promedioLitrosPorRegistro),
          kmRecorridos: parseFloat(mes.kmRecorridos),
          litrosPorPabellon: parseFloat(mes.litrosPorPabellon),
          litrosPorMts2: parseFloat(mes.litrosPorMts2),
          litrosPorKm: parseFloat(mes.litrosPorKm),
          // Formatear para mostrar con aproximación
          litrosFormateado: formatLargeValue(parseFloat(mes.litrosConsumidos)),
          kmFormateado: formatLargeValue(parseFloat(mes.kmRecorridos)),
          pabellonesFormateado: parseInt(mes.pabellonesProcesados).toLocaleString(),
          mts2Formateado: formatAreaValue(parseFloat(mes.mts2Procesados)),
          // Formatear valores de rendimiento con precisión adecuada
          litrosPorMts2Formateado: formatSmallValue(mes.litrosPorMts2, 4),
          litrosPorKmFormateado: formatSmallValue(mes.litrosPorKm, 2),
          // Calcular tendencias
          tendencia: 'estable', // Se calculará después
          eficiencia: parseFloat(mes.litrosPorPabellon) <= 5 ? 'excelente' : 
                     parseFloat(mes.litrosPorPabellon) <= 10 ? 'bueno' : 
                     parseFloat(mes.litrosPorPabellon) <= 15 ? 'regular' : 'mejorar'
        };
      }),
      
      // Metadatos
      metadata: {
        year: currentYear,
        month: currentMonth,
        monthName: currentMonth ? getMonthName(currentMonth) : 'Todos los meses',
        origen: origen || 'todos',
        timestamp: new Date().toISOString(),
        totalRegistros: litrosPorMaquina.length,
        indicadores: [
          'Litros de petróleo consumido por máquina',
          'Eficiencia de consumo por pabellón',
          'Consumo por sector y período'
        ]
      }
    };

    console.log('✅ Métricas de consumo de petróleo obtenidas exitosamente');
    console.log(`📊 Máquinas analizadas: ${response.kpis.totalMaquinas}`);
    console.log(`⛽ Total litros consumidos: ${response.kpis.totalLitrosConsumidos.toLocaleString()} L`);
    console.log(`📦 Total pabellones procesados: ${response.kpis.totalPabellonesProcesados.toLocaleString()}`);
    console.log(`🏗️ Total mts2 procesados: ${response.kpis.totalMts2.toLocaleString()} m²`);
    console.log(`📈 Promedio litros por registro: ${response.kpis.promedioLitrosPorRegistro} L`);
    console.log(`🎯 Litros por pabellón global: ${response.kpis.litrosPorPabellonGlobal} L/pabellón`);
    
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo métricas de consumo de petróleo:', error);
    res.status(500).json({
      error: 'Error al obtener métricas de consumo de petróleo',
      message: error.message
    });
  }
};

// ============================================================================
// REPORTE DE DAÑOS ACUMULADOS POR VALORES MONETARIOS
// ============================================================================

// Función para formatear valores monetarios
const formatCurrency = (value) => {
  if (!value || value === 0) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// 1. Obtener datos de daños acumulados desde la vista
exports.getDanosAcumulados = async (req, res) => {
  try {
    console.log('🔍 Obteniendo datos de daños acumulados...');
    
    const { anio } = req.query;
    const currentYear = anio ? parseInt(anio) : new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const queryTimeout = 10000;
    
    // Obtener datos desde la vista vista_danos_acumulados
    const [datosAcumuladosResult] = await sequelize.query(`
      SELECT 
        anio,
        mes,
        valor_real,
        valor_ppto,
        valor_anio_ant,
        real_acumulado,
        ppto_acumulado,
        anio_ant_acumulado
      FROM vista_danos_acumulados
      WHERE anio IN (?, ?)
      ORDER BY anio, mes
    `, {
      replacements: [currentYear, previousYear],
      timeout: queryTimeout
    });
    
    // Procesar datos para el formato requerido
    const datosPorAnio = {};
    const meses = [];
    
    // Inicializar estructura de datos
    for (let mes = 1; mes <= 12; mes++) {
      meses.push({
        numero: mes,
        nombre: getMonthName(mes),
        abreviacion: getMonthName(mes).substring(0, 3)
      });
    }
    
    // Procesar datos de la vista
    datosAcumuladosResult.forEach(row => {
      const anio = row.anio;
      const mes = row.mes;
      
      if (!datosPorAnio[anio]) {
        datosPorAnio[anio] = {
          anio: anio,
          meses: {},
          totales: {
            real: 0,
            ppto: 0,
            anio_ant: 0
          }
        };
      }
      
      datosPorAnio[anio].meses[mes] = {
        mes: mes,
        nombreMes: getMonthName(mes),
        valor_real: parseInt(row.valor_real || 0),
        valor_ppto: parseInt(row.valor_ppto || 0),
        valor_anio_ant: parseInt(row.valor_anio_ant || 0),
        real_acumulado: parseInt(row.real_acumulado || 0),
        ppto_acumulado: parseInt(row.ppto_acumulado || 0),
        anio_ant_acumulado: parseInt(row.anio_ant_acumulado || 0),
        // Formatear valores para mostrar
        valor_real_formateado: formatCurrency(row.valor_real || 0),
        valor_ppto_formateado: formatCurrency(row.valor_ppto || 0),
        valor_anio_ant_formateado: formatCurrency(row.valor_anio_ant || 0),
        real_acumulado_formateado: formatCurrency(row.real_acumulado || 0),
        ppto_acumulado_formateado: formatCurrency(row.ppto_acumulado || 0),
        anio_ant_acumulado_formateado: formatCurrency(row.anio_ant_acumulado || 0)
      };
      
      // Actualizar totales anuales
      datosPorAnio[anio].totales.real += parseInt(row.valor_real || 0);
      datosPorAnio[anio].totales.ppto += parseInt(row.valor_ppto || 0);
      datosPorAnio[anio].totales.anio_ant += parseInt(row.valor_anio_ant || 0);
    });
    
    // Calcular variación anual si hay datos del año anterior
    let variacionAnual = null;
    if (datosPorAnio[previousYear] && datosPorAnio[currentYear]) {
      const totalAnterior = datosPorAnio[previousYear].totales.real;
      const totalActual = datosPorAnio[currentYear].totales.real;
      
      if (totalAnterior > 0) {
        variacionAnual = {
          porcentaje: ((totalActual - totalAnterior) / totalAnterior * 100).toFixed(2),
          diferencia: totalActual - totalAnterior,
          diferencia_formateada: formatCurrency(totalActual - totalAnterior),
          tipo: totalActual > totalAnterior ? 'incremento' : 'decremento'
        };
      }
    }
    
    // Preparar datos para gráficos
    const datosGrafico = [];
    for (let mes = 1; mes <= 12; mes++) {
      const datosMes = {
        mes: mes,
        nombreMes: getMonthName(mes),
        abreviacion: getMonthName(mes).substring(0, 3)
      };
      
      // Datos del año actual
      if (datosPorAnio[currentYear] && datosPorAnio[currentYear].meses[mes]) {
        datosMes.real_acumulado = datosPorAnio[currentYear].meses[mes].real_acumulado;
        datosMes.ppto_acumulado = datosPorAnio[currentYear].meses[mes].ppto_acumulado;
        datosMes.real_acumulado_formateado = datosPorAnio[currentYear].meses[mes].real_acumulado_formateado;
        datosMes.ppto_acumulado_formateado = datosPorAnio[currentYear].meses[mes].ppto_acumulado_formateado;
      } else {
        datosMes.real_acumulado = 0;
        datosMes.ppto_acumulado = 0;
        datosMes.real_acumulado_formateado = formatCurrency(0);
        datosMes.ppto_acumulado_formateado = formatCurrency(0);
      }
      
      // Datos del año anterior
      if (datosPorAnio[previousYear] && datosPorAnio[previousYear].meses[mes]) {
        datosMes.anio_ant_acumulado = datosPorAnio[previousYear].meses[mes].real_acumulado;
        datosMes.anio_ant_acumulado_formateado = datosPorAnio[previousYear].meses[mes].real_acumulado_formateado;
      } else {
        datosMes.anio_ant_acumulado = 0;
        datosMes.anio_ant_acumulado_formateado = formatCurrency(0);
      }
      
      datosGrafico.push(datosMes);
    }
    
    const response = {
      anio_actual: currentYear,
      anio_anterior: previousYear,
      datos_por_anio: datosPorAnio,
      datos_grafico: datosGrafico,
      meses: meses,
      variacion_anual: variacionAnual,
      kpis: {
        total_real_actual: datosPorAnio[currentYear]?.totales.real || 0,
        total_ppto_actual: datosPorAnio[currentYear]?.totales.ppto || 0,
        total_real_anterior: datosPorAnio[previousYear]?.totales.real || 0,
        total_real_actual_formateado: formatCurrency(datosPorAnio[currentYear]?.totales.real || 0),
        total_ppto_actual_formateado: formatCurrency(datosPorAnio[currentYear]?.totales.ppto || 0),
        total_real_anterior_formateado: formatCurrency(datosPorAnio[previousYear]?.totales.real || 0)
      },
      metadata: {
        timestamp: new Date().toISOString(),
        fuente: 'vista_danos_acumulados',
        anio_consulta: currentYear
      }
    };
    
    console.log('✅ Datos de daños acumulados obtenidos exitosamente');
    console.log(`📊 Año actual: ${currentYear}, Total real: ${response.kpis.total_real_actual_formateado}`);
    console.log(`📊 Año anterior: ${previousYear}, Total real: ${response.kpis.total_real_anterior_formateado}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo datos de daños acumulados:', error);
    res.status(500).json({
      error: 'Error al obtener datos de daños acumulados',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 2. Crear o actualizar registro mensual de daños
exports.crearActualizarDanosMensual = async (req, res) => {
  try {
    console.log('📝 Creando/actualizando registro mensual de daños...');
    
    const { anio, mes, valor_real, valor_ppto } = req.body;
    
    // Validaciones
    if (!anio || !mes) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        message: 'Se requiere anio y mes'
      });
    }
    
    if (mes < 1 || mes > 12) {
      return res.status(400).json({
        error: 'Mes inválido',
        message: 'El mes debe estar entre 1 y 12'
      });
    }
    
    // Buscar registro existente o crear uno nuevo
    const [registro, creado] = await ReporteDanosMensuales.findOrCreate({
      where: { anio, mes },
      defaults: {
        valor_real: valor_real || 0,
        valor_ppto: valor_ppto || 0,
        valor_anio_ant: 0
      }
    });
    
    // Si el registro ya existía, actualizarlo
    if (!creado) {
      await registro.update({
        valor_real: valor_real || registro.valor_real,
        valor_ppto: valor_ppto || registro.valor_ppto,
        fecha_actualizacion: new Date()
      });
    }
    
    console.log(`✅ Registro ${creado ? 'creado' : 'actualizado'} exitosamente`);
    console.log(`📊 Año: ${anio}, Mes: ${getMonthName(mes)}, Valor real: ${formatCurrency(valor_real || 0)}`);
    
    res.json({
      success: true,
      message: `Registro ${creado ? 'creado' : 'actualizado'} exitosamente`,
      data: {
        anio,
        mes,
        nombre_mes: getMonthName(mes),
        valor_real: valor_real || 0,
        valor_ppto: valor_ppto || 0,
        valor_real_formateado: formatCurrency(valor_real || 0),
        valor_ppto_formateado: formatCurrency(valor_ppto || 0),
        creado,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error creando/actualizando registro de daños:', error);
    res.status(500).json({
      error: 'Error al crear/actualizar registro de daños',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 3. Cargar datos del año anterior como base para el año actual
exports.cargarDatosAnioAnterior = async (req, res) => {
  try {
    console.log('🔄 Cargando datos del año anterior como base...');
    
    const { anio_origen, anio_destino } = req.body;
    
    if (!anio_origen || !anio_destino) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        message: 'Se requiere anio_origen y anio_destino'
      });
    }
    
    // Verificar que existan datos del año origen
    const datosOrigen = await ReporteDanosMensuales.findAll({
      where: { anio: anio_origen },
      order: [['mes', 'ASC']]
    });
    
    if (datosOrigen.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron datos del año origen',
        message: `No hay datos para el año ${anio_origen}`
      });
    }
    
    // Crear registros para el año destino usando los valores reales del año origen
    const registrosACrear = datosOrigen.map(dato => ({
      anio: anio_destino,
      mes: dato.mes,
      valor_real: 0, // Se llenará mes a mes
      valor_ppto: 0, // Se llenará mes a mes
      valor_anio_ant: dato.valor_real, // Usar el valor real del año anterior como base
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    }));
    
    // Insertar registros usando bulkCreate con ignoreDuplicates
    const registrosCreados = await ReporteDanosMensuales.bulkCreate(registrosACrear, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['valor_anio_ant', 'fecha_actualizacion']
    });
    
    console.log(`✅ Datos cargados exitosamente`);
    console.log(`📊 Año origen: ${anio_origen}, Año destino: ${anio_destino}`);
    console.log(`📊 Registros procesados: ${registrosCreados.length}`);
    
    res.json({
      success: true,
      message: 'Datos del año anterior cargados como base exitosamente',
      data: {
        anio_origen,
        anio_destino,
        registros_procesados: registrosCreados.length,
        meses_cargados: registrosCreados.map(r => ({
          mes: r.mes,
          nombre_mes: getMonthName(r.mes),
          valor_anio_ant: r.valor_anio_ant,
          valor_anio_ant_formateado: formatCurrency(r.valor_anio_ant)
        })),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error cargando datos del año anterior:', error);
    res.status(500).json({
      error: 'Error al cargar datos del año anterior',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 4. Calcular variación anual (se ejecuta el 1 de enero del año siguiente)
exports.calcularVariacionAnual = async (req, res) => {
  try {
    console.log('📊 Calculando variación anual...');
    
    const { anio_actual, anio_anterior } = req.body;
    
    if (!anio_actual || !anio_anterior) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        message: 'Se requiere anio_actual y anio_anterior'
      });
    }
    
    // Obtener totales anuales
    const [totalesResult] = await sequelize.query(`
      SELECT 
        anio,
        SUM(valor_real) as total_real,
        SUM(valor_ppto) as total_ppto
      FROM reporte_danos_mensuales
      WHERE anio IN (?, ?)
      GROUP BY anio
      ORDER BY anio
    `, {
      replacements: [anio_actual, anio_anterior],
      timeout: 5000
    });
    
    if (totalesResult.length < 2) {
      return res.status(404).json({
        error: 'Datos insuficientes',
        message: 'No se encontraron datos completos para ambos años'
      });
    }
    
    const datosActual = totalesResult.find(r => r.anio === anio_actual);
    const datosAnterior = totalesResult.find(r => r.anio === anio_anterior);
    
    if (!datosActual || !datosAnterior) {
      return res.status(404).json({
        error: 'Datos incompletos',
        message: 'Faltan datos para uno de los años'
      });
    }
    
    const totalActual = parseInt(datosActual.total_real || 0);
    const totalAnterior = parseInt(datosAnterior.total_real || 0);
    const totalPpto = parseInt(datosActual.total_ppto || 0);
    
    // Calcular variación
    let variacionPorcentual = 0;
    let diferencia = 0;
    let tipoVariacion = 'sin_cambio';
    
    if (totalAnterior > 0) {
      diferencia = totalActual - totalAnterior;
      variacionPorcentual = (diferencia / totalAnterior) * 100;
      tipoVariacion = diferencia > 0 ? 'incremento' : diferencia < 0 ? 'decremento' : 'sin_cambio';
    }
    
    // Calcular cumplimiento presupuestario
    let cumplimientoPpto = 0;
    let tipoCumplimiento = 'sin_presupuesto';
    
    if (totalPpto > 0) {
      cumplimientoPpto = ((totalActual - totalPpto) / totalPpto) * 100;
      tipoCumplimiento = totalActual > totalPpto ? 'sobre_presupuesto' : 
                         totalActual < totalPpto ? 'bajo_presupuesto' : 'cumple_presupuesto';
    }
    
    const response = {
      anio_actual,
      anio_anterior,
      totales: {
        real_actual: totalActual,
        real_anterior: totalAnterior,
        ppto_actual: totalPpto,
        real_actual_formateado: formatCurrency(totalActual),
        real_anterior_formateado: formatCurrency(totalAnterior),
        ppto_actual_formateado: formatCurrency(totalPpto)
      },
      variacion: {
        porcentual: parseFloat(variacionPorcentual.toFixed(2)),
        diferencia: diferencia,
        diferencia_formateada: formatCurrency(diferencia),
        tipo: tipoVariacion,
        interpretacion: tipoVariacion === 'incremento' ? 'Aumento' : 
                       tipoVariacion === 'decremento' ? 'Disminución' : 'Sin cambio'
      },
      cumplimiento_presupuestario: {
        porcentual: parseFloat(cumplimientoPpto.toFixed(2)),
        tipo: tipoCumplimiento,
        interpretacion: tipoCumplimiento === 'sobre_presupuesto' ? 'Sobre presupuesto' :
                       tipoCumplimiento === 'bajo_presupuesto' ? 'Bajo presupuesto' :
                       tipoCumplimiento === 'cumple_presupuesto' ? 'Cumple presupuesto' : 'Sin presupuesto'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        calculado_el: new Date().toISOString(),
        fuente: 'reporte_danos_mensuales'
      }
    };
    
    console.log('✅ Variación anual calculada exitosamente');
    console.log(`📊 Variación: ${response.variacion.porcentual}% (${response.variacion.interpretacion})`);
    console.log(`📊 Cumplimiento presupuestario: ${response.cumplimiento_presupuestario.porcentual}% (${response.cumplimiento_presupuestario.interpretacion})`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error calculando variación anual:', error);
    res.status(500).json({
      error: 'Error al calcular variación anual',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 5. Obtener resumen ejecutivo de daños acumulados
exports.getResumenEjecutivoDanos = async (req, res) => {
  try {
    console.log('📋 Obteniendo resumen ejecutivo de daños...');
    
    const { anio } = req.query;
    const currentYear = anio ? parseInt(anio) : new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Obtener datos desde la vista
    const [resumenResult] = await sequelize.query(`
      SELECT 
        anio,
        SUM(valor_real) as total_real,
        SUM(valor_ppto) as total_ppto,
        SUM(valor_anio_ant) as total_anio_ant,
        COUNT(*) as meses_con_datos,
        AVG(valor_real) as promedio_mensual_real,
        AVG(valor_ppto) as promedio_mensual_ppto
      FROM vista_danos_acumulados
      WHERE anio IN (?, ?)
      GROUP BY anio
      ORDER BY anio
    `, {
      replacements: [currentYear, previousYear],
      timeout: 5000
    });
    
    const datosActual = resumenResult.find(r => r.anio === currentYear);
    const datosAnterior = resumenResult.find(r => r.anio === previousYear);
    
    // Calcular métricas adicionales
    const totalActual = parseInt(datosActual?.total_real || 0);
    const totalAnterior = parseInt(datosAnterior?.total_real || 0);
    const totalPpto = parseInt(datosActual?.total_ppto || 0);
    
    let variacionAnual = 0;
    let cumplimientoPpto = 0;
    
    if (totalAnterior > 0) {
      variacionAnual = ((totalActual - totalAnterior) / totalAnterior) * 100;
    }
    
    if (totalPpto > 0) {
      cumplimientoPpto = ((totalActual - totalPpto) / totalPpto) * 100;
    }
    
    // Obtener mes con mayor daño del año actual
    const [mesMayorDanoResult] = await sequelize.query(`
      SELECT 
        mes,
        valor_real,
        real_acumulado
      FROM vista_danos_acumulados
      WHERE anio = ?
      ORDER BY valor_real DESC
      LIMIT 1
    `, {
      replacements: [currentYear],
      timeout: 5000
    });
    
    const mesMayorDano = mesMayorDanoResult[0];
    
    const response = {
      anio_actual: currentYear,
      anio_anterior: previousYear,
      resumen: {
        total_real_actual: totalActual,
        total_ppto_actual: totalPpto,
        total_real_anterior: totalAnterior,
        meses_con_datos: parseInt(datosActual?.meses_con_datos || 0),
        promedio_mensual_real: parseFloat(datosActual?.promedio_mensual_real || 0),
        promedio_mensual_ppto: parseFloat(datosActual?.promedio_mensual_ppto || 0),
        // Formatear valores
        total_real_actual_formateado: formatCurrency(totalActual),
        total_ppto_actual_formateado: formatCurrency(totalPpto),
        total_real_anterior_formateado: formatCurrency(totalAnterior),
        promedio_mensual_real_formateado: formatCurrency(datosActual?.promedio_mensual_real || 0),
        promedio_mensual_ppto_formateado: formatCurrency(datosActual?.promedio_mensual_ppto || 0)
      },
      variacion: {
        porcentual: parseFloat(variacionAnual.toFixed(2)),
        tipo: variacionAnual > 0 ? 'incremento' : variacionAnual < 0 ? 'decremento' : 'sin_cambio',
        interpretacion: variacionAnual > 0 ? 'Aumento respecto al año anterior' : 
                       variacionAnual < 0 ? 'Disminución respecto al año anterior' : 'Sin cambio'
      },
      cumplimiento_presupuestario: {
        porcentual: parseFloat(cumplimientoPpto.toFixed(2)),
        tipo: cumplimientoPpto > 0 ? 'sobre_presupuesto' : 
              cumplimientoPpto < 0 ? 'bajo_presupuesto' : 'cumple_presupuesto',
        interpretacion: cumplimientoPpto > 0 ? 'Sobre el presupuesto asignado' :
                       cumplimientoPpto < 0 ? 'Bajo el presupuesto asignado' : 'Cumple el presupuesto'
      },
      mes_mayor_dano: mesMayorDano ? {
        mes: mesMayorDano.mes,
        nombre_mes: getMonthName(mesMayorDano.mes),
        valor_real: parseInt(mesMayorDano.valor_real || 0),
        valor_real_formateado: formatCurrency(mesMayorDano.valor_real || 0),
        acumulado_hasta_mes: parseInt(mesMayorDano.real_acumulado || 0),
        acumulado_hasta_mes_formateado: formatCurrency(mesMayorDano.real_acumulado || 0)
      } : null,
      metadata: {
        timestamp: new Date().toISOString(),
        fuente: 'vista_danos_acumulados',
        anio_consulta: currentYear
      }
    };
    
    console.log('✅ Resumen ejecutivo obtenido exitosamente');
    console.log(`📊 Total actual: ${response.resumen.total_real_actual_formateado}`);
    console.log(`📊 Variación anual: ${response.variacion.porcentual}%`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo resumen ejecutivo:', error);
    res.status(500).json({
      error: 'Error al obtener resumen ejecutivo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Eliminar registro mensual
exports.eliminarRegistroDanos = async (req, res) => {
  try {
    const { anio, mes } = req.body;
    
    if (!anio || !mes) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere año y mes para eliminar el registro'
      });
    }
    
    // Buscar y eliminar el registro
    const resultado = await ReporteDanosMensuales.destroy({
      where: {
        anio: parseInt(anio),
        mes: parseInt(mes)
      }
    });
    
    if (resultado === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el registro especificado'
      });
    }
    
    res.json({
      success: true,
      message: 'Registro eliminado exitosamente',
      data: {
        anio: parseInt(anio),
        mes: parseInt(mes),
        registros_eliminados: resultado
      }
    });
    
  } catch (error) {
    console.error('❌ Error eliminando registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar estado de migración
exports.verificarMigracion = async (req, res) => {
  try {
    console.log('🔍 Verificando estado de migración...');
    
    // Consultar tabla migracion_ordenes_2025
    const [resultados] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT id) as danos_unicos,
        COUNT(*) - COUNT(DISTINCT id) as duplicados,
        COUNT(CASE WHEN valor_dano > 0 THEN 1 END) as registros_validos,
        COUNT(CASE WHEN valor_dano = 0 OR valor_dano IS NULL THEN 1 END) as registros_invalidos,
        SUM(CASE WHEN valor_dano > 0 THEN valor_dano ELSE 0 END) as total_valor,
        AVG(CASE WHEN valor_dano > 0 THEN valor_dano ELSE NULL END) as promedio
      FROM migracion_ordenes_2025 
      WHERE tipo = 'daño'
    `);
    
    const datos = resultados[0];
    
    res.json({
      success: true,
      total_registros: parseInt(datos.total_registros),
      danos_unicos: parseInt(datos.danos_unicos),
      duplicados: parseInt(datos.duplicados),
      registros_validos: parseInt(datos.registros_validos),
      registros_invalidos: parseInt(datos.registros_invalidos),
      total_valor: parseFloat(datos.total_valor || 0),
      promedio: parseFloat(datos.promedio || 0)
    });
    
  } catch (error) {
    console.error('❌ Error verificando migración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar migración'
    });
  }
};

// Obtener estado de migración
exports.estadoMigracion = async (req, res) => {
  try {
    console.log('📊 Obteniendo estado de migración...');
    
    const [resultados] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(CASE WHEN valor_dano > 0 THEN 1 END) as registros_validos,
        COUNT(CASE WHEN valor_dano = 0 THEN 1 END) as registros_cero,
        COUNT(CASE WHEN valor_dano IS NULL THEN 1 END) as registros_nulos,
        COUNT(*) - COUNT(DISTINCT id) as duplicados,
        SUM(CASE WHEN valor_dano > 0 THEN valor_dano ELSE 0 END) as total_valor,
        AVG(CASE WHEN valor_dano > 0 THEN valor_dano ELSE NULL END) as promedio
      FROM migracion_ordenes_2025 
      WHERE tipo = 'daño'
    `);
    
    const datos = resultados[0];
    
    res.json({
      success: true,
      total_registros: parseInt(datos.total_registros),
      registros_validos: parseInt(datos.registros_validos),
      registros_cero: parseInt(datos.registros_cero),
      registros_nulos: parseInt(datos.registros_nulos),
      duplicados: parseInt(datos.duplicados),
      total_valor: parseFloat(datos.total_valor || 0),
      promedio: parseFloat(datos.promedio || 0)
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estado de migración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de migración'
    });
  }
};

// Limpiar duplicados
exports.limpiarDuplicados = async (req, res) => {
  try {
    console.log('🧹 Limpiando duplicados...');
    
    // Eliminar duplicados manteniendo el registro con mayor valor_dano
    const [resultado] = await sequelize.query(`
      DELETE t1 FROM migracion_ordenes_2025 t1
      INNER JOIN migracion_ordenes_2025 t2 
      WHERE t1.id > t2.id 
      AND t1.id = t2.id 
      AND t1.tipo = 'daño' 
      AND t2.tipo = 'daño'
    `);
    
    const duplicadosEliminados = resultado.affectedRows;
    
    // Contar registros restantes
    const [conteo] = await sequelize.query(`
      SELECT COUNT(*) as total FROM migracion_ordenes_2025 WHERE tipo = 'daño'
    `);
    
    res.json({
      success: true,
      duplicados_eliminados: duplicadosEliminados,
      registros_restantes: parseInt(conteo[0].total)
    });
    
  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar duplicados'
    });
  }
};

// Eliminar registros inválidos
exports.eliminarInvalidos = async (req, res) => {
  try {
    console.log('🗑️ Eliminando registros inválidos...');
    
    // Eliminar registros con valor_dano 0 o NULL
    const [resultado] = await sequelize.query(`
      DELETE FROM migracion_ordenes_2025 
      WHERE tipo = 'daño' 
      AND (valor_dano = 0 OR valor_dano IS NULL)
    `);
    
    const registrosEliminados = resultado.affectedRows;
    
    // Contar registros válidos restantes
    const [conteo] = await sequelize.query(`
      SELECT COUNT(*) as total FROM migracion_ordenes_2025 
      WHERE tipo = 'daño' AND valor_dano > 0
    `);
    
    res.json({
      success: true,
      registros_eliminados: registrosEliminados,
      registros_validos: parseInt(conteo[0].total)
    });
    
  } catch (error) {
    console.error('❌ Error eliminando registros inválidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar registros inválidos'
    });
  }
};

// Recalcular totales
exports.recalcularTotales = async (req, res) => {
  try {
    console.log('📊 Recalculando totales...');
    
    const [resultados] = await sequelize.query(`
      SELECT 
        COUNT(*) as registros_procesados,
        SUM(valor_dano) as total_real,
        AVG(valor_dano) as promedio
      FROM migracion_ordenes_2025 
      WHERE tipo = 'daño' AND valor_dano > 0
    `);
    
    const datos = resultados[0];
    
    res.json({
      success: true,
      registros_procesados: parseInt(datos.registros_procesados),
      total_real: parseFloat(datos.total_real || 0),
      total_presupuesto: 36000000, // Presupuesto fijo de 36M
      promedio: parseFloat(datos.promedio || 0)
    });
    
  } catch (error) {
    console.error('❌ Error recalculando totales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recalcular totales'
    });
  }
};

// Actualizar reporte desde migración
exports.actualizarDesdeMigracion = async (req, res) => {
  try {
    const { anio } = req.body;
    console.log(`📊 Actualizando reporte desde migración para año ${anio}...`);
    
    // Obtener datos de la migración agrupados por mes
    const [datosMigracion] = await sequelize.query(`
      SELECT 
        MONTH(fecha) as mes,
        SUM(valor_dano) as total_mes
      FROM migracion_ordenes_2025 
      WHERE tipo = 'daño' 
      AND valor_dano > 0 
      AND YEAR(fecha) = ?
      GROUP BY MONTH(fecha)
      ORDER BY mes
    `, {
      replacements: [anio]
    });
    
    let registrosProcesados = 0;
    let totalActualizado = 0;
    let mesesActualizados = 0;
    
    // Actualizar cada mes en reporte_danos_mensuales
    for (const dato of datosMigracion) {
      try {
        const [registro, creado] = await ReporteDanosMensuales.findOrCreate({
          where: {
            anio: parseInt(anio),
            mes: parseInt(dato.mes)
          },
          defaults: {
            valor_real: parseInt(dato.total_mes),
            valor_ppto: 3000000, // Presupuesto mensual fijo
            valor_anio_ant: 0
          }
        });
        
        if (!creado) {
          // Actualizar registro existente
          await registro.update({
            valor_real: parseInt(dato.total_mes)
          });
        }
        
        registrosProcesados++;
        totalActualizado += parseInt(dato.total_mes);
        mesesActualizados++;
        
        console.log(`✅ Mes ${dato.mes}: $${dato.total_mes.toLocaleString()}`);
        
      } catch (error) {
        console.log(`❌ Error actualizando mes ${dato.mes}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      registros_procesados: registrosProcesados,
      total_actualizado: totalActualizado,
      meses_actualizados: mesesActualizados
    });
    
  } catch (error) {
    console.error('❌ Error actualizando desde migración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar desde migración'
    });
  }
};

// NUEVA FUNCIÓN ESPECÍFICA PARA EL FRONTEND
exports.getFrontendMetrics = async (req, res) => {
  try {
    console.log('🔍 Obteniendo métricas para el frontend...');
    
    // Forzar limpieza de caché
    metricsCache = null;
    cacheTimestamp = null;
    
    // Obtener parámetros de filtro
    const { origen, year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Construir filtros para la vista unificada
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    // Mapear valores de origen a los valores reales en la base de datos
    const sourceValue = mapOrigenToSource(origen);
    
    if (sourceValue) {
      whereClause += ' AND source COLLATE utf8mb4_unicode_ci = ?';
      params.push(sourceValue);
    }
    
    console.log('🔍 Ejecutando consulta para frontend con whereClause:', whereClause);
    console.log('🔍 Params:', params);
    
    // 1. Métricas básicas
    const [totalPlanillasResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as total,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantLimpiar), 0) as total_pabellones_limpiados,
        COALESCE(SUM(mts2), 0) as total_mts2,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_unificada_completa
      ${whereClause}
    `, { 
      replacements: params,
      timeout: 8000 
    });
    
    // 1.1. Pabellones por planilla única
    const [pabellonesPorPlanillaResult] = await sequelize.query(`
      SELECT 
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        ${whereClause}
        GROUP BY idOrdenServicio
      ) as planillas_unicas
    `, { 
      replacements: params,
      timeout: 8000 
    });
    
    // 2. Métricas del mes actual
    const [metricasMesResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes,
        COALESCE(SUM(mts2), 0) as mts2_mes
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
    `, { 
      replacements: sourceValue ? [currentYear, currentMonth, sourceValue] : [currentYear, currentMonth],
      timeout: 8000 
    });
    
    // 3. Métricas del mes anterior
    const [metricasMesAnteriorResult] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT idOrdenServicio) as planillas_mes_anterior,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_mes_anterior,
        COALESCE(SUM(mts2), 0) as mts2_mes_anterior
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
    `, { 
      replacements: sourceValue ? [previousYear, previousMonth, sourceValue] : [previousYear, previousMonth],
      timeout: 8000 
    });
    
    // 4. Tendencias mensuales (últimos 6 meses)
    console.log('🔍 Ejecutando consulta de tendencias mensuales...');
    console.log('🔍 currentYear:', currentYear);
    console.log('🔍 sourceValue:', sourceValue);
    
    const [tendenciasMensualesResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones,
        COALESCE(SUM(mts2), 0) as mts2
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `, { 
      replacements: sourceValue ? [currentYear, sourceValue] : [currentYear],
      timeout: 8000 
    });
    
    console.log('📊 Resultado tendencias mensuales:', tendenciasMensualesResult);
    
    // 4.1. Pabellones por mes por planilla única
    console.log('🔍 Ejecutando consulta de pabellones únicos...');
    
    const [tendenciasMensualesUnicosResult] = await sequelize.query(`
      SELECT 
        MONTH(fechaOrdenServicio) as mes,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          fechaOrdenServicio,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        WHERE YEAR(fechaOrdenServicio) = ?
        ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
        GROUP BY idOrdenServicio, fechaOrdenServicio
      ) as planillas_mensuales_unicas
      GROUP BY MONTH(fechaOrdenServicio)
      ORDER BY mes ASC
    `, { 
      replacements: sourceValue ? [currentYear, sourceValue] : [currentYear],
      timeout: 8000 
    });
    
    console.log('📈 Resultado pabellones únicos:', tendenciasMensualesUnicosResult);
    
    // Planillas completadas
    const [planillasCompletadasResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      AND fechaFinOrdenServicio IS NOT NULL 
      AND fechaFinOrdenServicio != fechaOrdenServicio
    `, { 
      replacements: params,
      timeout: 8000 
    });
    
    // Sectores
    const [rendimientoSectorResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(DISTINCT idOrdenServicio) as planillas,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total,
        COALESCE(SUM(mts2), 0) as mts2_total
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      GROUP BY nombreSector
      ORDER BY pabellones_total DESC
      LIMIT 5
    `, { 
      replacements: params,
      timeout: 8000 
    });
    
    // Sectores únicos
    const [rendimientoSectorUnicosResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COALESCE(SUM(cantidadPabellones), 0) as pabellones_total_unicos
      FROM (
        SELECT 
          idOrdenServicio,
          nombreSector,
          MAX(cantidadPabellones) as cantidadPabellones
        FROM vw_ordenes_unificada_completa
        ${whereClause}
        GROUP BY idOrdenServicio, nombreSector
      ) as planillas_sector_unicas
      GROUP BY nombreSector
      ORDER BY pabellones_total_unicos DESC
      LIMIT 5
    `, { 
      replacements: params,
      timeout: 8000 
    });
    
    const totalPlanillas = totalPlanillasResult[0].total || 0;
    
    // Calcular estados de planillas desde la vista unificada
    let planillasPendientes = 0;
    let planillasCanceladas = 0;
    let planillasActivas = 0;
    let planillasCompletadas = 0;
    
    // Obtener planillas pendientes y canceladas del sistema actual
    try {
      // Planillas pendientes: del sistema actual con fechaFinOrdenServicio NULL
      const [planillasPendientesResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
        FROM vw_ordenes_unificada_completa
        WHERE source = 'sistema_actual'
        AND fechaFinOrdenServicio IS NULL
      `, { timeout: 8000 });
      
      // Planillas canceladas: del sistema actual con fechaFinOrdenServicio igual a fechaOrdenServicio
      const [planillasCanceladasResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
        FROM vw_ordenes_unificada_completa
        WHERE source = 'sistema_actual'
        AND fechaFinOrdenServicio IS NOT NULL
        AND fechaFinOrdenServicio = fechaOrdenServicio
      `, { timeout: 8000 });
      
      // Planillas activas: las que tienen fechaFinOrdenServicio NULL o igual a fechaOrdenServicio
      const [planillasActivasResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
        FROM vw_ordenes_unificada_completa
        WHERE source = 'sistema_actual'
        AND (fechaFinOrdenServicio IS NULL OR fechaFinOrdenServicio = fechaOrdenServicio)
      `, { timeout: 8000 });
      
      // Planillas completadas: las que tienen fechaFinOrdenServicio diferente a fechaOrdenServicio
      const [planillasCompletadasResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT idOrdenServicio) as cantidad
        FROM vw_ordenes_unificada_completa
        WHERE source = 'sistema_actual'
        AND fechaFinOrdenServicio IS NOT NULL 
        AND fechaFinOrdenServicio != fechaOrdenServicio
      `, { timeout: 8000 });
      
      planillasPendientes = planillasPendientesResult[0].cantidad || 0;
      planillasCanceladas = planillasCanceladasResult[0].cantidad || 0;
      planillasActivas = planillasActivasResult[0].cantidad || 0;
      planillasCompletadas = planillasCompletadasResult[0].cantidad || 0;
      
      console.log('📊 Estados de planillas calculados:', {
        pendientes: planillasPendientes,
        canceladas: planillasCanceladas,
        activas: planillasActivas,
        completadas: planillasCompletadas
      });
    } catch (error) {
      console.error('❌ Error calculando estados de planillas:', error);
    }
    
    const eficienciaActual = totalPlanillas > 0 ? Math.round((planillasCompletadas / totalPlanillas) * 100) : 0;
    
    // NUEVO: Calcular operadores activos
    const [operadoresActivosResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT nombreOperador) as operadores_activos
      FROM vw_ordenes_unificada_completa
      WHERE YEAR(fechaOrdenServicio) = ? AND MONTH(fechaOrdenServicio) = ?
      ${sourceValue ? 'AND source COLLATE utf8mb4_unicode_ci = ?' : ''}
      AND nombreOperador IS NOT NULL AND nombreOperador != 'Sin operador'
    `, { 
      replacements: sourceValue ? [currentYear, currentMonth, sourceValue] : [currentYear, currentMonth],
      timeout: 8000 
    });
    
    const operadoresActivos = operadoresActivosResult[0].operadores_activos || 0;
    
    // NUEVO: Calcular eficiencia promedio
    const eficienciaPromedio = totalPlanillasResult[0].total_pabellones > 0 ? 
      Math.round((totalPlanillasResult[0].total_pabellones_limpiados / totalPlanillasResult[0].total_pabellones) * 100) : 0;
    
    // Calcular métricas del mes
    const planillasMes = metricasMesResult[0].planillas_mes || 0;
    const pabellonesMes = metricasMesResult[0].pabellones_mes || 0;
    const mts2Mes = metricasMesResult[0].mts2_mes || 0;
    const planillasMesAnterior = metricasMesAnteriorResult[0].planillas_mes_anterior || 0;
    const pabellonesMesAnterior = metricasMesAnteriorResult[0].pabellones_mes_anterior || 0;
    const mts2MesAnterior = metricasMesAnteriorResult[0].mts2_mes_anterior || 0;
    
    // Calcular variaciones
    const variacionPlanillas = planillasMesAnterior > 0 ? 
      ((planillasMes - planillasMesAnterior) / planillasMesAnterior * 100).toFixed(1) : 0;
    const variacionPabellones = pabellonesMesAnterior > 0 ? 
      ((pabellonesMes - pabellonesMesAnterior) / pabellonesMesAnterior * 100).toFixed(1) : 0;
    const variacionMts2 = mts2MesAnterior > 0 ? 
      ((mts2Mes - mts2MesAnterior) / mts2MesAnterior * 100).toFixed(1) : 0;
    
    // Formatear tendencias mensuales
    console.log('🔍 Formateando tendencias mensuales...');
    console.log('🔍 tendenciasMensualesResult.length:', tendenciasMensualesResult.length);
    console.log('🔍 tendenciasMensualesUnicosResult.length:', tendenciasMensualesUnicosResult.length);
    
    const tendenciasMensuales = tendenciasMensualesResult.map((item, index) => {
      const pabellonesUnicos = tendenciasMensualesUnicosResult[index]?.pabellones_unicos || 0;
      const tendencia = {
        mes: new Date(currentYear, item.mes - 1).toLocaleDateString('es-ES', { month: 'short' }),
        planillas: parseInt(item.planillas),
        pabellones: parseInt(pabellonesUnicos),
        mts2: parseInt(item.mts2)
      };
      console.log(`🔍 Tendencia ${index}:`, tendencia);
      return tendencia;
    });
    
    console.log('🎯 Tendencias formateadas finales:', tendenciasMensuales);
    console.log('📊 Total tendencias formateadas:', tendenciasMensuales.length);
    
    // Formatear sectores
    console.log('🔍 Formateando sectores...');
    console.log('🔍 rendimientoSectorResult:', rendimientoSectorResult);
    console.log('🔍 rendimientoSectorUnicosResult:', rendimientoSectorUnicosResult);
    
    const rendimientoPorSector = rendimientoSectorResult.map((item, index) => {
      const pabellonesUnicos = rendimientoSectorUnicosResult[index]?.pabellones_total_unicos || 0;
      const sector = {
        nombre: item.sector_nombre || 'Sin sector',
        planillas: parseInt(item.planillas),
        pabellones: parseInt(pabellonesUnicos),
        mts2: parseInt(item.mts2_total)
      };
      console.log(`🔍 Sector ${index}:`, sector);
      return sector;
    });
    
    console.log('🎯 Sectores formateados finales:', rendimientoPorSector);
    console.log('📊 Total sectores formateados:', rendimientoPorSector.length);
    
    const response = {
      totalPlanillas,
      planillasActivas,
      planillasCompletadas,
      planillasPendientes,
      planillasCanceladas,
      totalMaquinas: 0,
      totalOperadores: 0,
      totalSectores: 0,
      totalBarredores: 0,
      totalPabellones: pabellonesPorPlanillaResult[0].total_pabellones_unicos,
      totalMts2: totalPlanillasResult[0].total_mts2,
      
      // NUEVO: Operadores activos y eficiencia promedio
      operadoresActivos,
      eficienciaPromedio,
      
      planillasMes,
      pabellonesMes,
      mts2Mes,
      planillasMesAnterior,
      pabellonesMesAnterior,
      mts2MesAnterior,
      variacionPlanillas: parseFloat(variacionPlanillas),
      variacionPabellones: parseFloat(variacionPabellones),
      variacionMts2: parseFloat(variacionMts2),
      eficienciaGlobal: eficienciaActual,
      danosMes: 0,
      danosPorTipo: [],
      alertas: [],
      charts: {
        tendenciasMensuales,
        rendimientoPorSector
      },
      metadata: {
        origen: origen || 'todos',
        year: currentYear,
        timestamp: new Date().toISOString(),
        fuente: 'frontend-direct'
      }
    };
    
    console.log('✅ Respuesta preparada para frontend:', {
      totalPlanillas: response.totalPlanillas,
      totalPabellones: response.totalPabellones,
      eficienciaGlobal: response.eficienciaGlobal,
      sectores: response.charts.rendimientoPorSector.length,
      tendenciasMensuales: response.charts.tendenciasMensuales.length
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error en getFrontendMetrics:', error);
    res.status(500).json({
      message: 'Error obteniendo métricas del frontend',
      error: error.message
    });
  }
};

// Nuevo método para obtener top de sectores
exports.getTopSectores = async (req, res) => {
  try {
    console.log('🏆 Obteniendo top de sectores...');
    
    const { year, limit = 5, origen } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentLimit = parseInt(limit);
    
    const queryTimeout = 5000;
    
    // Construir filtros para la vista unificada
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    // Mapear valores de origen a los valores reales en la base de datos
    const sourceValue = mapOrigenToSource(origen);
    
    if (sourceValue) {
      whereClause += ' AND source COLLATE utf8mb4_unicode_ci = ?';
      params.push(sourceValue);
    }
    
    // Consulta optimizada para top sectores
    const [topSectoresResult] = await sequelize.query(`
      SELECT 
        nombreSector as sector_nombre,
        COUNT(DISTINCT idOrdenServicio) as total_planillas,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantLimpiar), 0) as total_pabellones_limpiados,
        COALESCE(SUM(mts2), 0) as total_mts2,
        COALESCE(SUM(cantidadDano), 0) as total_danos,
        COUNT(DISTINCT nombreOperador) as total_operadores,
        COUNT(DISTINCT nroMaquina) as total_maquinas
      FROM vw_ordenes_unificada_completa
      ${whereClause}
      AND nombreSector IS NOT NULL AND nombreSector != ''
      GROUP BY nombreSector
      ORDER BY total_pabellones DESC
      LIMIT ?
    `, { 
      replacements: [...params, currentLimit],
      timeout: queryTimeout 
    });
    
    // Calcular estadísticas generales
    const [estadisticasGenerales] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT nombreSector) as total_sectores,
        SUM(cantidadPabellones) as total_pabellones_global,
        SUM(cantLimpiar) as total_pabellones_limpiados_global,
        SUM(mts2) as total_mts2_global,
        SUM(cantidadDano) as total_danos_global
      FROM vw_ordenes_unificada_completa
      ${whereClause}
    `, { 
      replacements: params,
      timeout: queryTimeout 
    });
    
    const estadisticas = estadisticasGenerales[0];
    
    // Formatear respuesta
    const topSectores = topSectoresResult.map((sector, index) => {
      const porcentajePabellones = estadisticas.total_pabellones_global > 0 ? 
        ((sector.total_pabellones / estadisticas.total_pabellones_global) * 100).toFixed(1) : 0;
      
      const porcentajeMts2 = estadisticas.total_mts2_global > 0 ? 
        ((sector.total_mts2 / estadisticas.total_mts2_global) * 100).toFixed(1) : 0;
      
      const eficiencia = sector.total_pabellones > 0 ? 
        ((sector.total_pabellones_limpiados / sector.total_pabellones) * 100).toFixed(1) : 0;
      
      return {
        posicion: index + 1,
        nombre: sector.sector_nombre,
        totalPlanillas: parseInt(sector.total_planillas),
        totalPabellones: parseInt(sector.total_pabellones),
        totalPabellonesLimpiados: parseInt(sector.total_pabellones_limpiados),
        totalMts2: parseFloat(sector.total_mts2),
        totalDanos: parseInt(sector.total_danos || 0),
        totalOperadores: parseInt(sector.total_operadores),
        totalMaquinas: parseInt(sector.total_maquinas),
        porcentajePabellones: parseFloat(porcentajePabellones),
        porcentajeMts2: parseFloat(porcentajeMts2),
        eficiencia: parseFloat(eficiencia),
        // Formatear para mostrar
        pabellonesFormateado: sector.total_pabellones.toLocaleString(),
        mts2Formateado: formatAreaValue(sector.total_mts2),
        eficienciaFormateada: `${eficiencia}%`
      };
    });
    
    const response = {
      topSectores,
      estadisticas: {
        totalSectores: parseInt(estadisticas.total_sectores || 0),
        totalPabellonesGlobal: parseInt(estadisticas.total_pabellones_global || 0),
        totalPabellonesLimpiadosGlobal: parseInt(estadisticas.total_pabellones_limpiados_global || 0),
        totalMts2Global: parseFloat(estadisticas.total_mts2_global || 0),
        totalDanosGlobal: parseInt(estadisticas.total_danos_global || 0),
        eficienciaGlobal: estadisticas.total_pabellones_global > 0 ? 
          ((estadisticas.total_pabellones_limpiados_global / estadisticas.total_pabellones_global) * 100).toFixed(1) : 0
      },
      metadata: {
        year: currentYear,
        limit: currentLimit,
        origen: origen || 'todos',
        timestamp: new Date().toISOString(),
        fuente: 'vw_ordenes_unificada_completa'
      }
    };
    
    console.log(`✅ Top ${currentLimit} sectores obtenidos exitosamente`);
    console.log(`📊 Total sectores activos: ${response.estadisticas.totalSectores}`);
    console.log(`🏗️ Total pabellones global: ${response.estadisticas.totalPabellonesGlobal.toLocaleString()}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo top de sectores:', error);
    res.status(500).json({
      error: 'Error al obtener top de sectores',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};