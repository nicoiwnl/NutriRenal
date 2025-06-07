// Configuración centralizada para endpoints de API y URLs base

import { Platform } from 'react-native';

// Base URLs para diferentes entornos
export const BASE_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000'
  : 'http://192.168.1.24:8000';
  
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
  MIS_ANALISIS: (userId) => `${API_BASE}/analisis-imagen/?persona_id=${userId}&id_persona=${userId}&usuario_id=${userId}`,
  ANALISIS_SELECCIONES: `${API_BASE}/analisis-imagen/selecciones`, // New endpoint for saving food selections
  
  // Alimentos
  ALIMENTOS: `${API_BASE}/alimentos/`,
  BUSCAR_ALIMENTO: `${API_BASE}/alimentos/buscar/`,
  ALIMENTOS_VARIANTES: (termino) => `${API_BASE}/alimentos/variantes/${encodeURIComponent(termino)}/`,
  
  // Registros de comida
  REGISTRAR_CONSUMO: `${API_BASE}/registros-alimentos/`, // Corregida la ruta
};

// Función para obtener la URL completa de una imagen
export const getImageUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  
  // Verificar si la ruta comienza con "analisis_comida" o algún otro directorio específico
  if (relativePath.includes('analisis_comida')) {
    // Ruta corregida para archivos de análisis de comida
    return `${BASE_URL}/media/${relativePath}`;
  }
  
  // Eliminar barras diagonales al inicio si existen
  const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  return `${BASE_URL}/${cleanPath}`; // Asegurar formato correcto
};
