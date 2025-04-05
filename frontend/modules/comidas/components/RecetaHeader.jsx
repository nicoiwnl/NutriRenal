import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/recetaDetailStyles';

const RecetaHeader = ({ title, onShare }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.recetaTitle}>{title}</Text>
      <TouchableOpacity onPress={onShare} style={styles.shareButton}>
        <MaterialIcons name="share" size={24} color="#690B22" />
      </TouchableOpacity>
    </View>
  );
};

export default RecetaHeader;
