/**
 * Utilidades para transformar datos del backend al formato requerido por los componentes de gráficos
 */

/**
 * Convierte un objeto plano a array de objetos para gráficos
 * @param {Object} data - Objeto plano { "key": value }
 * @param {string} nameKey - Nombre de la propiedad para el nombre
 * @param {string} valueKey - Nombre de la propiedad para el valor
 * @returns {Array} Array de objetos [{ nameKey: "key", valueKey: value }]
 */
export const objectToArray = (data, nameKey = 'nombre', valueKey = 'cantidad') => {
  if (!data || typeof data !== 'object') return [];
  
  return Object.entries(data).map(([key, value]) => ({
    [nameKey]: key,
    [valueKey]: value
  }));
};

/**
 * Convierte datos de meses del backend al formato requerido por BarChartKPI
 * @param {Array} porMes - Array de objetos [{ mes: 1, cantidad: 112, nombreMes: "enero" }, ...]
 * @returns {Array} Array de objetos [{ nombreMes: "Enero", cantidad: 112 }, ...]
 */
export const transformMesesData = (porMes) => {
  if (!porMes || !Array.isArray(porMes)) return [];
  
  return porMes
    .sort((a, b) => a.mes - b.mes) // Ordenar por número de mes
    .map(item => ({
      nombreMes: item.nombreMes ? item.nombreMes.charAt(0).toUpperCase() + item.nombreMes.slice(1) : `Mes ${item.mes}`,
      cantidad: parseInt(item.cantidad) || 0
    }));
};

/**
 * Convierte datos de zonas del backend al formato requerido por DonutChartKPI
 * @param {Array} porZona - Array de objetos [{ zona: "SAN IGNACIO", cantidad: 161 }, ...]
 * @returns {Array} Array de objetos [{ zona: "SAN IGNACIO", cantidad: 161 }, ...]
 */
export const transformZonasData = (porZona) => {
  if (!porZona || !Array.isArray(porZona)) return [];
  
  return porZona
    .sort((a, b) => (parseInt(b.cantidad) || 0) - (parseInt(a.cantidad) || 0)) // Ordenar por cantidad descendente
    .map(item => ({
      zona: item.zona || 'Sin zona',
      cantidad: parseInt(item.cantidad) || 0
    }));
};

/**
 * Convierte datos de tipos del backend al formato requerido por DonutChartKPI
 * @param {Array} porTipo - Array de objetos [{ tipo: "INFRAESTRUCTURA", cantidad: 1159 }, ...]
 * @returns {Array} Array de objetos [{ tipo: "INFRAESTRUCTURA", cantidad: 1159 }, ...]
 */
export const transformTiposData = (porTipo) => {
  if (!porTipo || !Array.isArray(porTipo)) return [];
  
  return porTipo
    .sort((a, b) => (parseInt(b.cantidad) || 0) - (parseInt(a.cantidad) || 0)) // Ordenar por cantidad descendente
    .map(item => ({
      tipo: item.tipo || 'Sin tipo',
      cantidad: parseInt(item.cantidad) || 0
    }));
};

/**
 * Convierte datos de operadores del backend al formato requerido por tablas
 * @param {Array} porOperador - Array de objetos [{ operador: "VICTOR MANUEL ZUNIGA POZO", cantidad: 192 }, ...]
 * @returns {Array} Array de objetos [{ operador: "VICTOR MANUEL ZUNIGA POZO", cantidad: 192 }, ...]
 */
export const transformOperadoresData = (porOperador) => {
  if (!porOperador || !Array.isArray(porOperador)) return [];
  
  return porOperador
    .sort((a, b) => (parseInt(b.cantidad) || 0) - (parseInt(a.cantidad) || 0)) // Ordenar por cantidad descendente
    .map(item => ({
      operador: item.operador || 'Sin operador',
      cantidad: parseInt(item.cantidad) || 0
    }));
};

/**
 * Convierte datos de máquinas del backend al formato requerido por tablas
 * @param {Array} porMaquina - Array de objetos [{ maquina: "Maquina Nro. 65", cantidad: 189 }, ...]
 * @returns {Array} Array de objetos [{ maquina: "Maquina Nro. 65", cantidad: 189 }, ...]
 */
export const transformMaquinasData = (porMaquina) => {
  if (!porMaquina || !Array.isArray(porMaquina)) return [];
  
  return porMaquina
    .sort((a, b) => (parseInt(b.cantidad) || 0) - (parseInt(a.cantidad) || 0)) // Ordenar por cantidad descendente
    .map(item => ({
      maquina: item.maquina || 'Sin máquina',
      cantidad: parseInt(item.cantidad) || 0
    }));
};

