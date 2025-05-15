/**
 * Formatea una fecha mostrando día, mes, año, hora y minutos
 * @param {string|Date} dateString - Fecha a formatear
 * @param {boolean} includeTime - Si se debe incluir la hora y minutos
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return '';
  
  try {
    // Opciones base
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    };
    
    // Si se requiere incluir la hora
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return String(dateString);
  }
};

/**
 * Formatea la hora de una fecha
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} - Hora formateada (HH:MM)
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return '';
  }
};

export default {
  formatDate,
  formatTime
};
