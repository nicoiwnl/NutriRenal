import api from '../api';

/**
 * Obtiene todas las publicaciones de la comunidad
 * @param {string} foroId - ID del foro (opcional)
 * @returns {Promise<Array>} - Lista de publicaciones
 */
export const getPublicaciones = async (foroId = null) => {
  try {
    let url = '/publicaciones/';
    // Si se proporciona un ID de foro, agregar el parámetro de consulta
    if (foroId) {
      url += `?foro=${foroId}`;
      console.log(`Solicitando publicaciones para foro específico: ${foroId}`);
    }
    
    console.log(`Consultando API: ${url}`);
    const response = await api.get(url);
    const publicaciones = response.data;
    
    // Enriquecer los datos con información adicional si es necesario
    if (publicaciones.length > 0) {
      console.log(`Recibidas ${publicaciones.length} publicaciones del servidor`);
      
      try {
        // Obtener todos los foros para mapear IDs a nombres
        const forosResponse = await api.get('/foros/');
        const foros = forosResponse.data || [];
        
        if (foros.length > 0) {
          // Crear mapa de ID a nombre
          const forosMap = {};
          foros.forEach(foro => {
            forosMap[foro.id] = foro.nombre;
          });
          
          // Enriquecer cada publicación con el nombre del foro
          const enriquecidas = publicaciones.map(pub => {
            const foroId = pub.foro || pub.id_foro;
            return {
              ...pub,
              foro_nombre: forosMap[foroId] || 'General'
            };
          });
          
          return enriquecidas;
        }
      } catch (e) {
        console.error('Error al obtener información de foros:', e);
      }
    }
    
    return publicaciones;
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
 * @param {string} publicacion.foro - ID del foro
 * @returns {Promise<Object>} - Publicación creada
 */
export const crearPublicacion = async (publicacion) => {
  try {
    // Asegurarse de que hay un foro seleccionado
    if (!publicacion.foro) {
      throw new Error('Se requiere seleccionar un foro');
    }
    
    const response = await api.post('/publicaciones/', publicacion);
    return response.data;
  } catch (error) {
    console.error('Error al crear publicación:', error);
    throw error;
  }
};

/**
 * Obtiene todas las publicaciones de un usuario específico
 * @param {string} personaId - ID de la persona
 * @returns {Promise<Array>} - Lista de publicaciones del usuario
 */
export const getPublicacionesByUsuario = async (personaId) => {
  try {
    const response = await api.get(`/publicaciones/?id_persona=${personaId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener publicaciones del usuario ${personaId}:`, error);
    throw error;
  }
};

/**
 * Elimina una publicación
 * @param {string} publicacionId - ID de la publicación a eliminar
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const eliminarPublicacion = async (publicacionId) => {
  try {
    console.log(`Intentando eliminar publicación con ID: ${publicacionId}`);
    
    // Ensure the ID is properly formatted (string) and not undefined
    if (!publicacionId) {
      throw new Error('ID de publicación no válido');
    }
    
    // Log the exact URL for debugging
    const url = `/publicaciones/${publicacionId}/`;
    console.log(`Sending DELETE request to: ${url}`);
    
    const response = await api.delete(url);
    console.log('Respuesta de eliminación:', response.status, response.data);
    
    // Check if the response indicates success
    if (response.status >= 200 && response.status < 300) {
      return response.data || { success: true };
    } else {
      throw new Error(`Error del servidor: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error al eliminar publicación ${publicacionId}:`, error);
    console.error('Detalles del error:', error.response?.data || error.message);
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
  getPublicacionesByUsuario,
  eliminarPublicacion,
  getComentariosByPublicacion,
  crearComentario,
  getRespuestasByComentario,
  crearRespuesta
};
