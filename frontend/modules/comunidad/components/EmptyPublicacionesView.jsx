import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/comunidadStyles';

const EmptyPublicacionesView = ({ onCreatePress }) => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="forum" size={60} color="#690B22" />
      <Text style={styles.emptyText}>Aún no hay publicaciones</Text>
      <Text style={styles.emptySubText}>¡Sé el primero en compartir algo con la comunidad!</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={onCreatePress}
      >
        <Text style={styles.emptyButtonText}>Crear publicación</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyPublicacionesView;
