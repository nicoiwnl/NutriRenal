import api from '../api';

export const getForos = async () => {
  try {
    console.log("Obteniendo foros...");
    const response = await api.get('/foros/');
    console.log(`Foros obtenidos: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener foros:', error);
    throw error;
  }
};

export const getForosSuscritos = async (personaId) => {
  try {
    console.log(`Obteniendo foros suscritos para persona ${personaId}...`);
    const response = await api.get(`/foro-suscripciones/?persona=${personaId}`);
    console.log(`Suscripciones obtenidas: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener foros suscritos:', error);
    throw error;
  }
};

export const suscribirAForo = async (foroId, personaId, notificaciones = true) => {
  try {
    console.log(`Suscribiendo persona ${personaId} al foro ${foroId}...`);
    const response = await api.post('/suscribir-foro/', {
      foro_id: foroId,
      persona_id: personaId,
      notificaciones
    });
    console.log('Suscripción exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al suscribirse al foro:', error);
    throw error;
  }
};

export const desuscribirDeForo = async (foroId, personaId) => {
  try {
    console.log(`Desuscribiendo persona ${personaId} del foro ${foroId}...`);
    const response = await api.delete('/desuscribir-foro/', {
      params: {
        foro_id: foroId,
        persona_id: personaId
      }
    });
    console.log('Desuscripción exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al desuscribirse del foro:', error);
    throw error;
  }
};

export const getPublicacionesPorForo = async (foroId) => {
  try {
    console.log(`Obteniendo publicaciones para el foro ${foroId}...`);
    const response = await api.get(`/publicaciones/?foro=${foroId}`);
    console.log(`Publicaciones obtenidas: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener publicaciones por foro:', error);
    throw error;
  }
};

export default {
  getForos,
  getForosSuscritos,
  suscribirAForo,
  desuscribirDeForo,
  getPublicacionesPorForo
};
