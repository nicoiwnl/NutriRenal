import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/comunidadStyles';

const EmptyMyPublicationsView = ({ onCreatePress }) => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="post-add" size={60} color="#690B22" />
      <Text style={styles.emptyText}>Aún no has creado publicaciones</Text>
      <Text style={styles.emptySubText}>Comparte tus experiencias y conocimientos con la comunidad</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={onCreatePress}
      >
        <Text style={styles.emptyButtonText}>Crear mi primera publicación</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyMyPublicationsView;
