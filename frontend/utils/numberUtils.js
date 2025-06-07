/**
 * Convierte un valor a número de forma segura
 * @param {any} value - El valor a convertir
 * @return {number} - El valor numérico o 0 si no es válido
 */
export const parseNumeric = (value) => {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return 0;
  }
  
  // Convert to number
  const num = Number(value);
  
  // Check if it's a valid number
  if (isNaN(num)) {
    return 0;
  }
  
  return num;
};

/**
 * Formatea un número para mostrar solo 1 decimal si es necesario
 * @param {number} num - Número a formatear
 * @return {string} - Número formateado
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  const parsed = parseNumeric(num);
  return Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(1);
};

export default {
  parseNumeric,
  formatNumber
};
