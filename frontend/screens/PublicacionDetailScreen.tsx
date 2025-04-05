import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getImageUrl } from '../utils/imageHelper';

// Importar componentes y hooks del módulo
import ComentarioCard from '../modules/comunidad/components/ComentarioCard';
import ComentarioForm from '../modules/comunidad/components/ComentarioForm';
import usePublicacionDetail from '../modules/comunidad/hooks/usePublicacionDetail';
import styles from '../modules/comunidad/styles/publicacionDetailStyles';

export default function PublicacionDetailScreen({ route, navigation }) {
  const { publicacionId } = route.params;
  
  // Usar el hook personalizado
  const {
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
    commentLoading,
    handlePublishComment,
    handleReply,
    onRefresh,
    formatDate
  } = usePublicacionDetail(publicacionId, navigation);

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
            <ComentarioForm 
              newComment={newComment}
              setNewComment={setNewComment}
              onPublish={handlePublishComment}
              isLoading={commentLoading}
            />

            {/* Lista de comentarios */}
            {comentarios.length > 0 ? (
              comentarios.map((comentario) => (
                <ComentarioCard 
                  key={comentario.id}
                  comentario={comentario}
                  formatDate={formatDate}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleReply={handleReply}
                  commentLoading={commentLoading}
                />
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
