/**
 * Calcula el dígito verificador de un RUT chileno
 * @param {string|number} rut - Número de RUT sin dígito verificador
 * @returns {string} - Dígito verificador (0-9 o K)
 */
export const calcularDigitoVerificador = (rut) => {
  // Convertir a string y eliminar posibles puntos y guiones
  const rutLimpio = String(rut).replace(/\./g, '').replace(/-/g, '');
  
  // Invertir los dígitos del RUT
  const rutInvertido = rutLimpio.split('').reverse().join('');
  
  let suma = 0;
  let multiplicador = 2;
  
  // Multiplicar cada dígito por la secuencia 2,3,4,5,6,7 y sumar
  for (let i = 0; i < rutInvertido.length; i++) {
    suma += parseInt(rutInvertido.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  // Calcular el dígito verificador
  const resultado = 11 - (suma % 11);
  
  // Convertir el resultado a un dígito verificador
  if (resultado === 11) return '0';
  if (resultado === 10) return 'K';
  return String(resultado);
};

/**
 * Formatea un RUT con puntos y guión
 * @param {string|number} rut - Número de RUT sin dígito verificador
 * @param {string} dv - Dígito verificador, si no se proporciona se calcula automáticamente
 * @returns {string} - RUT formateado (ej: "12.345.678-9")
 */
export const formatearRut = (rut, dv) => {
  if (!rut) return 'No disponible';
  
  // Si no se proporciona el dígito verificador, calcularlo
  const digitoVerificador = dv || calcularDigitoVerificador(rut);
  
  // Convertir a string y eliminar puntos y guiones
  const rutLimpio = String(rut).replace(/\./g, '').replace(/-/g, '');
  
  // Agregar puntos
  let rutFormateado = rutLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Agregar guión y dígito verificador
  return `${rutFormateado}-${digitoVerificador}`;
};

/**
 * Valida si un RUT chileno es válido
 * @param {string|number} rut - Número de RUT sin dígito verificador
 * @param {string} dv - Dígito verificador proporcionado
 * @returns {boolean} - true si el RUT es válido, false en caso contrario
 */
export const validarRut = (rut, dv) => {
  // Limpiar dígito verificador
  dv = String(dv).toUpperCase();
  
  // Calcular el dígito verificador correcto
  const dvCalculado = calcularDigitoVerificador(rut);
  
  // Comparar
  return dv === dvCalculado;
};
