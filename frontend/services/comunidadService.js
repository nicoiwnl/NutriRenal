import api from '../api';

/**
 * Obtiene todas las publicaciones de la comunidad
 * @returns {Promise<Array>} - Lista de publicaciones
 */
export const getPublicaciones = async () => {
  try {
    const response = await api.get('/publicaciones/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    throw error;
  }
};

/**
 * Obtiene una publicación específica por ID
 * @param {string} id - ID de la publicación
 * @returns {Promise<Object>} - Datos de la publicación
 */
export const getPublicacionById = async (id) => {
  try {
    const response = await api.get(`/publicaciones/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener publicación ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva publicación
 * @param {Object} publicacion - Datos de la publicación
 * @param {string} publicacion.asunto - Asunto de la publicación
 * @param {string} publicacion.contenido - Contenido de la publicación
 * @param {string} publicacion.id_persona - ID de la persona que publica
 * @returns {Promise<Object>} - Publicación creada
 */
export const crearPublicacion = async (publicacion) => {
  try {
    const response = await api.post('/publicaciones/', publicacion);
    return response.data;
  } catch (error) {
    console.error('Error al crear publicación:', error);
    throw error;
  }
};

/**
 * Obtiene comentarios para una publicación específica
 * @param {string} publicacionId - ID de la publicación
 * @returns {Promise<Array>} - Lista de comentarios
 */
export const getComentariosByPublicacion = async (publicacionId) => {
  try {
    const response = await api.get(`/comentarios/?publicacion=${publicacionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener comentarios para la publicación ${publicacionId}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo comentario en una publicación
 * @param {Object} comentario - Datos del comentario
 * @param {string} comentario.contenido - Contenido del comentario
 * @param {string} comentario.publicacion - ID de la publicación
 * @param {string} comentario.id_persona - ID de la persona que comenta
 * @returns {Promise<Object>} - Comentario creado
 */
export const crearComentario = async (comentario) => {
  try {
    const response = await api.post('/comentarios/', comentario);
    return response.data;
  } catch (error) {
    console.error('Error al crear comentario:', error);
    throw error;
  }
};

/**
 * Obtiene respuestas para un comentario específico
 * @param {string} comentarioId - ID del comentario
 * @returns {Promise<Array>} - Lista de respuestas
 */
export const getRespuestasByComentario = async (comentarioId) => {
  try {
    const response = await api.get(`/respuestas-comentario/?comentario=${comentarioId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener respuestas para el comentario ${comentarioId}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva respuesta a un comentario
 * @param {Object} respuesta - Datos de la respuesta
 * @param {string} respuesta.contenido - Contenido de la respuesta
 * @param {string} respuesta.comentario - ID del comentario
 * @param {string} respuesta.id_persona - ID de la persona que responde
 * @returns {Promise<Object>} - Respuesta creada
 */
export const crearRespuesta = async (respuesta) => {
  try {
    const response = await api.post('/respuestas-comentario/', respuesta);
    return response.data;
  } catch (error) {
    console.error('Error al crear respuesta:', error);
    throw error;
  }
};

export default {
  getPublicaciones,
  getPublicacionById,
  crearPublicacion,
  getComentariosByPublicacion,
  crearComentario,
  getRespuestasByComentario,
  crearRespuesta
};
