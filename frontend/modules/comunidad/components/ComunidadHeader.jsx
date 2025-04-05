import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/comunidadStyles';

const ComunidadHeader = ({ onMyPublicationsPress, onNewPublicationPress }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}></Text>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.misPublicacionesButton}
          onPress={onMyPublicationsPress}
        >
          <MaterialIcons name="person" size={20} color="#690B22" />
          <Text style={styles.misPublicacionesText}>Mis Publicaciones</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.newButton}
          onPress={onNewPublicationPress}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.newButtonText}>Nueva</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ComunidadHeader;
