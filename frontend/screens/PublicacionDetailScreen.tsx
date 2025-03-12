import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPublicacionById,
  getComentariosByPublicacion,
  crearComentario,
  getRespuestasByComentario,
  crearRespuesta
} from '../services/comunidadService';
import { getImageUrl } from '../utils/imageHelper';

export default function PublicacionDetailScreen({ route, navigation }) {
  const { publicacionId } = route.params;
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setPersonaId(parsed.persona_id);
          
          // Obtener foto de perfil e información adicional del usuario
          try {
            const personaResponse = await fetch(`/api/personas/${parsed.persona_id}/`);
            const personaData = await personaResponse.json();
            setUserName(`${personaData.nombres} ${personaData.apellidos}`);
            setUserImage(personaData.foto_perfil);
          } catch (personaError) {
            console.error('Error obteniendo datos de la persona:', personaError);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
    cargarDatosPublicacion();
  }, [publicacionId]);

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
      await cargarComentarios();
      Alert.alert('Éxito', 'Su respuesta ha sido publicada');
    } catch (error) {
      console.error('Error al publicar respuesta:', error);
      Alert.alert('Error', 'No se pudo publicar la respuesta');
    } finally {
      setCommentLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosPublicacion();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando publicación...</Text>
      </View>
    );
  }

  if (!publicacion) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#690B22" />
        <Text style={styles.errorText}>La publicación no está disponible</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver a la comunidad</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.authorContainer}>
                <Image
                  source={{ uri: getImageUrl(publicacion.autor_foto, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }}
                  style={styles.authorImage}
                  resizeMode="cover"
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{publicacion.autor_nombre || 'Usuario'}</Text>
                  <Text style={styles.publicationDate}>{formatDate(publicacion.fecha_creacion)}</Text>
                </View>
              </View>
              
              <Text style={styles.asunto}>{publicacion.asunto}</Text>
              <Text style={styles.contenido}>{publicacion.contenido}</Text>
            </Card.Content>
          </Card>

          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Comentarios ({comentarios.length})</Text>
            
            {/* Formulario para añadir comentarios */}
            <Card style={styles.commentFormCard}>
              <Card.Content>
                <View style={styles.commentForm}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Escribe un comentario..."
                    multiline
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity 
                    style={[styles.commentButton, !newComment.trim() && styles.commentButtonDisabled]}
                    onPress={handlePublishComment}
                    disabled={!newComment.trim() || commentLoading}
                  >
                    {commentLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.commentButtonText}>Publicar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>

            {/* Lista de comentarios */}
            {comentarios.length > 0 ? (
              comentarios.map((comentario) => (
                <Card key={comentario.id} style={styles.commentCard}>
                  <Card.Content>
                    <View style={styles.commentHeader}>
                      <Image
                        source={{ uri: getImageUrl(comentario.autor_foto, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }}
                        style={styles.commentAuthorImage}
                        resizeMode="cover"
                      />
                      <View>
                        <Text style={styles.commentAuthorName}>{comentario.autor_nombre || 'Usuario'}</Text>
                        <Text style={styles.commentDate}>{formatDate(comentario.fecha_creacion)}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.commentContent}>{comentario.contenido}</Text>
                    
                    <TouchableOpacity 
                      style={styles.replyButton}
                      onPress={() => setReplyingTo(comentario.id)}
                    >
                      <MaterialIcons name="reply" size={16} color="#690B22" />
                      <Text style={styles.replyButtonText}>Responder</Text>
                    </TouchableOpacity>

                    {/* Respuestas al comentario */}
                    {comentario.respuestas && comentario.respuestas.length > 0 && (
                      <View style={styles.repliesContainer}>
                        {comentario.respuestas.map((respuesta) => (
                          <View key={respuesta.id} style={styles.replyItem}>
                            <View style={styles.replyHeader}>
                              <Image
                                source={{ uri: getImageUrl(respuesta.autor_foto, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }}
                                style={styles.replyAuthorImage}
                                resizeMode="cover"
                              />
                              <View>
                                <Text style={styles.replyAuthorName}>{respuesta.autor_nombre || 'Usuario'}</Text>
                                <Text style={styles.replyDate}>{formatDate(respuesta.fecha_creacion)}</Text>
                              </View>
                            </View>
                            <Text style={styles.replyContent}>{respuesta.contenido}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Formulario de respuesta (visible solo cuando se está respondiendo a este comentario) */}
                    {replyingTo === comentario.id && (
                      <View style={styles.replyForm}>
                        <TextInput
                          style={styles.replyInput}
                          placeholder="Escribe tu respuesta..."
                          multiline
                          value={replyContent}
                          onChangeText={setReplyContent}
                        />
                        <View style={styles.replyFormButtons}>
                          <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                          >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.sendButton, !replyContent.trim() && styles.sendButtonDisabled]}
                            onPress={handleReply}
                            disabled={!replyContent.trim() || commentLoading}
                          >
                            {commentLoading ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Text style={styles.sendButtonText}>Enviar</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))
            ) : (
              <View style={styles.noCommentsContainer}>
                <MaterialIcons name="chat" size={40} color="#CCCCCC" />
                <Text style={styles.noCommentsText}>Aún no hay comentarios</Text>
                <Text style={styles.noCommentsSubText}>¡Sé el primero en dejar tu opinión!</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 10,
    borderRadius: 8,
    elevation: 2,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  publicationDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  asunto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 10,
  },
  contenido: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentSection: {
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  commentFormCard: {
    marginBottom: 15,
    elevation: 2,
  },
  commentForm: {
    flexDirection: 'column',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  commentButton: {
    backgroundColor: '#690B22',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: 120,
  },
  commentButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  commentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentCard: {
    marginBottom: 15,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAuthorImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 5,
  },
  replyButtonText: {
    fontSize: 13,
    color: '#690B22',
    marginLeft: 5,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 10,
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    paddingLeft: 15,
  },
  replyItem: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAuthorImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  replyAuthorName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  replyDate: {
    fontSize: 11,
    color: '#888',
  },
  replyContent: {
    fontSize: 14,
    color: '#333',
  },
  replyForm: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  replyFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#bbb',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
    width: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#690B22',
    padding: 8,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  backButton: {
    backgroundColor: '#690B22',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noCommentsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginTop: 10,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 10,
  },
  noCommentsSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  }
});
