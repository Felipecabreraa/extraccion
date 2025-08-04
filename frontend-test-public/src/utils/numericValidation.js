// Utilidades para validación numérica

/**
 * Valida y limpia valores numéricos
 * @param {string} value - Valor a validar
 * @param {string} fieldType - Tipo de campo ('integer', 'decimal', 'currency')
 * @returns {string} - Valor limpio
 */
export const validateNumericInput = (value, fieldType = 'integer') => {
  if (!value) return '';
  
  let cleanValue = value.toString();
  
  switch (fieldType) {
    case 'integer':
      // Solo números enteros
      cleanValue = cleanValue.replace(/[^0-9]/g, '');
      break;
      
    case 'decimal':
      // Números con punto decimal
      cleanValue = cleanValue.replace(/[^0-9.]/g, '');
      // Evitar múltiples puntos decimales
      const parts = cleanValue.split('.');
      if (parts.length > 2) {
        cleanValue = parts[0] + '.' + parts.slice(1).join('');
      }
      break;
      
    case 'currency':
      // Números con punto decimal para moneda
      cleanValue = cleanValue.replace(/[^0-9.]/g, '');
      const currencyParts = cleanValue.split('.');
      if (currencyParts.length > 2) {
        cleanValue = currencyParts[0] + '.' + currencyParts.slice(1).join('');
      }
      break;
      
    default:
      cleanValue = cleanValue.replace(/[^0-9]/g, '');
  }
  
  return cleanValue;
};

/**
 * Valida que el valor sea un número válido
 * @param {string} value - Valor a validar
 * @returns {boolean} - true si es válido
 */
export const isValidNumber = (value) => {
  if (!value) return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Formatea un número para mostrar
 * @param {string|number} value - Valor a formatear
 * @param {string} fieldType - Tipo de campo
 * @returns {string} - Valor formateado
 */
export const formatNumericDisplay = (value, fieldType = 'integer') => {
  if (!value) return '';
  
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  
  switch (fieldType) {
    case 'currency':
      return num.toLocaleString('es-CL');
    case 'decimal':
      return num.toString();
    default:
      return Math.floor(num).toString();
  }
}; 