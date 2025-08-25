/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea un número como moneda chilena
 * @param {number} value - Valor a formatear
 * @param {boolean} showCurrency - Si mostrar el símbolo de moneda
 * @returns {string} Valor formateado
 */
export const formatCurrency = (value, showCurrency = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return showCurrency ? '$0' : '0';
  }
  
  const formatter = new Intl.NumberFormat('es-CL', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(value);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('es-CL').format(value);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea un valor monetario para mostrar en KPIs
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado para KPIs
 */
export const formatKPICurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }
  
  // Para valores grandes, usar formato abreviado
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `$${millions.toFixed(1)}M`;
  } else if (value >= 1000) {
    const thousands = value / 1000;
    return `$${thousands.toFixed(1)}K`;
  } else {
    return formatCurrency(value);
  }
};