/**
 * Convierte datos de pabellones del backend al formato requerido por tablas
 * @param {Array} porPabellon - Array de objetos [{ pabellon: "4", cantidad: 113 }, ...]
 * @returns {Array} Array de objetos [{ pabellon: "4", cantidad: 113 }, ...]
 */
export const transformPabellonesData = (porPabellon) => {
  if (!porPabellon || !Array.isArray(porPabellon)) return [];
  
  return porPabellon
    .sort((a, b) => (parseInt(b.cantidad) || 0) - (parseInt(a.cantidad) || 0)) // Ordenar por cantidad descendente
    .map(item => ({
      pabellon: item.pabellon || 'Sin pabellón',
      cantidad: parseInt(item.cantidad) || 0
    }));
};

/**
 * Convierte datos de descripciones del backend al formato requerido por tablas
 * @param {Array} porDescripcion - Array de objetos [{ descripcion: "DAÑO ESTRUCTURAL", cantidad: 45 }, ...]
 * @returns {Array} Array de objetos [{ descripcion: "DAÑO ESTRUCTURAL", cantidad: 45 }, ...]
 */
export const transformDescripcionesData = (porDescripcion) => {
  if (!porDescripcion || !Array.isArray(porDescripcion)) return [];
  
  return porDescripcion
    .sort((a, b) => (parseInt(b.cantidad) || 0) - (parseInt(a.cantidad) || 0)) // Ordenar por cantidad descendente
    .map(item => ({
      descripcion: item.descripcion || 'Sin descripción',
      cantidad: parseInt(item.cantidad) || 0
    }));
};

/**
 * Transforma todos los datos del backend al formato requerido por los componentes
 * @param {Object} datos - Datos completos del backend
 * @returns {Object} Datos transformados
 */
export const transformAllData = (datos) => {
  if (!datos) return {};
  
  return {
    ...datos,
    porMes: transformMesesData(datos.porMes),
    porZona: transformZonasData(datos.porZona),
    porTipo: transformTiposData(datos.porTipo),
    porOperador: transformOperadoresData(datos.porOperador),
    porMaquina: transformMaquinasData(datos.porMaquina),
    porPabellon: transformPabellonesData(datos.porPabellon),
    porDescripcion: transformDescripcionesData(datos.porDescripcion)
  };
}; 

/**
 * Aproxima valores grandes para mejor legibilidad
 * @param {number} value - El valor a aproximar
 * @param {number} decimals - Número de decimales (por defecto 1)
 * @returns {string} - Valor aproximado con sufijo (K, M, B)
 */
export const approximateLargeValue = (value, decimals = 1) => {
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

/**
 * Formatea valores de área (m²) con aproximación
 * @param {number} value - El valor en m²
 * @returns {string} - Valor formateado con unidad
 */
export const formatAreaValue = (value) => {
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

/**
 * Formatea valores de litros con aproximación
 * @param {number} value - El valor en litros
 * @returns {string} - Valor formateado con unidad
 */
export const formatLitersValue = (value) => {
  if (!value || value === 0) return '0 L';
  
  const num = parseFloat(value);
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K L';
  } else {
    return num.toLocaleString() + ' L';
  }
};

/**
 * Formatea valores de kilómetros con aproximación
 * @param {number} value - El valor en km
 * @returns {string} - Valor formateado con unidad
 */
export const formatKmValue = (value) => {
  if (!value || value === 0) return '0 km';
  
  const num = parseFloat(value);
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M km';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K km';
  } else {
    return num.toLocaleString() + ' km';
  }
};

/**
 * Formatea valores de litros por m² con precisión adecuada
 * @param {number} value - El valor en L/m²
 * @returns {string} - Valor formateado con unidad
 */
export const formatLitersPerM2Value = (value) => {
  if (!value || value === 0) return '0 L/m²';
  
  const num = parseFloat(value);
  
  // Para valores muy pequeños, mostrar más decimales
  if (num < 0.0001) {
    return num.toFixed(6) + ' L/m²';
  } else if (num < 0.001) {
    return num.toFixed(5) + ' L/m²';
  } else if (num < 0.01) {
    return num.toFixed(4) + ' L/m²';
  } else if (num < 1) {
    return num.toFixed(3) + ' L/m²';
  } else {
    return num.toFixed(2) + ' L/m²';
  }
};

/**
 * Formatea valores de litros por km con precisión adecuada
 * @param {number} value - El valor en L/km
 * @returns {string} - Valor formateado con unidad
 */
