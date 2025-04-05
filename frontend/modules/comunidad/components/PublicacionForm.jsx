import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/nuevaPublicacionStyles';

const PublicacionForm = ({ 
  asunto, 
  setAsunto, 
  contenido, 
  setContenido, 
  onPublicar, 
  onCancel, 
  loading 
}) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Asunto *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el asunto de su publicación"
        value={asunto}
        onChangeText={setAsunto}
        maxLength={100}
      />

      <Text style={styles.label}>Contenido *</Text>
      <TextInput
        style={styles.contentInput}
        placeholder="Escriba el contenido de su publicación aquí..."
        value={contenido}
        onChangeText={setContenido}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.publishButton, (!asunto.trim() || !contenido.trim()) && styles.publishButtonDisabled]}
        onPress={onPublicar}
        disabled={loading || !asunto.trim() || !contenido.trim()}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.publishButtonText}>Publicar</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PublicacionForm;
