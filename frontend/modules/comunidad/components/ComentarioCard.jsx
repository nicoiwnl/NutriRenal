import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getImageUrl } from '../../../utils/imageHelper';
import styles from '../styles/publicacionDetailStyles';
import RespuestaCard from './RespuestaCard';
import RespuestaForm from './RespuestaForm';

const ComentarioCard = ({ 
  comentario, 
  formatDate, 
  replyingTo, 
  setReplyingTo, 
  replyContent, 
  setReplyContent, 
  handleReply, 
  commentLoading 
}) => {
  return (
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
              <RespuestaCard 
                key={respuesta.id} 
                respuesta={respuesta} 
                formatDate={formatDate} 
              />
            ))}
          </View>
        )}

        {/* Formulario de respuesta (visible solo cuando se está respondiendo a este comentario) */}
        {replyingTo === comentario.id && (
          <RespuestaForm
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onCancel={() => {
              setReplyingTo(null);
              setReplyContent('');
            }}
            onSend={handleReply}
            isLoading={commentLoading}
          />
        )}
      </Card.Content>
    </Card>
  );
};

export default ComentarioCard;
