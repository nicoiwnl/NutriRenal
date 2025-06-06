import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api'; // Añadir esta importación
import {
  getPublicacionById,
  getComentariosByPublicacion,
  crearComentario,
  getRespuestasByComentario,
  crearRespuesta
} from '../../../services/comunidadService';

export default function usePublicacionDetail(publicacionId, navigation) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicacion, setPublicacion] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [personaId, setPersonaId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeCommentRef, setActiveCommentRef] = useState(null);

  // Cargar datos de usuario y publicación al iniciar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setPersonaId(parsed.persona_id);
          
          // Intentar obtener nombre y foto del usuario desde la API
          try {
            const personaResponse = await api.get(`/personas/${parsed.persona_id}/`);
            const personaData = personaResponse.data;
            setUserName(`${personaData.nombres} ${personaData.apellidos}`);
            setUserImage(personaData.foto_perfil);
          } catch (personaError) {
            console.error('Error obteniendo datos de la persona:', personaError);
            // Establecer valores por defecto incluso cuando falla la llamada a la API
            setUserName("Usuario");
            setUserImage("");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
    cargarDatosPublicacion();
  }, [publicacionId]);

  // Cargar publicación y comentarios
  const cargarDatosPublicacion = async () => {
    setLoading(true);
    try {
      // Obtener la publicación
      const publicacionData = await getPublicacionById(publicacionId);
      setPublicacion(publicacionData);
      
      // Obtener los comentarios
      await cargarComentarios();
    } catch (error) {
      console.error('Error al cargar la publicación o comentarios:', error);
      Alert.alert('Error', 'No se pudo cargar la publicación. Intente nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar comentarios y sus respuestas
  const cargarComentarios = async () => {
    try {
      const comentariosData = await getComentariosByPublicacion(publicacionId);
      
      // Para cada comentario, cargar sus respuestas
      const comentariosConRespuestas = await Promise.all(comentariosData.map(async (comentario) => {
        try {
          const respuestasData = await getRespuestasByComentario(comentario.id);
          return {
            ...comentario,
            respuestas: respuestasData
          };
        } catch (error) {
          console.error(`Error al cargar respuestas para comentario ${comentario.id}:`, error);
          return {
            ...comentario,
            respuestas: []
          };
        }
      }));
      
      setComentarios(comentariosConRespuestas);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los comentarios.');
    }
  };

  // Publicar un nuevo comentario
  const handlePublishComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'El comentario no puede estar vacío');
      return;
    }
    
    if (!personaId) {
      Alert.alert('Error', 'Debe iniciar sesión para comentar');
      return;
    }
    
    setCommentLoading(true);
    try {
      const comentarioData = {
        contenido: newComment,
        publicacion: publicacionId,
        id_persona: personaId
      };
      
      await crearComentario(comentarioData);
      setNewComment('');
      await cargarComentarios();
      Alert.alert('Éxito', 'Su comentario ha sido publicado');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      Alert.alert('Error', 'No se pudo publicar el comentario');
    } finally {
      setCommentLoading(false);
    }
  };

  // Publicar una respuesta a un comentario
  const handleReply = async () => {
    if (!replyContent.trim() || !replyingTo) {
      Alert.alert('Error', 'La respuesta no puede estar vacía');
      return;
    }
    
    if (!personaId) {
      Alert.alert('Error', 'Debe iniciar sesión para responder');
      return;
    }
    
    setCommentLoading(true);
    try {
      const respuestaData = {
        contenido: replyContent,
        comentario: replyingTo,
        id_persona: personaId
      };
      
      await crearRespuesta(respuestaData);
      setReplyContent('');
      setReplyingTo(null);
      setActiveCommentRef(null); // Resetear la referencia al comentario activo
      await cargarComentarios();
      Alert.alert('Éxito', 'Su respuesta ha sido publicada');
    } catch (error) {
      console.error('Error al publicar respuesta:', error);
      Alert.alert('Error', 'No se pudo publicar la respuesta');
    } finally {
      setCommentLoading(false);
    }
  };

  // Refrescar datos de la publicación
  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosPublicacion();
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    loading,
    refreshing,
    publicacion,
    comentarios,
    newComment,
    setNewComment,
    replyContent, 
    setReplyContent,
    replyingTo,
    setReplyingTo,
    personaId,
    userName,
    userImage,
    commentLoading,
    handlePublishComment,
    handleReply,
    onRefresh,
    formatDate,
    activeCommentRef,
    setActiveCommentRef
  };
}
