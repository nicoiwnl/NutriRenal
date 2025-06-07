/**
 * Utilidades para formatear valores en la aplicación
 */

/**
 * Formatea un valor nutricional con su unidad
 * @param {number|string} valor - El valor nutricional a formatear
 * @param {string} unidad - La unidad de medida (mg, g, kcal, etc.)
 * @param {number} decimales - Número de decimales a mostrar
 * @returns {string} Valor formateado con su unidad
 */
export const formatNutritionalValue = (valor, unidad = '', decimales = 0) => {
  // Si el valor es null, undefined o NaN
  if (valor == null || isNaN(valor)) {
    return `0 ${unidad}`.trim();
  }
  
  // Convertir a número si es un string
  let numericValue = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
  
  // Si es un valor muy pequeño, mostrar hasta 2 decimales
  if (numericValue !== 0 && Math.abs(numericValue) < 1) {
    decimales = 2;
  }
  
  // Formatear el número (redondeando al número especificado de decimales)
  const formattedValue = numericValue.toFixed(decimales);
  
  // Eliminar .00 si no hay decimales significativos
  const cleanedValue = parseFloat(formattedValue).toString();
  
  // Devolver el valor formateado con su unidad en minúsculas
  return `${cleanedValue} ${unidad.toLowerCase()}`.trim();
};

/**
 * Formatea un valor de energía en kilocalorías
 * @param {number|string} valor - El valor de energía a formatear
 * @returns {string} Valor formateado con kcal
 */
export const formatEnergia = (valor) => {
  return formatNutritionalValue(valor, 'kcal');
};

/**
 * Formatea un valor de minerales en miligramos
 * @param {number|string} valor - El valor a formatear
 * @returns {string} Valor formateado con mg
 */
export const formatMinerales = (valor) => {
  return formatNutritionalValue(valor, 'mg');
};

/**
 * Formatea un valor de macronutrientes en gramos
 * @param {number|string} valor - El valor a formatear
 * @returns {string} Valor formateado con g
 */
export const formatMacronutrientes = (valor) => {
  return formatNutritionalValue(valor, 'g', 1);
};
