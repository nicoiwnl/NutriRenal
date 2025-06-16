// Configuración centralizada para endpoints de API y URLs base

import { Platform } from 'react-native';

// Base URLs para diferentes entornos
export const BASE_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000'
  : 'http://192.168.1.28:8000';
  
export const API_BASE = `${BASE_URL}/api`;

// URL para las imágenes y media
export const MEDIA_URL = `${BASE_URL}/media`;

// Endpoints de API
export const ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_BASE}/auth/login/`,
  REGISTER: `${API_BASE}/auth/register/`,
  FORGOT_PASSWORD: `${API_BASE}/auth/password-reset/`,
  
  // Análisis de imágenes
  ANALIZAR_IMAGEN: `${API_BASE}/analizar-imagen/`,
  ANALISIS_IMAGEN: `${API_BASE}/analisis-imagen`, // Endpoint corregido para análisis de imágenes
  MIS_ANALISIS: (userId) => `${API_BASE}/analisis-imagen/?persona_id=${userId}`, // Corregido para historial de análisis  
  // Alimentos
  ALIMENTOS: `${API_BASE}/alimentos/`,
  BUSCAR_ALIMENTO: `${API_BASE}/alimentos/buscar/`,
  ALIMENTOS_VARIANTES: (termino) => `${API_BASE}/alimentos/variantes/${encodeURIComponent(termino)}/`,
  
  // Registros de comida
  REGISTRAR_CONSUMO: `${API_BASE}/registros-alimentos/`, // Corregida la ruta

  // Selecciones de análisis
  SELECCIONES_ANALISIS: `${API_BASE}/selecciones-analisis/`,
  SELECCIONES_POR_ANALISIS: (analisisId) => `${API_BASE}/selecciones-analisis/?analisis=${analisisId}`,
};

// Improved image URL helper function that adds domain when needed
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Check if it's already a full URL
  if (imagePath.startsWith('http')) {
    console.log('URL completa detectada:', imagePath);
    return imagePath;
  }
  
  // Clean up the path if it starts with /media/ or media/
  const cleanPath = imagePath.startsWith('/media/') 
    ? imagePath.substring(7) // Remove /media/ prefix
    : imagePath.startsWith('media/') 
      ? imagePath.substring(6) // Remove media/ prefix
      : imagePath;
      
  // Clean up any duplicate slashes
  const finalUrl = `${BASE_URL}/media/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
  console.log(`Creando URL para imagen: ${finalUrl}`);
  
  return finalUrl;
};