export const formatLitersPerKmValue = (value) => {
  if (!value || value === 0) return '0 L/km';
  
  const num = parseFloat(value);
  
  // Para valores de rendimiento, mostrar 2 decimales
  return num.toFixed(2) + ' L/km';
};

/**
 * Transforma los datos de estadísticas de daños del backend al formato del frontend
 * @param {Object} data - Datos del backend
 * @returns {Object} - Datos transformados para el frontend
 */
export const transformDanoStats = (data) => {
  if (!data) return null;

  return {
    // KPIs principales - usar resumen del backend
    resumen: data.resumen || {
      total_ordenes_con_danos: 0,
      total_danos: 0,
      tipos_danos_diferentes: 0,
      sectores_con_danos: 0
    },
    
    // Datos para gráficos - mapear correctamente desde el backend con campos específicos
    porTipo: (data.danosPorTipo || []).map(item => ({
      tipo: item.tipo || 'Sin tipo',
      cantidad: parseInt(item.cantidad) || 0,
      total: parseInt(item.total_danos) || 0
    })),
    porZona: (data.danosPorSector || []).map(item => ({
      zona: item.sector || 'Sin sector',
      cantidad: parseInt(item.cantidad) || 0,
      total: parseInt(item.total_danos) || 0
    })),
    porSupervisor: (data.danosPorSupervisor || []).map(item => ({
      supervisor: item.supervisor || 'Sin supervisor',
      cantidad: parseInt(item.cantidad) || 0,
      total: parseInt(item.total_danos) || 0
    })),
    porMes: (data.evolucion || []).map(item => {
      // Convertir formato "2025-01" a nombre de mes
      const mesNumero = parseInt(item.mes?.split('-')[1]) || 1;
      const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const nombreMes = nombresMeses[mesNumero - 1] || 'Sin mes';
      
      return {
        nombreMes: nombreMes,
        cantidad: parseInt(item.cantidad_ordenes) || 0,
        total: parseInt(item.total_danos) || 0
      };
    }),
    evolucion: data.evolucion || [],
    
    // Generar datos de heatmap basados en la evolución mensual
    heatmapData: (data.evolucion || []).flatMap(item => {
      const mes = parseInt(item.mes?.split('-')[1]) || 1;
      const totalDanos = parseInt(item.total_danos) || 0;
      const diasEnMes = new Date(2025, mes, 0).getDate();
      
      // Distribuir los daños a lo largo del mes de manera controlada
      const datos = [];
      let dañosAsignados = 0;
      
      // Crear array de días disponibles (excluyendo fines de semana)
      const diasDisponibles = [];
      for (let dia = 1; dia <= Math.min(diasEnMes, 31); dia++) {
        const esDiaLaboral = dia % 7 !== 0 && dia % 7 !== 6;
        if (esDiaLaboral) {
          diasDisponibles.push(dia);
        }
      }
      
      // Distribuir daños de manera más controlada
      for (let i = 0; i < diasDisponibles.length && dañosAsignados < totalDanos; i++) {
        const dia = diasDisponibles[i];
        const dañosRestantes = totalDanos - dañosAsignados;
        const diasRestantes = diasDisponibles.length - i;
        
        // Calcular daños para este día
        let dañosDelDia;
        if (i === diasDisponibles.length - 1) {
          // Último día: asignar todos los daños restantes
          dañosDelDia = dañosRestantes;
        } else {
          // Distribuir proporcionalmente
          const promedioPorDia = dañosRestantes / diasRestantes;
          dañosDelDia = Math.max(1, Math.round(promedioPorDia * (0.5 + Math.random() * 0.5)));
        }
        
        // Asegurar que no exceda el total
        dañosDelDia = Math.min(dañosDelDia, dañosRestantes);
        
        if (dañosDelDia > 0) {
          datos.push({
            day: dia,
            month: mes,
            value: dañosDelDia
          });
          dañosAsignados += dañosDelDia;
        }
      }
      
      return datos;
    }),
    
    // Datos para análisis
    tendencias: data.tendencias || [],
    distribucion: data.distribucion || {},
    alertas: data.alertas || [],
    
    // Metadatos
    metadata: {
      year: data.metadata?.year || new Date().getFullYear(),
      month: data.metadata?.month || null,
      origen: data.metadata?.origen || 'todos',
      timestamp: data.metadata?.timestamp || new Date().toISOString(),
      totalRegistros: data.metadata?.totalRegistros || 0,
      fuente: data.metadata?.fuente || 'backend'
    }
  };
}; 