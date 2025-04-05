import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import styles from '../styles/publicacionDetailStyles';

const RespuestaForm = ({ replyContent, setReplyContent, onCancel, onSend, isLoading }) => {
  return (
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
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sendButton, !replyContent.trim() && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!replyContent.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.sendButtonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RespuestaForm;
