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