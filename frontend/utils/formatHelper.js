/**
 * Normaliza un valor decimal aceptando tanto comas como puntos
 * @param {string} value - Valor a normalizar
 * @returns {string} - Valor normalizado con punto como separador decimal
 */
export const normalizarDecimal = (value) => {
  if (!value) return '';
  // Reemplazar comas por puntos y eliminar caracteres no numéricos excepto el punto
  return value.replace(',', '.').replace(/[^\d.]/g, '');
};

/**
 * Formatea un número para mostrar siempre dos decimales
 * @param {number|string} value - Valor a formatear
 * @returns {string} - Valor formateado con dos decimales
 */
export const formatearDecimal = (value) => {
  if (!value) return '0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
};

/**
 * Formatea la altura para mostrarla correctamente
 * @param {number|string} altura - Valor de altura en metros
 * @returns {string} - Altura formateada (ej: "1.70 m")
 */
export const formatearAltura = (altura) => {
  return `${formatearDecimal(altura)} m`;
};

/**
 * Formatea el peso para mostrarlo correctamente
 * @param {number|string} peso - Valor de peso en kilogramos
 * @returns {string} - Peso formateado (ej: "70.50 kg")
 */
export const formatearPeso = (peso) => {
  return `${formatearDecimal(peso)} kg`;
};
