import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/comunidadStyles';

const MyPublicationsHeader = ({ onBackPress, onNewPublicationPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBackPress}
      >
        <MaterialIcons name="arrow-back" size={24} color="#690B22" />
      </TouchableOpacity>

      <Text style={styles.title}>Mis Publicaciones</Text>
      
      <TouchableOpacity
        style={styles.newButton}
        onPress={onNewPublicationPress}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.newButtonText}>Nueva</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyPublicationsHeader;
