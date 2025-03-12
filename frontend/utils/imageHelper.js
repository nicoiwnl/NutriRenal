import { Platform } from 'react-native';

// Configuración de URLs base según la plataforma
// IMPORTANTE: Ajusta esta IP a la IP de tu máquina en la red local
const WEB_BASE_URL = 'http://127.0.0.1:8000';
const MOBILE_BASE_URL = 'http://192.168.0.2:8000'; // CAMBIA ESTA IP por la IP de tu computadora en la red

/**
 * Construye la URL correcta para imágenes según la plataforma
 * @param {string} imageUrl - URL de la imagen (puede ser completa o relativa)
 * @param {string} defaultImage - URL de imagen por defecto si la principal no existe
 * @returns {string} - URL procesada según la plataforma
 */
export const getImageUrl = (imageUrl, defaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') => {
  console.log('Procesando URL de imagen:', imageUrl);
  
  // Si no hay URL o es vacía, usar la imagen por defecto
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('URL vacía, usando imagen por defecto');
    return defaultImage;
  }
  
  // Si ya es una URL externa completa (comienza con http:// o https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('Es una URL completa, usándola directamente');
    return imageUrl;
  }

  // Determinar la URL base según la plataforma
  const baseUrl = Platform.OS === 'web' ? WEB_BASE_URL : MOBILE_BASE_URL;
  console.log('Plataforma:', Platform.OS, 'usando baseURL:', baseUrl);
  
  // Limpiar la ruta para evitar dobles barras
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
  
  // Construir la URL completa
  const fullUrl = `${baseUrl}/${cleanPath}`;
  console.log('URL final:', fullUrl);
  
  return fullUrl;
};
