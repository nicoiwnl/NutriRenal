// Este archivo puede ya existir o ser una adición nueva para centralizar endpoints

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  FORGOT_PASSWORD: '/auth/password-reset/',
  
  // Alimentos
  ALIMENTOS: '/alimentos/',
  BUSCAR_ALIMENTO: '/buscar-alimento/',
  CATEGORIAS_ALIMENTO: '/categorias-alimento/',
  
  // Análisis de imágenes
  ANALIZAR_IMAGEN: '/analizar-imagen/',
  ANALISIS_PERSONA: (id) => `/analisis-persona/${id}/`,
  
  // Registros de comidas
  REGISTROS_COMIDA: '/registros-comida/',
};

export default API_ENDPOINTS;
