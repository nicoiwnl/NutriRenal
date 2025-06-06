import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/publicacionDetailStyles';

const RespuestaForm = ({ replyContent, setReplyContent, onCancel, onSend, isLoading }) => {
  return (
    <View style={styles.replyFormContainer}>
      <TextInput
        style={styles.replyFormInput}
        value={replyContent}
        onChangeText={setReplyContent}
        placeholder="Escribe tu respuesta..."
        multiline
        autoFocus={true}
      />
      <View style={styles.replyFormButtons}>
        <TouchableOpacity 
          style={styles.replyFormCancel}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.replyFormCancelText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.replyFormSend,
            !replyContent.trim() && { opacity: 0.6 }
          ]}
          onPress={onSend}
          disabled={!replyContent.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="send" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.replyFormSendText}>Enviar</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RespuestaForm;
