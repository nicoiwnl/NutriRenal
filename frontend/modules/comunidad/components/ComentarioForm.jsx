import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../styles/publicacionDetailStyles';

const ComentarioForm = ({ newComment, setNewComment, onPublish, isLoading }) => {
  return (
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
            onPress={onPublish}
            disabled={!newComment.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.commentButtonText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

export default ComentarioForm;
